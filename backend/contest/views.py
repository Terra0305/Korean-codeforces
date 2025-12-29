from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Contest, Problem
from .serializers import ContestSerializer, ProblemSerializer
from .utils import fetch_contest_data

# Create your views here.

class AdminContestViewSet(viewsets.ModelViewSet):
    """
    관리자 전용 대회 관리 ViewSet
    - 대회 생성, 조회, 수정, 삭제 가능
    """
    queryset = Contest.objects.all().order_by('-start_time')
    serializer_class = ContestSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        if name:
            queryset = queryset.filter(name__icontains=name)
            
        return queryset

    def perform_create(self, serializer):
        """대회 생성 시 Codeforces 데이터 자동 동기화"""
        instance = serializer.save()
        fetch_result = fetch_contest_data(instance.id)
        if fetch_result:
            print(f"Successfully fetched data for contest {instance.id}")
        else:
            print(f"Failed to fetch data for contest {instance.id}")


class AdminProblemViewSet(viewsets.ModelViewSet):
    """
    관리자 전용 문제 관리 ViewSet
    - 문제 생성, 조회, 수정, 삭제 가능
    """
    queryset = Problem.objects.all().order_by('contest', 'index')
    serializer_class = ProblemSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        contest = self.request.query_params.get('contest')
        index = self.request.query_params.get('index')
        
        if contest:
            queryset = queryset.filter(contest=contest)
        if index:
            queryset = queryset.filter(index=index)
            
        return queryset
