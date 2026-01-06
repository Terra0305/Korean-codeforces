from rest_framework import serializers
from .models import Contest, Problem, Participant

class ContestSerializer(serializers.ModelSerializer):
    """대회 정보 시리얼라이저"""
    class Meta:
        model = Contest
        fields = ['id', 'name', 'start_time', 'end_time']

class ProblemSerializer(serializers.ModelSerializer):
    """문제 정보 시리얼라이저"""
    class Meta:
        model = Problem
        fields = ['id', 'contest', 'index', 'points', 'rating', 'url', 'description_kr']

class ParticipantSerializer(serializers.ModelSerializer):
    """참가자 정보 시리얼라이저"""
    user_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Participant
        fields = ['id', 'user', 'user_username', 'contest', 'problem_status', 'total_score', 'penalty']
        read_only_fields = ['user', 'total_score', 'penalty', 'problem_status']

class ParticipantAdminSerializer(serializers.ModelSerializer):
    """관리자용 참가자 정보 시리얼라이저 (수정 가능)"""
    user_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Participant
        fields = ['id', 'user', 'user_username', 'contest', 'problem_status', 'total_score', 'penalty']
        read_only_fields = ['user']
