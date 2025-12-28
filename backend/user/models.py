from django.db import models
from django.conf import settings


class Profile(models.Model):
    """
    사용자 프로필 모델
    Django User 모델과 1:1 관계로 확장
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name='사용자',
        primary_key=True
    )

    # 학교 정보
    school = models.CharField(
        max_length=100,
        verbose_name='학교'
    )

    # 학과 정보
    department = models.CharField(
        max_length=100,
        verbose_name='학과'
    )

    # 학번
    student_id = models.CharField(
        max_length=20,
        verbose_name='학번',
        unique=True
    )

    # 실명
    real_name = models.CharField(
        max_length=50,
        verbose_name='이름'
    )

    # Codeforces 아이디 (1:1 대응)
    codeforces_id = models.CharField(
        max_length=50,
        verbose_name='Codeforces ID',
        unique=True,
        db_index=True
    )

    # ELO 레이팅
    elo_rating = models.IntegerField(
        verbose_name='ELO Rating',
        default=1500
    )

    # 메타 정보
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='가입일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')

    class Meta:
        verbose_name = '사용자 프로필'
        verbose_name_plural = '사용자 프로필'
        ordering = ['-elo_rating', '-created_at']

    def __str__(self):
        return f"{self.real_name} ({self.codeforces_id})"
