from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from .models import Contest
from .serializers import ContestSerializer

class ContestSerializerStatusTest(TestCase):
    def test_upcoming_contest(self):
        """진행 예정인 대회의 상태와 남은 시간 테스트"""
        now = timezone.now()
        start_time = now + timedelta(hours=1)
        end_time = now + timedelta(hours=3)
        contest = Contest.objects.create(
            id=1, 
            name="Upcoming Contest", 
            start_time=start_time, 
            end_time=end_time
        )
        serializer = ContestSerializer(contest)
        data = serializer.data
        
        self.assertEqual(data['status'], 'UPCOMING')
        # 남은 시간은 3600초 근처여야 함 (오차 범위 1초)
        self.assertAlmostEqual(data['remaining_seconds'], 3600, delta=5)

    def test_running_contest(self):
        """진행 중인 대회의 상태와 남은 시간 테스트"""
        now = timezone.now()
        start_time = now - timedelta(hours=1)
        end_time = now + timedelta(hours=1)
        contest = Contest.objects.create(
            id=2, 
            name="Running Contest", 
            start_time=start_time, 
            end_time=end_time
        )
        serializer = ContestSerializer(contest)
        data = serializer.data
        
        self.assertEqual(data['status'], 'RUNNING')
        # 남은 시간은 3600초 근처여야 함 (오차 범위 1초)
        self.assertAlmostEqual(data['remaining_seconds'], 3600, delta=5)

    def test_finished_contest(self):
        """종료된 대회의 상태와 남은 시간 테스트"""
        now = timezone.now()
        start_time = now - timedelta(hours=3)
        end_time = now - timedelta(hours=1)
        contest = Contest.objects.create(
            id=3, 
            name="Finished Contest", 
            start_time=start_time, 
            end_time=end_time
        )
        serializer = ContestSerializer(contest)
        data = serializer.data
        
        self.assertEqual(data['status'], 'FINISHED')
        self.assertEqual(data['remaining_seconds'], 0)

    def test_contest_with_no_time(self):
        """시간 정보가 없는 대회의 상태 테스트 (에러 방지)"""
        contest = Contest.objects.create(
            id=4, 
            name="No Time Contest"
        )
        serializer = ContestSerializer(contest)
        data = serializer.data
        
        # None일 경우 UPCOMING / 0 리턴 확인
        self.assertEqual(data['status'], 'UPCOMING')
        self.assertEqual(data['remaining_seconds'], 0)
