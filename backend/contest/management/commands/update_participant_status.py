from django.core.management.base import BaseCommand
from contest.models import Contest, Participant
from contest.utils import fetch_participant_status
import time

class Command(BaseCommand):
    help = 'Updates participant status for a specific contest by fetching data from Codeforces'

    def add_arguments(self, parser):
        parser.add_argument('contest_id', type=int, help='Contest ID to update')
        parser.add_argument('--user_id', type=int, help='Specific user ID (DB PK) to update', required=False)

    def handle(self, *args, **options):
        contest_id = options['contest_id']
        user_id = options.get('user_id')
        
        try:
            contest = Contest.objects.get(id=contest_id)
        except Contest.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Contest {contest_id} not found in DB."))
            return

        self.stdout.write(f"Updating participants for contest: {contest.name} ({contest_id})")

        if user_id:
            participants = Participant.objects.filter(contest=contest, user_id=user_id)
        else:
            participants = Participant.objects.filter(contest=contest)
            
        if not participants.exists():
            self.stdout.write(self.style.WARNING(f"No participants found for contest {contest_id}."))
            return

        self.stdout.write(f"Found {participants.count()} participants.")

        for participant in participants:
            # User 프로필에서 Codeforces ID 가져오기
            try:
                # user.profile이 없을 수 있으므로 예외 처리
                 # models.py에 OneToOne으로 되어있으나, related_name='profile'임.
                handle = participant.user.profile.codeforces_id
            except Exception:
                self.stdout.write(self.style.WARNING(f"User {participant.user.username} has no profile or codeforces_id. Skipping."))
                continue
                
            self.stdout.write(f"Fetching status for {participant.user.username} ({handle})...")
            
            result = fetch_participant_status(contest_id, handle)
            
            if result:
                participant.problem_status = result['problem_status']
                participant.total_score = result['total_score']
                participant.penalty = result['penalty']
                participant.save()
                self.stdout.write(self.style.SUCCESS(f"Updated {participant.user.username}: {result['problem_status']}, Score: {result['total_score']}, Penalty: {result['penalty']}"))
            else:
                self.stdout.write(self.style.ERROR(f"Failed to fetch/update for {participant.user.username}"))
            
            # API Rate Limit 고려 (필요시 sleep 조정, 여기선 0.2초)
            time.sleep(0.2)
