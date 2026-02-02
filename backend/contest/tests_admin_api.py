from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Contest, Problem
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch

User = get_user_model()

class AdminApiTests(APITestCase):
    def setUp(self):
        # Admin User
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='password123'
        )
        
        # Normal User
        self.normal_user = User.objects.create_user(
            username='normal',
            password='password123'
        )

        # URLs
        self.contest_list_url = reverse('contest:admin-contest-list')
        self.problem_list_url = reverse('contest:admin-problem-list')

        # Mock fetch_contest_data globally for this test class
        self.patcher = patch('contest.views.fetch_contest_data')
        self.mock_fetch = self.patcher.start()
        self.mock_fetch.return_value = True
        self.addCleanup(self.patcher.stop)

    def test_admin_create_contest(self):
        """관리자는 대회를 생성할 수 있다."""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'id': 1234,
            'name': 'Test Contest',
            'start_time': timezone.now(),
            'end_time': timezone.now() + timedelta(hours=2)
        }
        response = self.client.post(self.contest_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Contest.objects.filter(id=1234).exists())

    def test_create_contest_only_id(self):
        """ID만으로 대회를 생성할 수 있다 (Nullable 필드 테스트)."""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'id': 9999
        }
        response = self.client.post(self.contest_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        contest = Contest.objects.get(id=9999)
        self.assertIsNone(contest.name)
        self.assertIsNone(contest.start_time)
        self.assertIsNone(contest.end_time)

    def test_normal_user_create_contest(self):
        """일반 유저는 대회를 생성할 수 없다."""
        self.client.force_authenticate(user=self.normal_user)
        data = {
            'id': 1235,
            'name': 'Fail Contest',
            'start_time': timezone.now(),
            'end_time': timezone.now() + timedelta(hours=2)
        }
        response = self.client.post(self.contest_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_create_problem(self):
        """관리자는 문제를 생성할 수 있다."""
        # Create contest first
        contest = Contest.objects.create(
            id=2000,
            name='Problem Contest',
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=2)
        )

        self.client.force_authenticate(user=self.admin_user)
        data = {
            'contest': contest.id,
            'index': 'A',
            'points': 500,
            'rating': 800,
            'url': 'http://example.com/A',
            'description_kr': '쉬운 문제'
        }
        response = self.client.post(self.problem_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Problem.objects.filter(contest=contest, index='A').exists())

    def test_normal_user_create_problem(self):
        """일반 유저는 문제를 생성할 수 없다."""
        contest = Contest.objects.create(
            id=2001,
            name='User Contest',
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=2)
        )
        self.client.force_authenticate(user=self.normal_user)
        data = {
            'contest': contest.id,
            'index': 'B',
            'points': 1000,
            'rating': 1200
        }
        response = self.client.post(self.problem_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_contest_filter(self):
        """대회 목록 이름 검색 필터 테스트"""
        Contest.objects.create(id=3001, name='Codeforces Round 900', start_time=timezone.now(), end_time=timezone.now())
        Contest.objects.create(id=3002, name='Educational Round', start_time=timezone.now(), end_time=timezone.now())
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.contest_list_url, {'name': '900'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Pagination handling
        results = response.data.get('results', response.data)
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Codeforces Round 900')

    @patch('contest.views.fetch_contest_data')
    def test_sync_codeforces_action(self, mock_fetch):
        """대회 동기화 액션 테스트"""
        mock_fetch.return_value = {"status": "OK", "result": []}
        
        contest = Contest.objects.create(
            id=4000,
            name='Sync Target Contest',
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=2)
        )
        
        url = reverse('contest:admin-contest-sync-codeforces', args=[contest.id])
        
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 문자열 인코딩 문제 등을 고려하여 status 코드 위주로 체크하거나, 응답 메시지 간단 확인
        self.assertEqual(response.data['status'], '동기화 성공')
        mock_fetch.assert_called_once_with(contest.id)
