from django.contrib import admin
from .models import Contest, Problem, Participant
from .utils import fetch_contest_data

# 1. 대회(Contest)
@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    # 관리자 목록 화면에서 보여줄 칼럼들
    list_display = ('id', 'name', 'start_time', 'end_time')
    # 클릭하면 상세 페이지로 들어갈 수 있는 링크 설정
    list_display_links = ('id', 'name')
    # 검색창 추가 (대회명으로 검색 가능)
    search_fields = ('name',)
    
    actions = ['refresh_from_codeforces']

    @admin.action(description='Codeforces에서 데이터 가져오기 (선택된 대회)')
    def refresh_from_codeforces(self, request, queryset):

        # 선택된 대회의 ID를 사용하여 Codeforces API로부터 최신 데이터를 가져오고 데이터베이스를 갱신
        
        success_count = 0
        fail_count = 0
        
        for contest in queryset:
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