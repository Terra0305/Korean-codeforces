# 회원 시스템 (User System)

Korean-Codeforces 프로젝트의 회원 관리 시스템입니다.

## 핵심 정보 요약

### 인증 방식
- **Session 기반 인증** (쿠키 사용)
- Django 기본 User 모델 + Profile 확장

### 로그인 방법
- **username** + **password**로 로그인
- 이메일은 사용하지 않음

### 회원가입 필수 항목
- `username` (로그인 ID)
- `password` (비밀번호)
- `codeforces_id` (Codeforces 아이디)
- `school` (학교명)
- `department` (학과명)
- `student_id` (학번)
- `real_name` (실명)

### 주요 특징
- User와 Profile 1:1 관계
- ELO 레이팅 시스템 (기본값 1500)
- Codeforces ID 기반 사용자 관리

---

## 데이터베이스 구조

### User 테이블 (Django 기본 제공)
```
django.contrib.auth.models.User
├── id (Integer, PK, Auto)
├── username (String, Unique)    # 사용자명 (로그인 ID)
├── password (String, Hashed)    # PBKDF2 해싱
└── ... (기타 Django 기본 필드)
```
**참고:** 이메일 필드는 사용하지 않습니다.

### Profile 테이블 (커스텀)
```
user.models.Profile
├── user (OneToOne → User, PK)           # Django User와 1:1 관계
├── school (String, 100자, Required)      # 학교명
├── department (String, 100자, Required)  # 학과명
├── student_id (String, 20자, Unique, Required)  # 학번
├── real_name (String, 50자, Required)    # 실명
├── codeforces_id (String, 50자, Unique)  # Codeforces ID
├── elo_rating (Integer)                  # ELO 레이팅 (기본값: 1500)
├── created_at (DateTime, Auto)           # 가입일
└── updated_at (DateTime, Auto)           # 수정일
```

**관계도:**
```
User (1) ←→ (1) Profile
```

**필수 입력 필드 (회원가입):**
- `username` - 사용자명 (로그인 ID)
- `password` - 비밀번호
- `codeforces_id` - Codeforces ID
- `school` - 학교명
- `department` - 학과명
- `student_id` - 학번
- `real_name` - 실명

**인덱스:**
- `codeforces_id` (Unique Index)
- `student_id` (Unique Index)

**정렬 기본값:**
- `elo_rating` 내림차순
- `created_at` 내림차순

---

## 파일 구조

```
user/
├── models.py          # Profile 모델 정의
├── serializers.py     # 데이터 검증 + 직렬화
├── views.py           # API 엔드포인트
├── urls.py            # URL 라우팅
├── admin.py           # Django Admin 설정
├── tests.py           # 테스트 코드
└── apps.py            # 앱 설정
```

**총 7개 파일**

---

## API 엔드포인트

### 인증
- `POST /api/users/register/` - 회원가입
- `POST /api/users/login/` - 로그인
- `POST /api/users/logout/` - 로그아웃
- `GET /api/users/me/` - 현재 사용자 정보

### 프로필
- `GET /api/users/profile/` - 내 프로필 조회
- `PUT /api/users/profile/` - 프로필 전체 수정
- `PATCH /api/users/profile/` - 프로필 부분 수정
- `GET /api/users/profile/top/?limit=N` - ELO 상위 랭킹
- `GET /api/users/profile/search/?name=XXX` - 이름 검색
- `GET /api/users/profile/by_codeforces/?codeforces_id=XXX` - CF ID 조회

### 비밀번호
- `POST /api/users/change-password/` - 비밀번호 변경

### 관리자 전용 (IsAdminUser 권한 필요)
- `GET /api/users/admin/users/` - 전체 회원 목록 조회 (페이지네이션, 검색)
- `GET /api/users/admin/users/<user_id>/` - 특정 회원 상세 조회
- `PATCH /api/users/admin/users/<user_id>/elo/` - ELO 레이팅 수정
- `GET /api/users/admin/stats/` - 회원 통계

**총 15개 API**

---

## 주요 로직

### 1. 회원가입

**요청:**
```json
POST /api/users/register/
{
  "username": "testuser",
  "password": "TestPass123!",
  "password_confirm": "TestPass123!",
  "school": "서울대학교",
  "department": "컴퓨터공학부",
  "student_id": "2024001",
  "real_name": "홍길동",
  "codeforces_id": "testcf123"
}
```

**처리 순서:**
1. 입력 검증
   - `username` 중복 확인
   - `codeforces_id` 중복 확인
   - `student_id` 중복 확인 (입력 시)
   - 비밀번호 일치 확인 (`password` == `password_confirm`)
   - 비밀번호 강도 검증
2. `User` 생성 (Django 기본 테이블)
3. `Profile` 생성 (1:1 연결)
   - `elo_rating`은 기본값 1500으로 설정
4. 응답 (201 Created)

**코드 위치:** `user/serializers.py:UserRegistrationSerializer`

---

### 2. 로그인

**요청:**
```json
POST /api/users/login/
{
  "username": "testuser",
  "password": "TestPass123!"
}
```

**처리 순서:**
1. Django 인증: `authenticate(username, password)`
2. 세션 생성: `login(request, user)`
   - HttpOnly 쿠키 발급
   - SameSite=Lax 설정
   - 24시간 유효
3. 프로필 조회: `user.profile`
4. 응답 (200 OK)

**응답:**
```json
{
  "message": "로그인 성공",
  "user": {
    "id": 1,
    "username": "testuser",
    "profile": {
      "school": "서울대학교",
      "department": "컴퓨터공학부",
      "student_id": "2024001",
      "real_name": "홍길동",
      "codeforces_id": "testcf123",
      "elo_rating": 1500,
      "created_at": "2025-12-27T00:00:00Z",
      "updated_at": "2025-12-27T00:00:00Z"
    }
  }
}
```

**코드 위치:** `user/views.py:LoginView`

---

### 3. 프로필 수정

**요청:**
```json
PATCH /api/users/profile/
{
  "school": "연세대학교",
  "department": "소프트웨어학과"
}
```

**수정 가능 필드:**
- `school` (학교)
- `department` (학과)
- `student_id` (학번)
- `real_name` (이름)

**수정 불가 필드 (read_only):**
- `codeforces_id` - 변경 불가
- `elo_rating` - 시스템에서만 업데이트

**코드 위치:** `user/views.py:ProfileViewSet`

---

### 4. 관리자 API (Admin Only)

관리자 권한(`is_staff=True` 또는 `is_superuser=True`)이 필요합니다.

#### 4-1. 전체 회원 목록 조회

**요청:**
```http
GET /api/users/admin/users/?page=1&limit=20&search=홍길동
```

**쿼리 파라미터:**
- `page` - 페이지 번호 (기본값: 1)
- `limit` - 페이지당 항목 수 (기본값: 20)
- `search` - 검색어 (이름, Codeforces ID, username 검색)

**응답:**
```json
{
  "total": 100,
  "page": 1,
  "limit": 20,
  "users": [
    {
      "username": "testuser",
      "school": "서울대학교",
      "department": "컴퓨터공학부",
      "student_id": "2024001",
      "real_name": "홍길동",
      "codeforces_id": "testcf123",
      "elo_rating": 1500,
      "created_at": "2025-12-27T00:00:00Z",
      "updated_at": "2025-12-27T00:00:00Z"
    }
  ]
}
```

#### 4-2. 특정 회원 상세 조회

**요청:**
```http
GET /api/users/admin/users/1/
```

**응답:**
```json
{
  "id": 1,
  "username": "testuser",
  "date_joined": "2025-12-27T00:00:00Z",
  "last_login": "2025-12-27T12:00:00Z",
  "is_active": true,
  "is_staff": false,
  "profile": {
    "school": "서울대학교",
    "department": "컴퓨터공학부",
    "student_id": "2024001",
    "real_name": "홍길동",
    "codeforces_id": "testcf123",
    "elo_rating": 1500,
    "created_at": "2025-12-27T00:00:00Z",
    "updated_at": "2025-12-27T00:00:00Z"
  }
}
```

#### 4-3. ELO 레이팅 수정

**요청:**
```http
PATCH /api/users/admin/users/1/elo/
Content-Type: application/json

{
  "elo_rating": 2000
}
```

**응답:**
```json
{
  "message": "ELO 레이팅이 업데이트되었습니다.",
  "user_id": 1,
  "username": "testuser",
  "old_elo": 1500,
  "new_elo": 2000
}
```



#### 4-4. 회원 통계

**요청:**
```http
GET /api/users/admin/stats/
```

**응답:**
```json
{
  "total_users": 100,
  "total_profiles": 100,
  "elo_stats": {
    "average": 1523.45,
    "max": 2500,
    "min": 800
  },
  "top_schools": [
    {"school": "서울대학교", "count": 25},
    {"school": "연세대학교", "count": 20},
    {"school": "고려대학교", "count": 18}
  ]
}
```

**코드 위치:** `user/views.py:Admin*View`

---

## 검증 규칙

### Username (사용자명)
- 길이: 3~30자
- 허용 문자: 영문자, 숫자, 언더스코어 (`_`)
- 중복 불가

### Password (비밀번호)
- 길이: 최소 8자
- 조건: 영문/숫자/특수문자 중 **2가지 이상** 포함
- Django 기본 검증 통과 필요
  - 일반적인 비밀번호 거부
  - 사용자 정보와 유사성 검사

### Codeforces ID
- 길이: 3~24자
- 허용 문자: 영문자, 숫자, 언더스코어 (`_`)
- 중복 불가

### Student ID (학번)
- 길이: 최대 20자
- 필수 입력
- 중복 불가

### ELO Rating
- 범위: 제한 없음 (정수)
- 기본값: 1500
- 사용자 수정 불가 (read_only)

---

## 보안

### 비밀번호
- **해싱:** PBKDF2_SHA256 (Django 기본)
- **솔팅:** 자동 생성
- **반복 횟수:** 600,000회 (Django 5.x 기본값)

### 세션
```python
SESSION_COOKIE_HTTPONLY = True    # JavaScript 접근 차단
SESSION_COOKIE_SAMESITE = 'Lax'   # CSRF 방지
SESSION_COOKIE_AGE = 86400        # 24시간
```

### CORS
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173"
]
CORS_ALLOW_CREDENTIALS = True
```

### CSRF
- Django CSRF 미들웨어 활성화
- 프론트엔드에서 `X-CSRFToken` 헤더 전송 필요

---

## 설치 및 실행

### 1. 마이그레이션
```bash
cd backend
python manage.py makemigrations user
python manage.py migrate
```

### 2. 서버 실행
```bash
python manage.py runserver
```

### 3. 관리자 계정 생성
```bash
python manage.py createsuperuser
```
관리자 API를 사용하려면 superuser 또는 staff 권한이 필요합니다.

---

## 관리자 사용 가이드

### 관리자 권한 확인
- Django Admin: `http://localhost:8000/admin/`
- `is_staff=True` 또는 `is_superuser=True` 필요

### ELO 레이팅 수정 방법

**방법 1: 관리자 API 사용 (권장)**
```bash
curl -X PATCH http://localhost:8000/api/users/admin/users/1/elo/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"elo_rating": 2000}'
```

**방법 2: Django Admin 페이지**
1. `http://localhost:8000/admin/` 접속
2. "사용자 프로필" 메뉴 클릭
3. 수정할 사용자 선택
4. ELO rating 필드 수정 후 저장

---

## 문제 해결

### Q: 관리자 API 호출 시 403 Forbidden이 발생합니다
**A:** `is_staff=True` 또는 `is_superuser=True` 권한이 필요합니다. `python manage.py createsuperuser`로 관리자 계정을 생성하거나, Django Admin에서 기존 사용자에게 staff 권한을 부여하세요.

### Q: 회원 목록 API가 너무 느립니다
**A:** 페이지네이션을 사용하세요. `?page=1&limit=20` 파라미터로 한 번에 조회할 데이터 양을 제한할 수 있습니다.
