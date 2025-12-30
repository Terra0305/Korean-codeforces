from django.db import models
from django.conf import settings

# Create your models here.
#대회
class Contest(models.Model):
    id = models.IntegerField(primary_key=True, verbose_name="대회 ID (Codeforces)")
    name = models.CharField(max_length=100, null=True, blank=True, verbose_name="대회명")
    start_time = models.DateTimeField(null=True, blank=True, verbose_name="대회 시작시간")#시작시간
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="대회 종료시간") #종료시간

    class Meta:
        verbose_name = "대회"
        verbose_name_plural = "대회"
    
    def __str__(self):
        return f"{self.name} (ID: {self.id})" # 대회명 (ID: 대회ID) 형식 반환

#문제
class Problem(models.Model):
    contest = models.ForeignKey(
        Contest, 
        on_delete=models.CASCADE, 
        related_name='problems',
        verbose_name="관련 대회"
    )
    # 문제 번호 ex) A번 문제 B번 문제 
    index = models.CharField(max_length=10, verbose_name="문제 번호") 
    
    # ICPC 룰이라 점수가 없으면 기본값을 넣거나 null
    points = models.FloatField(default=0, verbose_name="배점")
    rating = models.IntegerField(default=0, verbose_name="난이도")
    url = models.URLField(max_length=200, blank=True, verbose_name="문제 링크")
    description_kr = models.TextField(blank=True, verbose_name="문제 설명")

    class Meta:
        # (대회 ID, 문제 번호)는 유일해야 함
        unique_together = ('contest', 'index') 
        verbose_name = "대회 문제"
        verbose_name_plural = "대회 문제"

    def __str__(self):
        # A번 문제, B번 문제... 로 표시
        return f"[{self.contest.name}] {self.index}번 (배점: {self.points} 난이도: {self.rating})"

#참가자
class Participant(models.Model):

    # 추후 User 모델과 연결
    # 직접 User를 import 하지 않고 설정을 통해 가져오므로, 나중에 유저 기능이 합쳐져도 에러x
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='participated_contests', #유저 입장에서 참가한 대회 조회 가능
        verbose_name="참가자"
    )
    contest = models.ForeignKey(
        Contest, 
        on_delete=models.CASCADE, 
        related_name='participants', # 대회 입장에서 참가자들 조회 가능
        verbose_name="참가 대회"
    )
    
    # 문자열 형태로 풀이 현황 저장
    # 예시: "+:+2:-1" (A번 정답, B번 2번 시도 후 정답, C번 1번 시도 후 실패)
    # 나중에 이 문자열을 파이썬으로 쪼개서(split) 분석
    problem_status = models.CharField(max_length=100, default="", verbose_name="문제 풀이 현황")
    
    # 총점
    total_score = models.FloatField(default=0, verbose_name="총점")

    # 계산식: (각 문제 풀이 시간) + (틀린 횟수 * 20분) 의 총합
    # 계산식은 임의로 정의하였으므로 추후 논의 필요
    penalty = models.IntegerField(default=0, verbose_name="패널티")

    class Meta:
        # 한 유저는 한 대회에 한 번만 참가 등록이 가능해야 함 (중복 방지)
        unique_together = ('user', 'contest')
        verbose_name = "대회 참가자"
        verbose_name_plural = "대회 참가자"
        ordering = ['-total_score', 'penalty']

    def __str__(self):
        # 예: "Codeforces Round #900 - 윤태건" 형식으로 출력
        return f"{self.contest.name} - {self.user}"