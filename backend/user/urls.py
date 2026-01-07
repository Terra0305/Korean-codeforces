from django.urls import path
from .views import (
    UserRegistrationView,
    LoginView,
    LogoutView,
    ProfileViewSet,
    PasswordChangeView,
    CurrentUserView,
    VerifyCodeforcesView,
    AdminUserListView,
    AdminUserDetailView,
    AdminStatsView,
)

app_name = 'user'

# ProfileViewSet의 메서드를 수동으로 매핑
profile_list = ProfileViewSet.as_view({
    'get': 'list',
    'put': 'update',
    'patch': 'partial_update'
})

profile_search = ProfileViewSet.as_view({
    'get': 'search'
})

urlpatterns = [
    # 인증 관련
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),

    # Codeforces 검증
    path('verify-codeforces/', VerifyCodeforcesView.as_view(), name='verify-codeforces'),

    # 프로필 관련
    path('profile/', profile_list, name='profile'),
    path('profile/search/', profile_search, name='profile-search'),

    # 관리자 전용
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),

]
