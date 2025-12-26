from django.core.management.base import BaseCommand
from contest.utils import fetch_contest_data
from contest.models import Contest
#커맨드에서 대회,문제 데이터를 갱신할려는 경우  사용하는 코드
#사용 예시 : python manage.py crawl_codeforces 1800 1801
class Command(BaseCommand):
    help = 'Fetches contest data from Codeforces for all contests or a specific one'
    # 명령어 설명: Codeforces에서 대회 데이터를 가져옵니다.

    def add_arguments(self, parser):
        # contest_ids: 가져올 대회의 ID 리스트 (선택 사항)
        # 입력하지 않으면 DB에 저장된 모든 대회를 업데이트
        parser.add_argument('contest_ids', nargs='*', type=int, help='Specific contest IDs to fetch')

    def handle(self, *args, **options):
        contest_ids = options['contest_ids']
        
        # ID가 입력되지 않은 경우, DB에 있는 모든 대회 ID를 가져오기
        if not contest_ids:
            self.stdout.write("Fetching all contests stored in DB...")
            contest_ids = Contest.objects.values_list('id', flat=True)

        # 각 대회 ID에 대해 데이터 가져오기 수행
        for cid in contest_ids:
            self.stdout.write(f"Fetching contest {cid}...")
            if fetch_contest_data(cid):
                self.stdout.write(self.style.SUCCESS(f"Successfully fetched contest {cid}"))
            else:
                self.stdout.write(self.style.ERROR(f"Failed to fetch contest {cid}"))
