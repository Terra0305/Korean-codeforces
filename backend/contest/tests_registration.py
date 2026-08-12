from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Contest, Participant
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class RegistrationTests(APITestCase):
    def setUp(self):
        # Users
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.other_user = User.objects.create_user(username='otheruser', password='password123')
        
        # Contest
        self.contest = Contest.objects.create(
            id=5000,
            name='Registration Contest',
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=2)
        )
        
        self.url = f'/api/contests/contests/{self.contest.id}/register/'
        self.unregister_url = f'/api/contests/contests/{self.contest.id}/unregister/'

    def test_register_contest_success(self):
        """로그인한 유저는 대회에 참가 신청할 수 있다."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Participant.objects.filter(user=self.user, contest=self.contest).exists())
        self.assertEqual(response.data['participant']['user'], self.user.id)

    def test_register_contest_unauthenticated(self):
        """로그인하지 않은 유저는 참가 신청할 수 없다."""
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_register_contest_already_registered(self):
        """이미 참가 신청한 경우 중복 신청할 수 없다."""
        # First registration
        Participant.objects.create(user=self.user, contest=self.contest)
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], '이미 등록된 대회입니다.')

    def test_register_non_existent_contest(self):
        """존재하지 않는 대회에 참가 신청할 수 없다."""
        url = '/api/contests/contests/99999/register/'
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unregister_contest_success(self):
        """참가 신청을 취소할 수 있다."""
        Participant.objects.create(user=self.user, contest=self.contest)
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.unregister_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Participant.objects.filter(user=self.user, contest=self.contest).exists())

    def test_unregister_not_registered(self):
        """신청하지 않은 대회는 취소할 수 없다."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.unregister_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], '신청하지 않은 대회입니다.')

    def test_unregister_contest_unauthenticated(self):
        """로그인하지 않은 유저는 취소할 수 없다."""
        response = self.client.delete(self.unregister_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
