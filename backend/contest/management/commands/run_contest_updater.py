from django.core.management.base import BaseCommand
from django.utils import timezone
from contest.models import Contest, Participant
from contest.utils import fetch_participant_status
import time

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
        
        updated_participants = []
        
        for participant in participants:
            try:
                #API Rate Limit 방지
                time.sleep(0.5)
                
                handle = participant.user.profile.codeforces_id
                result = fetch_participant_status(contest.id, handle)
                
                if result:
                    participant.problem_status = result['problem_status']
                    participant.total_score = result['total_score']
                    participant.penalty = result['penalty']
                    updated_participants.append(participant)
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   -> Error updating {participant.user.username}: {e}"))
        
        # DB 저장
        if updated_participants:
            Participant.objects.bulk_update(updated_participants, ['problem_status', 'total_score', 'penalty'])
            self.stdout.write(f"   -> Successfully updated {len(updated_participants)} participants (Bulk Update).") 
