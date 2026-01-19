from django.db import transaction
from .models import Contest, Participant
from user.models import Profile

def calculate_elo_changes(participants):
    """
    참가자 리스트(랭킹순 정렬됨)를 받아 각 참가자의 Rating 변화량을 계산
    
    """
    changes = {p.id: 0 for p in participants}
    
    # K-factor: 점수 변동 폭 계수 (일반적으로 32 사용)
    K = 32
    
    n = len(participants)
    for i in range(n):
        for j in range(i + 1, n):
            winner = participants[i]
            loser = participants[j]
            
            # Winner의 현재 레이팅
            rating_a = winner.user.profile.elo_rating
            # Loser의 현재 레이팅
            rating_b = loser.user.profile.elo_rating
            
            # 기대 승률 계산 (A가 이길 확률)
            # 수식: 1 / (1 + 10^((Rb - Ra) / 400))
            expected_a = 1 / (1 + 10 ** ((rating_b - rating_a) / 400))
            expected_b = 1 / (1 + 10 ** ((rating_a - rating_b) / 400))
            
            # 점수 변동량 계산
            # A는 이겼으므로 실제 결과(S) = 1
            delta_a = K * (1 - expected_a)
            
            # B는 졌으므로 실제 결과(S) = 0
            delta_b = K * (0 - expected_b)
            
            # Dictionary에 누적 (소수점 유지, 나중에 반올림)
            changes[winner.id] += delta_a
            changes[loser.id] += delta_b
            
    return changes

def apply_contest_rating(contest_id):
    """
    특정 대회의 결과를 바탕으로 참가자들의 ELO Rating을 반영.
    (이미 반영된 경우 실행하지 않음)
    """
    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return {"success": False, "message": f"Contest {contest_id} not found"}

    if contest.is_rating_applied:
        return {"success": False, "message": f"Rating already applied for contest {contest_id}"}
    
    # 참가자 가져오기 (성적순 정렬: 총점 내림차순, 패널티 오름차순)
    participants = list(Participant.objects.filter(contest=contest).select_related('user__profile').order_by('-total_score', 'penalty'))
    
    if len(participants) < 2:
        return {"success": False, "message": "Not enough participants to calculate rating"}

    # ELO 변화량 계산
    changes = calculate_elo_changes(participants)
    
    # DB 반영 (Atomic Transaction)
    with transaction.atomic():
        updated_profiles = []
        
        for p in participants:
            delta = changes[p.id]
            profile = p.user.profile
            
            old_rating = profile.elo_rating
            new_rating = int(old_rating + delta)
            
            # 레이팅이 음수가 되지 않도록 보정
            if new_rating < 0:
                new_rating = 0
                
            profile.elo_rating = new_rating
            updated_profiles.append(profile)
            
            # (옵션) 로그 남기기
            # print(f"User {profile.user.username}: {old_rating} -> {new_rating} ({delta:+.2f})")
            
        # 일괄 업데이트
        Profile.objects.bulk_update(updated_profiles, ['elo_rating'])
        
        # 대회 상태 업데이트
        contest.is_rating_applied = True
        contest.save()
        
    return {"success": True, "message": f"Successfully applied ratings for {len(participants)} participants"}
