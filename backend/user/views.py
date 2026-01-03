from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth import get_user_model
import requests

from .models import Profile
from .serializers import (
    UserRegistrationSerializer,
    ProfileSerializer,
    ProfileLoginSerializer,
    ProfileUpdateSerializer,
    PasswordChangeSerializer
)

User = get_user_model()


class UserRegistrationView(APIView):
    """
    회원가입 API
    POST /api/users/register/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': '회원가입이 완료되었습니다.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'codeforces_id': user.profile.codeforces_id
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    로그인 API
    POST /api/users/login/
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({
                'error': '사용자명과 비밀번호를 입력해주세요.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            try:
                profile = user.profile
            except Profile.DoesNotExist:
                return Response({
                    'error': '프로필이 존재하지 않습니다.'
                }, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'message': '로그인 성공',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'is_staff': user.is_staff,
                    'profile': ProfileLoginSerializer(profile).data
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': '사용자명 또는 비밀번호가 올바르지 않습니다.'
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    로그아웃 API
    POST /api/users/logout/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({
            'message': '로그아웃 되었습니다.'
        }, status=status.HTTP_200_OK)


class ProfileViewSet(viewsets.ViewSet):
    """
    프로필 관리 ViewSet
    - GET /api/users/profile/ - 현재 사용자 프로필 조회
    - PUT /api/users/profile/ - 프로필 전체 수정
    - PATCH /api/users/profile/ - 프로필 부분 수정
    - GET /api/users/profile/search/?name=xxx - 이름으로 검색
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """현재 로그인한 사용자의 프로필 조회"""
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({
                'error': '프로필이 존재하지 않습니다.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def update(self, request):
        """프로필 전체 수정 (PUT)"""
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({
                'error': '프로필이 존재하지 않습니다.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileUpdateSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                ProfileSerializer(profile).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request):
        """프로필 부분 수정 (PATCH)"""
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({
                'error': '프로필이 존재하지 않습니다.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                ProfileSerializer(profile).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def search(self, request):
        """이름으로 사용자 검색"""
        name = request.query_params.get('name', '')
        if not name:
            return Response({
                'error': '검색할 이름을 입력해주세요.'
            }, status=status.HTTP_400_BAD_REQUEST)

        users = Profile.objects.filter(
            real_name__icontains=name
        ).select_related('user')
        serializer = ProfileSerializer(users, many=True)
        return Response(serializer.data)


class PasswordChangeView(APIView):
    """
    비밀번호 변경 API
    POST /api/users/change-password/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': '비밀번호가 성공적으로 변경되었습니다.'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """
    현재 로그인한 사용자 정보 조회
    GET /api/users/me/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({
                'error': '프로필이 존재하지 않습니다.'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'profile': ProfileLoginSerializer(profile).data
        })


class VerifyCodeforcesView(APIView):
    """
    Codeforces ID 검증 API
    GET /api/users/verify-codeforces/?handle=xxx
    """
    permission_classes = [AllowAny]

    def get(self, request):
        handle = request.query_params.get('handle', '').strip()

        if not handle:
            return Response({
                'error': 'Codeforces handle을 입력해주세요.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Codeforces API 호출
        try:
            cf_api_url = f'https://codeforces.com/api/user.info?handles={handle}'
            response = requests.get(cf_api_url, timeout=10)

            if response.status_code != 200:
                return Response({
                    'exists': False,
                    'error': 'Codeforces API 호출에 실패했습니다.'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            data = response.json()

            # Codeforces API 응답 확인
            if data.get('status') == 'OK' and len(data.get('result', [])) > 0:
                user_info = data['result'][0]
                return Response({
                    'exists': True,
                    'handle': user_info.get('handle')
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'exists': False,
                    'message': '해당 Codeforces handle이 존재하지 않습니다.'
                }, status=status.HTTP_404_NOT_FOUND)

        except requests.exceptions.Timeout:
            return Response({
                'exists': False,
                'error': 'Codeforces API 응답 시간이 초과되었습니다.'
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            return Response({
                'exists': False,
                'error': f'Codeforces API 연결에 실패했습니다: {str(e)}'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({
                'exists': False,
                'error': f'예상치 못한 오류가 발생했습니다: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# 관리자 전용 API
# ============================================================================

class AdminUserListView(APIView):
    """
    관리자 전용 - 전체 회원 목록 조회
    GET /api/users/admin/users/?page=1&limit=20
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 페이지네이션
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        offset = (page - 1) * limit

        # 검색 필터
        search = request.query_params.get('search', '')

        profiles = Profile.objects.select_related('user').all()

        if search:
            profiles = profiles.filter(
                real_name__icontains=search
            ) | profiles.filter(
                codeforces_id__icontains=search
            ) | profiles.filter(
                user__username__icontains=search
            )

        total = profiles.count()
        profiles = profiles[offset:offset + limit]

        serializer = ProfileSerializer(profiles, many=True)

        return Response({
            'total': total,
            'page': page,
            'limit': limit,
            'users': serializer.data
        })


class AdminUserDetailView(APIView):
    """
    관리자 전용 - 특정 회원 상세 조회
    GET /api/users/admin/users/<user_id>/
    """
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            profile = user.profile
        except User.DoesNotExist:
            return Response({
                'error': '사용자를 찾을 수 없습니다.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Profile.DoesNotExist:
            return Response({
                'error': '프로필을 찾을 수 없습니다.'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'id': user.id,
            'username': user.username,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'profile': ProfileSerializer(profile).data
        })


class AdminStatsView(APIView):
    """
    관리자 전용 - 회원 통계
    GET /api/users/admin/stats/
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models import Avg, Max, Min, Count

        total_users = User.objects.count()
        total_profiles = Profile.objects.count()

        stats = Profile.objects.aggregate(
            avg_elo=Avg('elo_rating'),
            max_elo=Max('elo_rating'),
            min_elo=Min('elo_rating')
        )

        # 학교별 통계
        school_stats = Profile.objects.values('school').annotate(
            count=Count('school')
        ).order_by('-count')[:10]

        return Response({
            'total_users': total_users,
            'total_profiles': total_profiles,
            'elo_stats': {
                'average': round(stats['avg_elo'], 2) if stats['avg_elo'] else 0,
                'max': stats['max_elo'] or 0,
                'min': stats['min_elo'] or 0
            },
            'top_schools': list(school_stats)
        })
