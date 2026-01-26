from django.core.management.base import BaseCommand
from django.utils import timezone
from contest.models import Contest, Participant
from contest.utils import fetch_contest_latest_submissions, calculate_participant_stats, API_COOLDOWN
import time
from collections import defaultdict

class Command(BaseCommand):
    help = 'Validates active contests and updates participant status periodically'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='Update interval in seconds (default: 60)'
        )

    def handle(self, *args, **options):
        interval = options['interval']
        self.stdout.write(self.style.SUCCESS(f"Starting contest updater (Interval: {interval}s)..."))

        try:
            while True:
                now = timezone.now()
                # 진행 중인 대회 찾기 (시작시간 <= 현재 <= 종료시간)
                active_contests = Contest.objects.filter(start_time__lte=now, end_time__gte=now)
                
                if not active_contests.exists():
                    self.stdout.write(f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] No active contests found. Sleeping...")
                else:
                    self.stdout.write(f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Found {active_contests.count()} active contests.")

                    for contest in active_contests:
                        self.update_contest(contest)
                        
                time.sleep(interval)
                
        except KeyboardInterrupt:
            self.stdout.write(self.style.SUCCESS("\nStopped contest updater."))

    def update_contest(self, contest):
        
        participants = Participant.objects.filter(contest=contest).select_related('user__profile')
        
        if not participants.exists():
            self.stdout.write(f" - [{contest.name}] No participants.")
            return

        self.stdout.write(f" - [{contest.name}] Updating {participants.count()} participants...")
        
        # 1. Fetch recent 1000 submissions for the contest
        time.sleep(API_COOLDOWN)
        all_submissions = fetch_contest_latest_submissions(contest.id)
        
        if not all_submissions:
            # submissions가 없어도 에러는 아니므로 그냥 리턴
            self.stdout.write(f" - No submissions fetched for contest {contest.id}")
            return
             
        if len(all_submissions) >= 1000:
            self.stdout.write(self.style.WARNING(f" - [Warning] Fetched 1000 submissions. History might be truncated."))

        # 2. Filter and group by handle
        participant_handles = set(p.user.profile.codeforces_id for p in participants)
        submissions_by_handle = defaultdict(list)
        
        for sub in all_submissions:
             if 'author' in sub and 'members' in sub['author']:
                 for member in sub['author']['members']:
                     handle = member.get('handle')
                     if handle in participant_handles:
                         submissions_by_handle[handle].append(sub)
        
        # 3. Get contest problems once
        problems = contest.problems.all().order_by('index')
        if not problems:
            self.stdout.write(f" - No problems found for contest {contest.id}")
            return
             
        updated_participants = []
        
        for participant in participants:
            handle = participant.user.profile.codeforces_id
            
            # 배치에 해당 유저의 제출이 있는 경우에만 업데이트
            # (소규모 대회 가정: 전체 기록이 1000개 이내라면 이 방식이 안전함)
            # 만약 1000개를 넘어가면 옛날 기록이 누락되어 0점 처리될 위험이 있음
            if handle in submissions_by_handle:
                user_subs = submissions_by_handle[handle]
                
                # 공통 계산 로직 사용(utils.py)
                result = calculate_participant_stats(user_subs, problems)
                
                if result:
                    participant.problem_status = result['problem_status']
                    participant.total_score = result['total_score']
                    participant.penalty = result['penalty']
                    updated_participants.append(participant)

        # DB 저장
        if updated_participants:
            Participant.objects.bulk_update(updated_participants, ['problem_status', 'total_score', 'penalty'])
            self.stdout.write(f"   -> Successfully updated {len(updated_participants)} participants (Batch Process).")
        else:
            self.stdout.write(f"   -> No updates needed.") 
