from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Contest, Participant
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class AdminParticipantTests(APITestCase):
    def setUp(self):
        # Admin User
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='password123'
        )
        
        # Normal User
        self.normal_user = User.objects.create_user(
            username='participant',
            password='password123'
        )
        
        # Contest
        self.contest = Contest.objects.create(
            id=6000,
            name='Admin Participant Test Contest',
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=2)
        )
        
        # Participant
        self.participant = Participant.objects.create(
            user=self.normal_user,
            contest=self.contest,
            total_score=100,
            penalty=50
        )

        self.list_url = reverse('contest:admin-participant-list')
        self.detail_url = reverse('contest:admin-participant-detail', args=[self.participant.id])

    def test_admin_list_participants(self):
        """관리자는 참가자 전체 목록을 조회할 수 있다."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Assuming pagination or flat list, but ViewSet uses pagination
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['user_username'], 'participant')

    def test_admin_list_participants_filter_contest(self):
        """관리자는 특정 대회의 참가자 목록을 필터링하여 조회할 수 있다."""
        other_contest = Contest.objects.create(id=6001, name='Other Contest', start_time=timezone.now(), end_time=timezone.now())
        Participant.objects.create(user=self.admin_user, contest=other_contest) # Admin도 참가 가능
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url, {'contest': self.contest.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['contest'], self.contest.id)

    def test_admin_update_participant_score(self):
        """관리자는 참가자의 점수를 수정할 수 있다."""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'total_score': 200,
            'penalty': 100
        }
        response = self.client.patch(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.participant.refresh_from_db()
        self.assertEqual(self.participant.total_score, 200)
        self.assertEqual(self.participant.penalty, 100)

    def test_admin_delete_participant(self):
        """관리자는 참가자를 삭제(강제 취소)할 수 있다."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Participant.objects.filter(id=self.participant.id).exists())

    def test_normal_user_access_denied(self):
        """일반 유저는 관리자 API에 접근할 수 없다."""
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
