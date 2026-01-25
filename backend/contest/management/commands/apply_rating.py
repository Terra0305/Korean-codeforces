from django.core.management.base import BaseCommand
from contest.rating_calculator import apply_contest_rating

class Command(BaseCommand):
    help = 'Applies ELO rating changes for a finished contest'

    def add_arguments(self, parser):
        parser.add_argument('contest_id', type=int, help='Contest ID to apply ratings for')
        
    def handle(self, *args, **options):
        contest_id = options['contest_id']
        
        self.stdout.write(f"Applying ratings for contest {contest_id}...")
        
        result = apply_contest_rating(contest_id)
        
        if result['success']:
            self.stdout.write(self.style.SUCCESS(result['message']))
        else:
            self.stdout.write(self.style.ERROR(f"Failed: {result['message']}"))
