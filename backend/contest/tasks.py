from celery import shared_task
from django.utils import timezone
from .models import Contest, Participant
from .utils import fetch_contest_latest_submissions, calculate_participant_stats, API_COOLDOWN
import time
from collections import defaultdict

@shared_task
def update_active_contests_task():
    """
    진행 중인 대회를 찾아 업데이트하는 주기적 태스크
    """
    now = timezone.now()
    active_contests = Contest.objects.filter(start_time__lte=now, end_time__gte=now)
    
    if not active_contests.exists():
        return "No active contests"
        
    results = []
    for contest in active_contests:
        res = update_single_contest_task(contest)
        results.append(f"{contest.name}: {res}")
        
    return "\n".join(results)

def update_single_contest_task(contest):
    """
    단일 대회 업데이트 로직 (내부 호출용)
    """
    participants = Participant.objects.filter(contest=contest).select_related('user__profile')
    
    if not participants.exists():
        return "No participants"

    # 1. 최근 100개의 제출 내역을 가져옴
    time.sleep(API_COOLDOWN)
    all_submissions = fetch_contest_latest_submissions(contest.id)
    
    if not all_submissions:
         return "No submissions fetched"
         
    # 2. 핸들별로 필터링 및 그룹화
    participant_handles = set(p.user.profile.codeforces_id for p in participants)
    submissions_by_handle = defaultdict(list)
    
    for sub in all_submissions:
         if 'author' in sub and 'members' in sub['author']:
             for member in sub['author']['members']:
                 handle = member.get('handle')
                 if handle in participant_handles:
                     submissions_by_handle[handle].append(sub)
    
    # 3. 문제 가져오기
    problems = contest.problems.all().order_by('index')
    if not problems:
         return "No problems found"
         
    updated_participants = []
    
    for participant in participants:
        handle = participant.user.profile.codeforces_id
        
        if handle in submissions_by_handle:
            user_subs = submissions_by_handle[handle]
            result = calculate_participant_stats(user_subs, problems)
            
            if result:
                participant.problem_status = result['problem_status']
                participant.total_score = result['total_score']
                participant.penalty = result['penalty']
                updated_participants.append(participant)

    # DB 저장
    if updated_participants:
        Participant.objects.bulk_update(updated_participants, ['problem_status', 'total_score', 'penalty'])
        return f"Updated {len(updated_participants)} participants"
    else:
        return "No updates needed"
