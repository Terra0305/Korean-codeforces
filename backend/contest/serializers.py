from rest_framework import serializers
from .models import Contest, Problem, Participant

from django.utils import timezone

class ContestSerializer(serializers.ModelSerializer):
    """대회 정보 시리얼라이저"""
    class Meta:
        model = Contest
        fields = ['id', 'virtual_id', 'name', 'start_time', 'end_time']
    
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
