# 보안 패치 내역

## 수정 일자: 2026-03-22

---

## 수정 항목

### 1. SECRET_KEY 하드코딩 제거 (`backend/main/settings.py`)

**문제:** Django SECRET_KEY가 소스코드에 하드코딩되어 Git 히스토리에 영구 노출.
**수정:** 환경변수 `DJANGO_SECRET_KEY`에서 읽도록 변경.

```python
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-local-dev-only-...')
```

**필요 조치:** Render 대시보드 → Environment Variables에 `DJANGO_SECRET_KEY` 추가.
새 키 생성 명령어:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

### 2. DEBUG 하드코딩 제거 (`backend/main/settings.py`)

**문제:** `DEBUG = True`가 하드코딩되어 프로덕션에서도 상세 오류 정보가 노출됨.
**수정:** 환경변수 `DEBUG`에서 읽도록 변경.

```python
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
```

**필요 조치:** Render 대시보드에 `DEBUG=False` 설정. 로컬 개발 시에는 `.env`에 `DEBUG=True`.

---

### 3. 프론트엔드 로그아웃 서버 세션 미무효화 수정 (`frontend/app/src/context/AuthContext.tsx`)

**문제:** `logout()`이 React 상태만 초기화하고 서버 API를 호출하지 않아 세션 쿠키가 24시간 동안 유효하게 남음.
**수정:** 로그아웃 시 `POST /api/users/logout/` 호출 후 상태 초기화. API 실패해도 로컬 상태는 반드시 초기화.

```typescript
const logout = async () => {
    try {
        await client.post("/users/logout/");
    } catch (error) {
        console.error("Logout API failed:", error);
    } finally {
        setUser(null);
    }
};
```

---

### 4. `limit` 파라미터 타입 미검증 500 에러 수정 (`backend/user/views.py`)

**문제:** `int(request.query_params.get('limit', 10))`에 숫자가 아닌 값(`?limit=abc`)이 들어오면 `ValueError`로 500 에러 발생.
**수정:** `ProfileViewSet.top()` 및 `AdminUserListView.get()` 양쪽에 try/except 적용.

```python
try:
    limit = int(request.query_params.get('limit', 10))
except (ValueError, TypeError):
    limit = 10
```

---

### 5. BrowsableAPIRenderer 프로덕션 비활성화 (`backend/main/settings.py`)

**문제:** DRF 브라우저 UI가 프로덕션에서도 활성화되어 API 구조 전체가 노출됨.
**수정:** `DEBUG=False`일 때 자동으로 비활성화.

```python
'DEFAULT_RENDERER_CLASSES': [
    'rest_framework.renderers.JSONRenderer',
] + (['rest_framework.renderers.BrowsableAPIRenderer'] if DEBUG else []),
```

---

## 배포 시 필수 환경변수 설정 (Render 대시보드)

| 환경변수 | 값 | 비고 |
|---|---|---|
| `DJANGO_SECRET_KEY` | 새로 생성한 랜덤 키 | 위 명령어로 생성 |
| `DEBUG` | `False` | 반드시 False |

`.env.example` 파일을 참고하여 로컬 개발용 `.env` 파일을 생성하세요.

---

## 미수정 항목 (추후 대응 권장)

| 번호 | 항목 | 심각도 |
|---|---|---|
| 4 | 로그인 Rate Limiting 없음 | 🟠 HIGH |
| 5 | 공개 랭킹 API에서 학번/실명 노출 | 🟠 HIGH |
| 6 | `limit` 파라미터 상한선 없음 (DoS) | 🟠 HIGH |
| 8 | `SESSION_COOKIE_SECURE` 미설정 | 🟡 MEDIUM |
| 10 | SQLite 프로덕션 사용 | 🟡 MEDIUM |
| 11 | HTTPS 강제 설정 없음 | 🟡 MEDIUM |
| 12 | 보안 이벤트 로깅 없음 | 🟡 MEDIUM |
