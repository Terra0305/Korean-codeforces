from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """프로필 관리 인터페이스"""

    list_display = [
        'user',
        'real_name',
        'codeforces_id',
        'school',
        'department',
        'student_id',
        'elo_rating',
        'created_at'
    ]

    list_filter = [
        'school',
        'department',
        'created_at',
        'elo_rating'
    ]

    search_fields = [
        'user__username',
        'real_name',
        'codeforces_id',
        'school',
        'department',
        'student_id'
    ]

    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('사용자 정보', {
            'fields': ('user', 'real_name', 'codeforces_id')
        }),
        ('학교 정보', {
            'fields': ('school', 'department', 'student_id')
        }),
        ('레이팅', {
            'fields': ('elo_rating',)
        }),
        ('메타 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    ordering = ['-elo_rating', '-created_at']

    def get_queryset(self, request):
        """쿼리셋 최적화"""
        qs = super().get_queryset(request)
        return qs.select_related('user')
