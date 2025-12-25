from django.contrib import admin
from .models import Contest, Problem, Participant

# 1. 대회(Contest)
@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    # 관리자 목록 화면에서 보여줄 칼럼들
    list_display = ('id', 'name', 'start_time', 'end_time')
    # 클릭하면 상세 페이지로 들어갈 수 있는 링크 설정
    list_display_links = ('id', 'name')
    # 검색창 추가 (대회명으로 검색 가능)
    search_fields = ('name',)

# 2. 문제(Problem)
@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('contest', 'index', 'points', 'rating')
    list_filter = ('contest',) # 대회별로 모아보기 필터
    search_fields = ('index',)

# 3. 참가자(Participant)
@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'contest', 'total_score', 'penalty', 'problem_status')
    list_filter = ('contest',)
    search_fields = ('user__username',)