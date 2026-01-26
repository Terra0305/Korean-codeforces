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

    except Exception as e:
        print(f"Exception fetching contest {contest_id}: {e}")
        return False

def fetch_contest_latest_submissions(contest_id):
    """
    대회의 최근 제출 기록 1000개를 가져옵니다.
    """
    url = f"https://codeforces.com/api/contest.status?contestId={contest_id}&from=1&count=1000"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data['status'] != 'OK':
             print(f"Error fetching submissions for contest {contest_id}: {data.get('comment')}")
             return []
        return data['result']
    except Exception as e:
        print(f"Exception fetching submissions for contest {contest_id}: {e}")
        return []

def calculate_participant_stats(submissions, problems):
    """
    제출 기록과 문제 정보를 바탕으로 풀이 현황, 총점, 패널티를 계산합니다.
    """
    # 문제별 상태 추적용 딕셔너리
    problem_stats = { p.index: { "solved": False, "attempts": 0, "penalty_time": 0 } for p in problems }
    
    # 제출 기록은 최신순(내림차순)으로 오므로, 역순(시간순)으로 뒤집어서 처리
    submissions = sorted(submissions, key=lambda x: x['creationTimeSeconds'])
    
    for sub in submissions:
        problem_index = sub['problem']['index']
        
        if problem_index not in problem_stats:
            continue
        
        stats = problem_stats[problem_index]
        
        if stats["solved"]:
            continue
            
        verdict = sub.get('verdict')
        
        if verdict == 'OK':
            stats["solved"] = True
            relative_seconds = sub.get('relativeTimeSeconds', 0)
            stats["penalty_time"] = int(relative_seconds / 60)
        elif verdict != 'OK':
            stats["attempts"] += 1

    # 결과 집계
    status_parts = []
    total_score = 0.0
    total_penalty = 0
    
    for p in problems:
        stats = problem_stats[p.index]
        status_str = "0"
        
        if stats["solved"]:
            if stats["attempts"] == 0:
                status_str = "+"
            else:
                status_str = f"+{stats['attempts']}"
            
            total_score += p.points
            total_penalty += stats["penalty_time"] + (stats["attempts"] * 20)
            
        else:
            if stats["attempts"] > 0:
                status_str = f"-{stats['attempts']}"
            else:
                status_str = "0"
        
        status_parts.append(status_str)
        
    final_status_str = ":".join(status_parts)
    
    return {
        "problem_status": final_status_str,
        "total_score": total_score,
        "penalty": total_penalty
    }

def fetch_participant_status(contest_id, handle):
    """
    단일 사용자의 기록을 가져와 처리
    """
    url = f"https://codeforces.com/api/contest.status?contestId={contest_id}&handle={handle}&from=1&count=1000"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data['status'] != 'OK':
            return None
            
        submissions = data['result']
        
        try:
            contest = Contest.objects.get(id=contest_id)
            problems = contest.problems.all().order_by('index')
        except Contest.DoesNotExist:
            return None
            
        if not problems:
            return None

        # 공통 계산 로직 사용
        return calculate_participant_stats(submissions, problems)
        
    except Exception as e:
        print(f"Exception fetching status for {handle}: {e}")
        return None
