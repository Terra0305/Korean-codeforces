from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Contest, Problem
from django.utils import timezone
from datetime import timedelta

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
