from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
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
        name = self.request.query_params.get('name')
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
    
    @action(detail=True, methods=['post'])
    def sync_codeforces(self, request, pk=None):
        contest = self.get_object() # 해당 대회 객체 가져오기
        result = fetch_contest_data(contest.id)
        
        if result:
            return Response({'status': '동기화 성공', 'data': result})
        return Response({'status': '동기화 실패'}, status=400)


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


class ContestViewSet(viewsets.ReadOnlyModelViewSet):
    """
    일반 사용자용 대회 조회 ViewSet
    """
    queryset = Contest.objects.all().order_by('-start_time')
    serializer_class = ContestSerializer


class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    일반 사용자용 문제 조회 ViewSet
    """
    queryset = Problem.objects.all().order_by('contest', 'index')
    serializer_class = ProblemSerializer

    def list_by_contest(self, request, contest_id=None):
        """특정 대회에 속한 문제 목록 조회"""
        queryset = self.queryset.filter(contest_id=contest_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve_by_contest(self, request, contest_id=None, pk=None):
        """특정 문제 조회 (대회 ID 검증 포함)"""
        try:
            problem = self.queryset.get(contest_id=contest_id, pk=pk)
            serializer = self.get_serializer(problem)
            return Response(serializer.data)
        except Problem.DoesNotExist:
            return Response({'error': '문제를 찾을 수 없습니다.'}, status=404)
