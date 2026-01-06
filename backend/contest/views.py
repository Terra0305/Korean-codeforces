from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Contest, Problem, Participant
from .serializers import ContestSerializer, ProblemSerializer, ParticipantSerializer, ParticipantAdminSerializer
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


class AdminParticipantViewSet(viewsets.ModelViewSet):
    """
    관리자 전용 참가자 관리 ViewSet
    - 참가자 목록 조회, 수정, 삭제 (강제 취소)
    """
    queryset = Participant.objects.all().order_by('-total_score', 'penalty')
    serializer_class = ParticipantAdminSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        contest = self.request.query_params.get('contest')
        
        if contest:
            queryset = queryset.filter(contest=contest)
            
        return queryset


class ContestViewSet(viewsets.ReadOnlyModelViewSet):
    """
    일반 사용자용 대회 조회 ViewSet
    """
    queryset = Contest.objects.all().order_by('-start_time')
    serializer_class = ContestSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def register(self, request, pk=None):
        """대회 참가 신청"""
        contest = self.get_object()
        user = request.user
        
        if Participant.objects.filter(contest=contest, user=user).exists():
           return Response({'error': '이미 등록된 대회입니다.'}, status=400)
           
        participant = Participant.objects.create(contest=contest, user=user)
        serializer = ParticipantSerializer(participant)
        return Response({'message': '대회에 성공적으로 등록되었습니다.', 'participant': serializer.data}, status=201)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def unregister(self, request, pk=None):
        """대회 참가 취소"""
        contest = self.get_object()
        user = request.user

        try:
            participant = Participant.objects.get(contest=contest, user=user)
            participant.delete()
            return Response({'message': '대회 참가 신청이 취소되었습니다.'}, status=200)
        except Participant.DoesNotExist:
             return Response({'error': '신청하지 않은 대회입니다.'}, status=404)


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



