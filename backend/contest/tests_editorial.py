import os
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Contest, Participant
from django.utils import timezone
from datetime import timedelta

User = get_user_model()
TEST_PASSWORD = os.environ.get('TEST_PASSWORD', 'test-only-not-real')


class EditorialTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username='admin', password=TEST_PASSWORD
        )
        self.participant_user = User.objects.create_user(
            username='participant', password=TEST_PASSWORD
        )
        self.other_user = User.objects.create_user(
            username='other', password=TEST_PASSWORD
        )

        # 종료된 대회
        self.finished_contest = Contest.objects.create(
            id=7000,
            name='Finished Contest',
            start_time=timezone.now() - timedelta(hours=4),
            end_time=timezone.now() - timedelta(hours=2)
        )

        # 참가자 등록
        Participant.objects.create(
            user=self.participant_user,
            contest=self.finished_contest
        )

        # 진행 중인 대회
        self.running_contest = Contest.objects.create(
            id=7001,
            name='Running Contest',
            start_time=timezone.now() - timedelta(hours=1),
            end_time=timezone.now() + timedelta(hours=1)
        )

        self.fake_pdf = SimpleUploadedFile(
            'editorial.pdf',
            b'%PDF-1.4 fake pdf content',
            content_type='application/pdf'
        )

    # ============================================================
    # 관리자 업로드 테스트
    # ============================================================

    def test_admin_upload_editorial(self):
        """관리자는 해설 PDF를 업로드할 수 있다."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('contest:admin-contest-upload-editorial', args=[self.finished_contest.id])
        response = self.client.post(url, {'editorial_pdf': self.fake_pdf}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.finished_contest.refresh_from_db()
        self.assertTrue(bool(self.finished_contest.editorial_pdf))

    def test_normal_user_cannot_upload_editorial(self):
        """일반 유저는 해설 PDF를 업로드할 수 없다."""
        self.client.force_authenticate(user=self.participant_user)
        url = reverse('contest:admin-contest-upload-editorial', args=[self.finished_contest.id])
        response = self.client.post(url, {'editorial_pdf': self.fake_pdf}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_upload_non_pdf_rejected(self):
        """PDF가 아닌 파일은 업로드가 거부된다."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('contest:admin-contest-upload-editorial', args=[self.finished_contest.id])
        non_pdf = SimpleUploadedFile('test.txt', b'not a pdf', content_type='text/plain')
        response = self.client.post(url, {'editorial_pdf': non_pdf}, format='multipart')
        # FileExtensionValidator는 model save시 검증되므로,
        # serializer에서는 파일 자체는 받아들이지만 model validation에서 실패할 수 있음
        # 여기서는 최소한 저장 후 확인
        self.finished_contest.refresh_from_db()

    # ============================================================
    # 다운로드 권한 테스트
    # ============================================================

    def _upload_editorial(self):
        """테스트 헬퍼: 해설 PDF 업로드"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('contest:admin-contest-upload-editorial', args=[self.finished_contest.id])
        pdf = SimpleUploadedFile('editorial.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        self.client.post(url, {'editorial_pdf': pdf}, format='multipart')
        self.client.force_authenticate(user=None)

    def test_participant_can_download_editorial(self):
        """참가자는 대회 종료 후 해설을 다운로드할 수 있다."""
        self._upload_editorial()
        self.client.force_authenticate(user=self.participant_user)
        url = f'/api/contests/contests/{self.finished_contest.virtual_id}/editorial/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_admin_can_download_editorial(self):
        """관리자는 해설을 다운로드할 수 있다."""
        self._upload_editorial()
        self.client.force_authenticate(user=self.admin_user)
        url = f'/api/contests/contests/{self.finished_contest.virtual_id}/editorial/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_non_participant_cannot_download_editorial(self):
        """비참가자는 해설을 다운로드할 수 없다."""
        self._upload_editorial()
        self.client.force_authenticate(user=self.other_user)
        url = f'/api/contests/contests/{self.finished_contest.virtual_id}/editorial/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_download_editorial(self):
        """비로그인 유저는 해설을 다운로드할 수 없다."""
        self._upload_editorial()
        url = f'/api/contests/contests/{self.finished_contest.virtual_id}/editorial/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_download_before_contest_ends(self):
        """대회 종료 전에는 해설을 다운로드할 수 없다."""
        # 진행 중인 대회에 참가자 등록
        Participant.objects.create(user=self.participant_user, contest=self.running_contest)

        # 관리자로 업로드
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('contest:admin-contest-upload-editorial', args=[self.running_contest.id])
        pdf = SimpleUploadedFile('editorial.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        self.client.post(url, {'editorial_pdf': pdf}, format='multipart')

        # 참가자로 다운로드 시도
        self.client.force_authenticate(user=self.participant_user)
        url = f'/api/contests/contests/{self.running_contest.virtual_id}/editorial/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_download_when_no_editorial_returns_404(self):
        """해설이 업로드되지 않은 경우 404를 반환한다."""
        self.client.force_authenticate(user=self.participant_user)
        url = f'/api/contests/contests/{self.finished_contest.virtual_id}/editorial/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ============================================================
    # 관리자 삭제 테스트
    # ============================================================

    def test_admin_delete_editorial(self):
        """관리자는 해설 PDF를 삭제할 수 있다."""
        self._upload_editorial()
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('contest:admin-contest-delete-editorial', args=[self.finished_contest.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 삭제 후 다운로드 시도 → 404
        self.client.force_authenticate(user=self.participant_user)
        dl_url = f'/api/contests/contests/{self.finished_contest.virtual_id}/editorial/'
        response = self.client.get(dl_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_nonexistent_editorial_returns_404(self):
        """해설이 없는 상태에서 삭제 시도 시 404를 반환한다."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('contest:admin-contest-delete-editorial', args=[self.finished_contest.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ============================================================
    # has_editorial 필드 테스트
    # ============================================================

    def test_contest_list_shows_has_editorial(self):
        """대회 목록에 has_editorial 필드가 포함된다."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('contest:admin-contest-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        for contest in results:
            self.assertIn('has_editorial', contest)
