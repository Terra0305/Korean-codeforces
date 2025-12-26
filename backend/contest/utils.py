import requests
from django.utils import timezone
from datetime import datetime, timezone as datetime_timezone
from .models import Contest, Problem, Participant

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
