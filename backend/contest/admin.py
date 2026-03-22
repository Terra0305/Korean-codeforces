import time
from django.contrib import admin
from django.core.management import call_command
from .models import Contest, Problem, Participant, RatingHistory
from .utils import fetch_contest_data

# 1. 대회(Contest)
@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    # 관리자 목록 화면에서 보여줄 칼럼들
    list_display = ('id', 'name', 'start_time', 'end_time', 'allow_freeze', 'is_frozen', 'freeze_minutes')
    # 목록 화면에서 바로 수정 가능한 필드
    list_editable = ('allow_freeze',)
    # 클릭하면 상세 페이지로 들어갈 수 있는 링크 설정
    list_display_links = ('id', 'name')
    # 검색창 추가 (대회명으로 검색 가능)
    search_fields = ('name',)
    
    actions = ['refresh_from_codeforces', 'apply_elo_rating']

    @admin.action(description='ELO rating 적용 (선택된 대회)')
    def apply_elo_rating(self, request, queryset):
        success_count = 0
        fail_count = 0
        for contest in queryset:
            try:
                # apply_rating management command를 프로그래매틱하게 호출 (인자: contest_id)
                call_command('apply_rating', contest.id)
                success_count += 1
            except Exception as e:
                fail_count += 1
                from django.contrib import messages
                self.message_user(request, f"대회 {contest.id} ELO 적용 중 오류 발생: {str(e)}", level=messages.ERROR)
        
        self.message_user(request, f"{success_count}건의 대회 ELO rating 산정이 완료되었습니다. (실패: {fail_count}건)")

    @admin.action(description='Codeforces에서 데이터 가져오기 (선택된 대회)')
    def refresh_from_codeforces(self, request, queryset):

        # 선택된 대회의 ID를 사용하여 Codeforces API로부터 최신 데이터를 가져오고 데이터베이스를 갱신
        
        success_count = 0
        fail_count = 0
        
        for contest in queryset:
            # Codeforces API 제한(초당 5회)을 준수하기 위해 0.5초 대기
            time.sleep(0.5)
            
            # utils.py에 정의된 fetch 함수 호출
            if fetch_contest_data(contest.id):
                success_count += 1
            else:
                fail_count += 1
        
        # 결과 메시지를 사용자에게 표시
        self.message_user(request, f"{success_count}건 업데이트 성공, {fail_count}건 실패.")

# 2. 문제(Problem)
@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('contest', 'index', 'points', 'rating', 'url')
    list_filter = ('contest',) # 대회별로 모아보기 필터 (우측 사이드바)
    search_fields = ('index',) # 문제 번호로 검색

# 3. 참가자(Participant)
@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'contest', 'total_score', 'penalty', 'problem_status')
    list_filter = ('contest',)
    search_fields = ('user__username',)

# 4. 레이팅 히스토리(RatingHistory)
@admin.register(RatingHistory)
class RatingHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'contest', 'rating', 'rating_change', 'created_at')
    list_filter = ('contest', ('created_at'))
    search_fields = ('user__username', 'contest__name')

    actions = ['revert_rating_change']

    @admin.action(description='선택된 엘로 레이팅 변동 기록을 유저 프로필에 롤백(회귀)시키기')
    def revert_rating_change(self, request, queryset):
        rolled_back_count = 0
        for history in queryset:
            # 연관된 사용자의 프로필 조회
            if hasattr(history.user, 'profile'):
                profile = history.user.profile
                # 변동(rating_change)만큼 빼주어서 과거의 레이팅으로 회귀
                profile.elo_rating -= history.rating_change
                profile.save()
                rolled_back_count += 1
        
        self.message_user(request, f"{rolled_back_count}명의 사용자 레이팅이 성공적으로 회귀되었습니다.")
