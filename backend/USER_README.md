# 회원 시스템 (User System)

Korean-Codeforces 프로젝트의 회원 관리 시스템입니다.

## 핵심 정보 요약

### 인증 방식
- **Session 기반 인증** (쿠키 사용)
- Django 기본 User 모델 + Profile 확장



### 회원가입 필수 항목
- `username` (로그인 ID)
- `password` (비밀번호)
- `codeforces_id` (Codeforces 아이디)
- `school` (학교명)
- `department` (학과명)
- `student_id` (학번)
- `real_name` (실명)


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

### Codeforces 검증
- `GET /api/users/verify-codeforces/?handle=XXX` - Codeforces ID 검증

### 프로필
- `GET /api/users/profile/` - 내 프로필 조회
- `PUT /api/users/profile/` - 프로필 전체 수정
- `PATCH /api/users/profile/` - 프로필 부분 수정
- `GET /api/users/profile/search/?name=XXX` - 이름 검색

### 비밀번호
- `POST /api/users/change-password/` - 비밀번호 변경

### 관리자 전용 (IsAdminUser 권한 필요)
- `GET /api/users/admin/users/` - 전체 회원 목록 조회 (페이지네이션, 검색)
- `GET /api/users/admin/users/<user_id>/` - 특정 회원 상세 조회
- `GET /api/users/admin/stats/` - 회원 통계

**총 13개 API**

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
   - `codeforces_id` **실제 존재 여부 확인 (Codeforces API 호출)**
   - `student_id` 중복 확인 (입력 시)
   - 비밀번호 일치 확인 (`password` == `password_confirm`)
   - 비밀번호 강도 검증
2. `User` 생성 (Django 기본 테이블)
3. `Profile` 생성 (1:1 연결)
   - `elo_rating`은 기본값 1500으로 설정
   - `codeforces_id`는 대소문자 정규화되어 저장 (Codeforces 공식 핸들)
4. 응답 (201 Created)




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
      "elo_rating": 1500
    }
  }
}
```

**코드 위치:** `user/views.py:LoginView`

---

### 3. 로그아웃

**요청:**
```json
POST /api/users/logout/
```

**처리 순서:**
1. Django 세션 삭제: `logout(request)`
2. 쿠키 제거
3. 응답 (200 OK)

**응답:**
```json
{
  "message": "로그아웃 되었습니다."
}
```

**권한:** 로그인 필요 (`IsAuthenticated`)

**코드 위치:** `user/views.py:LogoutView`

---

### 4. 현재 사용자 정보 조회

**요청:**
```http
GET /api/users/me/
```

**처리 순서:**
1. 세션에서 현재 로그인한 사용자 정보 조회
2. 연결된 프로필 정보 조회
3. 응답 (200 OK)

**응답:**
```json
{
  "id": 1,
  "username": "testuser",
  "profile": {
    "school": "서울대학교",
    "department": "컴퓨터공학부",
    "student_id": "2024001",
    "real_name": "홍길동",
    "codeforces_id": "testcf123",
    "elo_rating": 1500
  }
}
```

**참고:** 로그인/현재 사용자 조회 시에는 `created_at`, `updated_at` 필드를 제외합니다. 이 정보가 필요한 경우 프로필 조회 API(`GET /api/users/profile/`)를 사용하세요.

**권한:** 로그인 필요 (`IsAuthenticated`)

**코드 위치:** `user/views.py:CurrentUserView`

---

### 5. Codeforces ID 검증

**요청:**
```http
GET /api/users/verify-codeforces/?handle=tourist
```

**쿼리 파라미터:**
- `handle` - Codeforces handle (필수)

**처리 순서:**
1. Codeforces API 호출: `https://codeforces.com/api/user.info?handles={handle}`
2. API 응답 확인
3. 사용자 정보 반환 (존재하는 경우)

**응답 (200 OK - 사용자 존재):**
```json
{
  "exists": true,
  "handle": "tourist"
}
```

**응답 (404 Not Found - 사용자 없음):**
```json
{
  "exists": false,
  "message": "해당 Codeforces handle이 존재하지 않습니다."
}
```

**에러 응답 (400 Bad Request):**
```json
{
  "error": "Codeforces handle을 입력해주세요."
}
```

**에러 응답 (503 Service Unavailable):**
```json
{
  "exists": false,
  "error": "Codeforces API 호출에 실패했습니다."
}
```

**에러 응답 (504 Gateway Timeout):**
```json
{
  "exists": false,
  "error": "Codeforces API 응답 시간이 초과되었습니다."
}
```

**권한:** 누구나 접근 가능 (`AllowAny`)

**사용 예시:**
- 회원가입 시 Codeforces ID 유효성 검증
- 프로필 수정 시 Codeforces ID 변경 전 검증

**참고:**
- Codeforces 공식 API (`https://codeforces.com/apiHelp/methods#user.info`)를 사용
- 타임아웃: 10초
- 단순히 handle의 존재 여부만 확인

**코드 위치:** `user/views.py:VerifyCodeforcesView`

---

### 6. 프로필 수정

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

### 7. 이름으로 사용자 검색

**요청:**
```http
GET /api/users/profile/search/?name=홍길동
```

**쿼리 파라미터:**
- `name` - 검색할 이름 (필수, 부분 일치 검색)

**응답:**
```json
[
  {
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
```

**에러 응답 (400 Bad Request):**
```json
{
  "error": "검색할 이름을 입력해주세요."
}
```

**권한:** 로그인 필요 (`IsAuthenticated`)

**코드 위치:** `user/views.py:ProfileViewSet.search`

---

### 8. 비밀번호 변경

**요청:**
```json
POST /api/users/change-password/
{
  "old_password": "OldPass123!",
  "new_password": "NewPass456!",
  "new_password_confirm": "NewPass456!"
}
```

**처리 순서:**
1. 현재 비밀번호 확인 (`old_password` 검증)
2. 새 비밀번호 일치 확인 (`new_password` == `new_password_confirm`)
3. 비밀번호 강도 검증
4. 비밀번호 업데이트
5. 응답 (200 OK)

**응답:**
```json
{
  "message": "비밀번호가 성공적으로 변경되었습니다."
}
```

**에러 응답 (400 Bad Request):**
```json
{
  "old_password": ["현재 비밀번호가 일치하지 않습니다."],
  "new_password": ["새 비밀번호는 최소 8자 이상이어야 합니다."]
}
```

**권한:** 로그인 필요 (`IsAuthenticated`)

**코드 위치:** `user/views.py:PasswordChangeView`

---

### 9. 관리자 API (Admin Only)

관리자 권한(`is_staff=True` 또는 `is_superuser=True`)이 필요합니다.

#### 9-1. 전체 회원 목록 조회

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

#### 9-2. 특정 회원 상세 조회

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

#### 9-3. 회원 통계

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
- **실제 존재 여부 검증 (NEW):**
  - 회원가입 시 Codeforces API(`user.info`)를 호출하여 실제 존재하는 핸들인지 자동 확인
  - 존재하지 않는 핸들로는 가입 불가
  - 대소문자 정규화 적용 (Codeforces 공식 핸들로 저장)

### Student ID (학번)
- 길이: 최대 20자
- 필수 입력
- 중복 불가

### ELO Rating
- 범위: 제한 없음 (정수)
- 기본값: 1500
- 사용자 수정 불가 (read_only)

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

