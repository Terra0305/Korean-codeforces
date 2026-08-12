from rest_framework import serializers
from .models import Contest, Problem, Participant, RatingHistory

from django.utils import timezone

class ContestSerializer(serializers.ModelSerializer):
    """대회 정보 시리얼라이저"""
    status = serializers.SerializerMethodField()
    remaining_seconds = serializers.SerializerMethodField()
    has_editorial = serializers.SerializerMethodField()

    class Meta:
        model = Contest
        fields = ['id', 'virtual_id', 'name', 'start_time', 'end_time', 'status', 'remaining_seconds', 'is_frozen', 'freeze_minutes', 'allow_freeze', 'has_editorial']

    def get_has_editorial(self, obj):
        return bool(obj.editorial_pdf)
    
    def get_status(self, obj):
        if not obj.start_time or not obj.end_time:
            return 'UPCOMING'
            
        now = timezone.now()
        if obj.start_time > now:
            return 'UPCOMING'
        elif obj.start_time <= now < obj.end_time:
            return 'RUNNING'
        else:
            return 'FINISHED'

    def get_remaining_seconds(self, obj):
        if not obj.start_time or not obj.end_time:
            return 0
            
        now = timezone.now()
        if obj.start_time > now:
            return int((obj.start_time - now).total_seconds())
        elif obj.start_time <= now < obj.end_time:
            return int((obj.end_time - now).total_seconds())
        else:
            return 0

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # 대회 시작 전에는 실제 ID (Codeforces ID) 비공개 (관리자는 제외)
        user = self.context.get('request').user if self.context.get('request') else None
        is_admin = user and (user.is_staff or user.is_superuser)
        
        if not is_admin and instance.start_time and timezone.now() < instance.start_time:
             data.pop('id', None)
        return data

class ProblemSerializer(serializers.ModelSerializer):
    """문제 정보 시리얼라이저 (관리자용 - ID 사용)"""
    class Meta:
        model = Problem
        fields = ['id', 'contest', 'index', 'points', 'rating', 'url', 'description_kr', 'name']

class PublicProblemSerializer(serializers.ModelSerializer):
    """문제 정보 시리얼라이저 (공개용 - virtual_id 사용)"""
    contest = serializers.SlugRelatedField(read_only=True, slug_field='virtual_id')

    class Meta:
        model = Problem
        fields = ['id', 'contest', 'index', 'points', 'rating', 'url', 'description_kr', 'name']

class ParticipantSerializer(serializers.ModelSerializer):
    """참가자 정보 시리얼라이저 (공개용 - virtual_id 사용)"""
    user_username = serializers.ReadOnlyField(source='user.username')
    # 대회 정보는 virtual_id로 노출
    contest = serializers.SlugRelatedField(read_only=True, slug_field='virtual_id')

    class Meta:
        model = Participant
        fields = ['id', 'user', 'user_username', 'contest', 'problem_status', 'total_score', 'penalty']
        read_only_fields = ['user', 'total_score', 'penalty', 'problem_status']

class ParticipantAdminSerializer(serializers.ModelSerializer):
    """관리자용 참가자 정보 시리얼라이저 (수정 가능 - ID 사용 가능)"""
    user_username = serializers.ReadOnlyField(source='user.username')
    # 관리자는 ID/virtual_id 모두 편하게 사용 (기본 PK)

    class Meta:
        model = Participant
        fields = ['id', 'user', 'user_username', 'contest', 'problem_status', 'total_score', 'penalty']
        read_only_fields = ['user']

class RatingHistorySerializer(serializers.ModelSerializer):
    """레이팅 변동 기록 시리얼라이저"""
    contest_name = serializers.ReadOnlyField(source='contest.name')
    contest_date = serializers.ReadOnlyField(source='contest.end_time')

    class Meta:
        model = RatingHistory
        fields = ['id', 'contest', 'contest_name', 'contest_date', 'rating', 'rating_change', 'created_at']


class ScoreboardParticipantSerializer(serializers.ModelSerializer):
    """
    스코어보드 전용 시리얼라이저
    - 프리즈 상태 & 일반 유저 → frozen_* 데이터 반환
    - 프리즈 상태 & 관리자 → 실시간 데이터 반환
    - 프리즈 아닌 경우 / 대회 종료 후 → 실시간 데이터 반환
    """
    user_username = serializers.ReadOnlyField(source='user.username')
    contest = serializers.SlugRelatedField(read_only=True, slug_field='virtual_id')

    class Meta:
        model = Participant
        fields = ['id', 'user', 'user_username', 'contest', 'problem_status', 'total_score', 'penalty']
        read_only_fields = ['user', 'total_score', 'penalty', 'problem_status']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        is_admin = request and request.user and (request.user.is_staff or request.user.is_superuser)
        show_frozen = self.context.get('show_frozen', False)

        # 프리즈 상태이고 관리자가 아닌 경우 → frozen 데이터로 교체
        if show_frozen:
            data['problem_status'] = instance.frozen_problem_status
            data['total_score'] = instance.frozen_total_score
            data['penalty'] = instance.frozen_penalty

        return data


class EditorialUploadSerializer(serializers.Serializer):
    """해설 PDF 업로드용 시리얼라이저"""
    editorial_pdf = serializers.FileField()
