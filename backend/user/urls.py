from django.urls import path
from .views import (
    UserRegistrationView,
    LoginView,
    LogoutView,
    ProfileViewSet,
    PasswordChangeView,
    CurrentUserView,
    AdminUserListView,
    AdminUserDetailView,
    AdminStatsView
)

app_name = 'user'

# ProfileViewSet의 메서드를 수동으로 매핑
profile_list = ProfileViewSet.as_view({
    'get': 'list',
    'put': 'update',
    'patch': 'partial_update'
})

profile_top = ProfileViewSet.as_view({
    'get': 'top'
})

profile_search = ProfileViewSet.as_view({
    'get': 'search'
})

profile_by_codeforces = ProfileViewSet.as_view({
    'get': 'by_codeforces'
})

urlpatterns = [
    # 인증 관련
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),

    # 프로필 관련
    path('profile/', profile_list, name='profile'),
    path('profile/top/', profile_top, name='profile-top'),
    path('profile/search/', profile_search, name='profile-search'),
    path('profile/by_codeforces/', profile_by_codeforces, name='profile-by-codeforces'),

    # 관리자 전용
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
]
