import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Profile

User = get_user_model()


# ============================================================================
# Validation Functions
# ============================================================================

def validate_password_strength(password):
    """
    비밀번호 강도 검증
    - 최소 8자 이상
    - 영문, 숫자, 특수문자 중 2가지 이상 포함
    """
    if len(password) < 8:
        raise DjangoValidationError('비밀번호는 최소 8자 이상이어야 합니다.')

    has_letter = bool(re.search(r'[a-zA-Z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))

    if sum([has_letter, has_digit, has_special]) < 2:
        raise DjangoValidationError('비밀번호는 영문, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다.')


def validate_codeforces_id(codeforces_id):
    """
    Codeforces ID 형식 검증
    - 3~24자
    - 영문자, 숫자, 언더스코어만 허용
    """
    if not re.match(r'^[a-zA-Z0-9_]{3,24}$', codeforces_id):
        raise DjangoValidationError(
            'Codeforces ID는 3~24자의 영문자, 숫자, 언더스코어(_)만 사용 가능합니다.'
        )


def validate_student_id(student_id):
    """학번 형식 검증"""
    if len(student_id) > 20:
        raise DjangoValidationError('학번은 20자를 초과할 수 없습니다.')


def validate_username(username):
    """
    사용자명 검증
    - 3~30자
    - 영문자, 숫자, 언더스코어만 허용
    """
    if not re.match(r'^[a-zA-Z0-9_]{3,30}$', username):
        raise DjangoValidationError(
            '사용자명은 3~30자의 영문자, 숫자, 언더스코어(_)만 사용 가능합니다.'
        )


# ============================================================================
# Serializers
# ============================================================================


class ProfileSerializer(serializers.ModelSerializer):
    """
    프로필 조회/수정용 시리얼라이저
    """
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'username',
            'school',
            'department',
            'student_id',
            'real_name',
            'codeforces_id',
            'elo_rating',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['elo_rating', 'created_at', 'updated_at', 'codeforces_id']

    def validate_student_id(self, value):
        """학번 검증"""
        validate_student_id(value)
        return value


class ProfileLoginSerializer(serializers.ModelSerializer):
    """
    로그인 응답용 시리얼라이저 (created_at, updated_at 제외)
    """
    class Meta:
        model = Profile
        fields = [
            'school',
            'department',
            'student_id',
            'real_name',
            'codeforces_id',
            'elo_rating'
        ]
        read_only_fields = ['codeforces_id', 'elo_rating']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    프로필 수정용 시리얼라이저 (제한된 필드만 수정 가능)
    """
    class Meta:
        model = Profile
        fields = [
            'school',
            'department',
            'student_id',
            'real_name'
        ]

    def validate_student_id(self, value):
        """학번 검증"""
        validate_student_id(value)
        return value


class UserRegistrationSerializer(serializers.Serializer):
    """
    회원가입용 시리얼라이저
    User와 Profile을 동시에 생성
    """
    username = serializers.CharField(
        max_length=150,
        validators=[validate_username],
        help_text='3~30자의 영문자, 숫자, 언더스코어(_)만 사용 가능'
    )
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='최소 8자 이상, 영문/숫자/특수문자 중 2가지 이상 포함'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='비밀번호 확인'
    )

    # Profile 필드
    school = serializers.CharField(
        max_length=100,
        help_text='학교명'
    )
    department = serializers.CharField(
        max_length=100,
        help_text='학과명'
    )
    student_id = serializers.CharField(
        max_length=20,
        validators=[validate_student_id],
        help_text='학번'
    )
    real_name = serializers.CharField(
        max_length=50,
        help_text='실명'
    )
    codeforces_id = serializers.CharField(
        max_length=50,
        validators=[validate_codeforces_id],
        help_text='Codeforces 아이디 (3~24자, 영문/숫자/언더스코어)'
    )

    def validate_username(self, value):
        """사용자명 중복 검증"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('이미 사용 중인 사용자명입니다.')
        return value

    def validate_codeforces_id(self, value):
        """Codeforces ID 중복 검증"""
        if Profile.objects.filter(codeforces_id=value).exists():
            raise serializers.ValidationError('이미 등록된 Codeforces ID입니다.')
        return value

    def validate_student_id(self, value):
        """학번 중복 검증"""
        if Profile.objects.filter(student_id=value).exists():
            raise serializers.ValidationError('이미 등록된 학번입니다.')
        return value

    def validate(self, attrs):
        """전체 데이터 검증"""
        # 비밀번호 일치 검증
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')

        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': '비밀번호가 일치하지 않습니다.'
            })

        # 비밀번호 강도 검증
        try:
            validate_password_strength(password)
            django_validate_password(password)
        except Exception as e:
            raise serializers.ValidationError({
                'password': str(e)
            })

        return attrs

    def create(self, validated_data):
        """User와 Profile 동시 생성"""
        # password_confirm 제거
        validated_data.pop('password_confirm')

        # User 생성에 필요한 필드 추출
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        # Profile 필드 추출
        profile_data = validated_data

        # User 생성
        user = User.objects.create_user(
            username=username,
            password=password
        )

        # Profile 생성
        profile = Profile.objects.create(
            user=user,
            **profile_data
        )

        return user


class PasswordChangeSerializer(serializers.Serializer):
    """
    비밀번호 변경용 시리얼라이저
    """
    old_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='현재 비밀번호'
    )
    new_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='새 비밀번호'
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='새 비밀번호 확인'
    )

    def validate_old_password(self, value):
        """현재 비밀번호 확인"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('현재 비밀번호가 올바르지 않습니다.')
        return value

    def validate(self, attrs):
        """전체 데이터 검증"""
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')

        if new_password != new_password_confirm:
            raise serializers.ValidationError({
                'new_password_confirm': '새 비밀번호가 일치하지 않습니다.'
            })

        # 비밀번호 강도 검증
        try:
            validate_password_strength(new_password)
            django_validate_password(new_password, user=self.context['request'].user)
        except Exception as e:
            raise serializers.ValidationError({
                'new_password': str(e)
            })

        return attrs

    def save(self):
        """비밀번호 변경"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
