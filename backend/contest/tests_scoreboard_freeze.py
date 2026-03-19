from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Contest, Problem, Participant
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from .utils import is_contest_in_freeze, freeze_scoreboard

User = get_user_model()


class ScoreboardFreezeTests(APITestCase):

    def setUp(self):
        """테스트 데이터 설정"""
        self.admin_user = User.objects.create_superuser(
            username='admin', password='admin123', email='admin@test.com'
        )
        self.normal_user = User.objects.create_user(
            username='testuser', password='test123', email='user@test.com'
        )

        # 진행 중인 대회 (프리즈 전)
        self.contest = Contest.objects.create(
            id=2001,
            name='Freeze Test Contest',
            start_time=timezone.now() - timedelta(hours=2),
            end_time=timezone.now() + timedelta(hours=2),
            freeze_minutes=30,
        )

        self.problem = Problem.objects.create(
            contest=self.contest, index='A', name='Problem A', points=500, rating=1000
        )

        # 참가자 등록
        self.participant = Participant.objects.create(
            contest=self.contest,
            user=self.normal_user,
            problem_status='+:0',
            total_score=500,
            penalty=30,
        )

        self.scoreboard_url = f'/api/contests/contests/{self.contest.virtual_id}/scoreboard/'

    # ----------------------------------------------------------------
    # 유틸 함수 테스트
    # ----------------------------------------------------------------

    def test_is_contest_in_freeze_before_freeze(self):
        """프리즈 전에는 False"""
        # end_time이 2시간 뒤 → freeze_time은 1시간 30분 뒤 → 아직 프리즈 아님
        self.assertFalse(is_contest_in_freeze(self.contest))

    def test_is_contest_in_freeze_during_freeze(self):
        """프리즈 구간에서는 True (단, allow_freeze=True일 때만)"""
        self.contest.end_time = timezone.now() + timedelta(minutes=10)
        self.contest.save()
        self.assertTrue(is_contest_in_freeze(self.contest))

        # allow_freeze=False이면 동작하지 않음
        self.contest.allow_freeze = False
        self.assertTrue(getattr(self.contest, 'allow_freeze', False) is False)
        self.assertFalse(is_contest_in_freeze(self.contest))

    def test_is_contest_in_freeze_after_contest(self):
        """대회 종료 후에는 False"""
        self.contest.end_time = timezone.now() - timedelta(minutes=10)
        self.contest.save()
        self.assertFalse(is_contest_in_freeze(self.contest))

    def test_freeze_scoreboard_saves_snapshot(self):
        """freeze_scoreboard()가 스냅샷을 정확히 저장하는지 확인"""
        freeze_scoreboard(self.contest)

        self.contest.refresh_from_db()
        self.assertTrue(self.contest.is_frozen)

        self.participant.refresh_from_db()
        self.assertEqual(self.participant.frozen_problem_status, '+:0')
        self.assertEqual(self.participant.frozen_total_score, 500)
        self.assertEqual(self.participant.frozen_penalty, 30)

    def test_freeze_scoreboard_only_once(self):
        """이미 프리즈된 대회는 재스냅샷 안 함"""
        freeze_scoreboard(self.contest)

        # 스냅샷 확인
        self.participant.refresh_from_db()
        self.assertEqual(self.participant.frozen_problem_status, '+:0')
        self.assertEqual(self.participant.frozen_total_score, 500)

        # 원본 데이터 변경 (update_fields로 frozen 필드 보존)
        self.participant.problem_status = '+:+'
        self.participant.total_score = 1000
        self.participant.save(update_fields=['problem_status', 'total_score'])

        # 다시 freeze 시도 (is_frozen=True이므로 스킵)
        freeze_scoreboard(self.contest)

        # frozen 데이터는 이전 스냅샷 유지
        self.participant.refresh_from_db()
        self.assertEqual(self.participant.frozen_problem_status, '+:0')
        self.assertEqual(self.participant.frozen_total_score, 500)

    # ----------------------------------------------------------------
    # 스코어보드 API 테스트
    # ----------------------------------------------------------------

    def test_scoreboard_before_freeze(self):
        """프리즈 전 → 실시간 데이터 반환"""
        response = self.client.get(self.scoreboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_frozen'])

        participant_data = response.data['participants'][0]
        self.assertEqual(participant_data['total_score'], 500)
        self.assertEqual(participant_data['problem_status'], '+:0')

    def test_scoreboard_during_freeze_normal_user(self):
        """프리즈 중 (일반 유저) → frozen 데이터 반환"""
        # 프리즈 구간으로 설정
        self.contest.end_time = timezone.now() + timedelta(minutes=10)
        self.contest.save()

        # 스냅샷 저장
        freeze_scoreboard(self.contest)

        # 원본 데이터 변경 (프리즈 이후 제출 시뮬레이션)
        # update_fields로 frozen 필드를 덮어쓰지 않도록 함
        self.participant.problem_status = '+:+'
        self.participant.total_score = 1000
        self.participant.penalty = 60
        self.participant.save(update_fields=['problem_status', 'total_score', 'penalty'])

        # 일반 유저로 조회
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.scoreboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_frozen'])

        participant_data = response.data['participants'][0]
        # frozen 데이터가 반환되어야 함
        self.assertEqual(participant_data['total_score'], 500)
        self.assertEqual(participant_data['problem_status'], '+:0')
        self.assertEqual(participant_data['penalty'], 30)

    def test_scoreboard_during_freeze_allow_freeze_false(self):
        """프리즈 구간이지만 allow_freeze=False이면 실시간 데이터 반환"""
        self.contest.end_time = timezone.now() + timedelta(minutes=10)
        self.contest.allow_freeze = False
        self.contest.save()

        # 원본 데이터 변경
        self.participant.problem_status = '+:+'
        self.participant.total_score = 1000
        self.participant.penalty = 60
        self.participant.save()

        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.scoreboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_frozen'])  # 프론트에 프리즈 안 된 것으로 전달

        participant_data = response.data['participants'][0]
        # 실시간 데이터가 반환되어야 함
        self.assertEqual(participant_data['total_score'], 1000)
        self.assertEqual(participant_data['problem_status'], '+:+')

    def test_scoreboard_during_freeze_admin_user(self):
        """프리즈 중 (관리자) → 실시간 데이터 반환"""
        self.contest.end_time = timezone.now() + timedelta(minutes=10)
        self.contest.save()

        freeze_scoreboard(self.contest)

        # 원본 데이터 변경 (update_fields로 frozen 필드 보존)
        self.participant.problem_status = '+:+'
        self.participant.total_score = 1000
        self.participant.penalty = 60
        self.participant.save(update_fields=['problem_status', 'total_score', 'penalty'])

        # 관리자로 조회
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.scoreboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        participant_data = response.data['participants'][0]
        # 관리자는 실시간 데이터 확인 가능
        self.assertEqual(participant_data['total_score'], 1000)
        self.assertEqual(participant_data['problem_status'], '+:+')

    def test_scoreboard_after_contest_ends(self):
        """대회 종료 후 → 실시간 데이터 반환 (언프리즈)"""
        self.contest.end_time = timezone.now() - timedelta(minutes=5)
        self.contest.is_frozen = True
        self.contest.save()

        # frozen 데이터도 설정
        self.participant.frozen_problem_status = '+:0'
        self.participant.frozen_total_score = 500
        self.participant.frozen_penalty = 30
        # 원본은 최종 결과
        self.participant.problem_status = '+:+'
        self.participant.total_score = 1000
        self.participant.penalty = 60
        self.participant.save()

        response = self.client.get(self.scoreboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_frozen'])

        participant_data = response.data['participants'][0]
        # 대회 종료 후 → 실시간(최종) 데이터
        self.assertEqual(participant_data['total_score'], 1000)
        self.assertEqual(participant_data['problem_status'], '+:+')

    def test_scoreboard_before_contest_starts(self):
        """대회 시작 전 (일반 유저) → 403"""
        self.contest.start_time = timezone.now() + timedelta(hours=1)
        self.contest.save()

        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.scoreboard_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_contest_serializer_includes_freeze_fields(self):
        """ContestSerializer에 is_frozen, freeze_minutes 포함 확인"""
        url = f'/api/contests/contests/{self.contest.virtual_id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('is_frozen', response.data)
        self.assertIn('freeze_minutes', response.data)
        self.assertEqual(response.data['freeze_minutes'], 30)
