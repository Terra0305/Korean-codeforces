import requests
from django.utils import timezone
from datetime import datetime, timezone as datetime_timezone
from .models import Contest, Problem, Participant

API_COOLDOWN = 0.5  # API 호출 간 대기 시간 (초)

def fetch_contest_data(contest_id):
    
    #Codeforces API를 통해 대회 정보와 문제 정보를 가져와 데이터베이스를 갱신
    
    #Args:
    #   contest_id (int): Codeforces 대회 ID (예: 1800)
    
    #Returns:
    #   bool: 성공 여부 (True: 성공, False: 실패)
    
    # 1. 대회 세부 정보 및 문제 조회 (contest.standings API 사용)
    # standings API는 'contest' 객체와 'problems' 리스트를 동시에 반환
    # from=1&count=1로 설정하여 랭킹 정보는 최소화하고 문제 정보만 가져오기(요청 최소값이 1)
    url = f"https://codeforces.com/api/contest.standings?contestId={contest_id}&from=1&count=1"
    
    try:
        response = requests.get(url)
        response.raise_for_status() # HTTP 에러 발생 시 예외 처리
        data = response.json()
        
        # API 상태 확인
        if data['status'] != 'OK':
            print(f"Error fetching contest {contest_id}: {data.get('comment')}")
            return False

        result = data['result']
        contest_data = result['contest'] # 대회 정보
        problems_data = result['problems'] # 문제 목록

        # 2. 대회(Contest) 정보 생성 or 갱신
        contest, created = Contest.objects.update_or_create(
            id=contest_data['id'],
            defaults={
                'name': contest_data['name'],
                # Unix Timestamp를 Python datetime 객체로 변환 (UTC 기준) 근데 어차피 우리가 시험 칠 시각으로 조정해야함 
                'start_time': datetime.fromtimestamp(contest_data.get('startTimeSeconds', 0), tz=datetime_timezone.utc),
                'end_time': datetime.fromtimestamp(contest_data.get('startTimeSeconds', 0) + contest_data.get('durationSeconds', 0), tz=datetime_timezone.utc),
            }
        )
        print(f"Contest {contest_id} {'created' if created else 'updated'}.")

        # 3. 문제(Problem) 정보 생성 or 갱신
        for p_data in problems_data:
            # Codeforces 문제 URL 형식: https://codeforces.com/contest/{contestId}/problem/{index}
            problem_url = f"https://codeforces.com/contest/{contest_id}/problem/{p_data['index']}"
            
            # Codeforces 필드 매핑:
            # index -> index (예: "A", "B")
            # name -> description_kr (일단 기능 확인 위해 이름을 저장 코드 포스API에서는 문제 원문을 제공하지 않음 논의 필요)
            # points -> points (배점)
            # rating -> rating (난이도)
            
            Problem.objects.update_or_create(
                contest=contest,
                index=p_data['index'],
                defaults={
                    'points': p_data.get('points', 0),
                    'rating': p_data.get('rating', 0),
                    'url': problem_url,
                    'description_kr': p_data.get('name', ''), 
                }
            )
        print(f"Problems for contest {contest_id} updated.")
        return True

    except Exception as e:
        print(f"Exception fetching contest {contest_id}: {e}")
        return False

def fetch_participant_status(contest_id, handle):
    """
    Codeforces에서 특정 대회의 사용자 채점 기록을 가져와 문제 상세 풀이 현황을 반환
    
    Args:
        contest_id (int): 대회 ID
        handle (str): Codeforces 핸들
        
    Returns:
        dict: {
            "problem_status": str,  # "+:+2:-1" 형식
            "total_score": float,   # 총점
            "penalty": int          # 패널티 (분 단위)
        }
        또는 None (실패 시)
    """
    
    # 1. 대회 제출 기록 가져오기 (contest.status API)
    # from=1&count=1000 정도로 충분하다고 가정 (일반적인 대회 제출 수 고려)
    url = f"https://codeforces.com/api/contest.status?contestId={contest_id}&handle={handle}&from=1&count=1000"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data['status'] != 'OK':
            print(f"Error fetching status for {handle} in {contest_id}: {data.get('comment')}")
            return None
            
        submissions = data['result']
        
        # 2. 대회의 문제 목록 가져오기 (DB에서 조회)
        # 문제 순서(index)를 보장하기 위해 DB에서 가져옴
        # 사전에 fetch_contest_data가 실행되어 DB에 문제 정보가 있다고 가정
        try:
            contest = Contest.objects.get(id=contest_id)
            problems = contest.problems.all().order_by('index') # A, B, C 순서 정렬
        except Contest.DoesNotExist:
            print(f"Contest {contest_id} not found in DB.")
            return None
            
        if not problems:
            print(f"No problems found for contest {contest_id}.")
            return None

        # 문제별 상태 추적용 딕셔너리
        # key: 문제 index (예: "A"), value: { "solved": bool, "attempts": int, "penalty_time": int (분) }
        problem_stats = { p.index: { "solved": False, "attempts": 0, "penalty_time": 0 } for p in problems }
        
        # 제출 기록은 최신순(내림차순)으로 오므로, 역순(시간순)으로 뒤집어서 처리
        # (먼저 푼 것이 인정되므로)
        submissions.reverse() 
        
        for sub in submissions:
            problem_index = sub['problem']['index']
            
            # DB에 없는 문제는 무시
            if problem_index not in problem_stats:
                continue
            
            stats = problem_stats[problem_index]
            
            # 이미 푼 문제는 더 이상 계산하지 않음
            if stats["solved"]:
                continue
                
            verdict = sub.get('verdict')
            
            # OK(정답)인 경우
            if verdict == 'OK':
                stats["solved"] = True
                # 풀이 시간(초) -> 분 단위 변환 (Codeforces는 relativeTimeSeconds 제공)
                # 대회 시작 후 흐른 시간
                relative_seconds = sub.get('relativeTimeSeconds', 0)
                stats["penalty_time"] = int(relative_seconds / 60)
            
            # 오답인 경우 시도 횟수 증가
            # 실제 패널티 계산 시에는 푼 문제에 대해서만 (시도횟수 * 20분) 적용함.
            elif verdict != 'OK':
                stats["attempts"] += 1

        # 3. 결과 집계
        status_parts = []
        total_score = 0.0
        total_penalty = 0
        
        for p in problems:
            stats = problem_stats[p.index]
            
            # 문자열 생성 (예: "+", "+2", "-1")
            # +: 1번 만에 정답 (attempts=0) -> "+", 시도후 정답 -> "+attempts"
            # -: 못 풀고 시도만 함 -> "-attempts"
            # 시도조차 안했으면? -> "0" 
            
            status_str = "0"
            
            if stats["solved"]:
                if stats["attempts"] == 0:
                    status_str = "+"
                else:
                    status_str = f"+{stats['attempts']}"
                
                # 점수 계산 (문제 배점)
                total_score += p.points
                
                # 패널티 계산: (풀이 시간) + (틀린 횟수 * 20분)
                total_penalty += stats["penalty_time"] + (stats["attempts"] * 20)
                
            else:
                if stats["attempts"] > 0:
                    status_str = f"-{stats['attempts']}"
                else:
                    status_str = "0" # 시도 안함
            
            status_parts.append(status_str)
            
        # status 문자열 조합 (구분자: ":")
        final_status_str = ":".join(status_parts)
        
        return {
            "problem_status": final_status_str,
            "total_score": total_score,
            "penalty": total_penalty
        }
        
    except Exception as e:
        print(f"Exception fetching status for {handle}: {e}")
        return None
