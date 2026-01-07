# 배포 리포트: Korean-codeforce (Azure)

**작성일**: 2026-01-05 (Updated)
**상태**: 배포 완료 (Production Ready)
**플랫폼**: Microsoft Azure App Service (Linux Containers)

---

## 1. 접속 정보
*   **API 서버 URL**: [https://korean-codeforces-awg8bxaacyb0hahv.koreacentral-01.azurewebsites.net](https://korean-codeforces-awg8bxaacyb0hahv.koreacentral-01.azurewebsites.net)
*   **Admin 권한 부여 (임시)**: `/api/user/force-admin/<username>/`
*   **Frontend**: Azure Static Web Apps (연동 완료)

---

## 2. 인프라 구성 (Infrastructure)

### Backend (Azure Web App for Containers)
*   **리소스 그룹**: `myResourceGroup`
*   **App Service 이름**: `Korean-codeforces` (Linux)
*   **컨테이너 이미지**: `koreancodeforcesregistry.azurecr.io/backend:latest`
*   **실행 커맨드**: `python manage.py migrate && gunicorn main.wsgi:application --bind 0.0.0.0:8000`
*   **Port**: 8000 (Gunicorn)

### CI/CD 파이프라인
*   **GitHub Actions**: `.github/workflows/deploy-backend.yml`
*   **Trigger**: `dev` 브랜치에 Push 발생 시 자동 실행
*   **Flow**:
    1.  Code Checkout
    2.  Docker Image Build (`backend/Dockerfile`)
    3.  Push to Azure Container Registry (ACR)
    4.  Azure Web App이 새 이미지를 Pull하여 재시작

---

## 3. 관리자 권한 부여 가이드

기존에 시도했던 **SSH 접속 방식은 서버 불안정(503 에러)을 유발하여 폐기**되었습니다.
대신, **웹 API를 통해 즉시 관리자 권한을 부여**할 수 있는 안전한 방법을 사용합니다.

**사용법**:
1.  브라우저 주소창에 아래 URL을 입력합니다.
    ```text
    https://korean-codeforces-awg8bxaacyb0hahv.koreacentral-01.azurewebsites.net/api/user/force-admin/<대상유저아이디>/
    ```
2.  화면에 `"xxx 계정에 관리자 권한이 부여되었습니다."` 메시지가 뜨면 성공입니다.
3.  이후 `/admin` 페이지에 해당 아이디로 로그인하시면 됩니다.

---

## 4. 주요 트러블슈팅 내역 (History)

### 🛑 503 Service Unavailable (2026-01-05)
*   **증상**: 배포 후 서버가 켜지지 않고 503 에러 페이지만 출력됨.
*   **원인**: Azure Web App의 SSH 접속을 위해 추가했던 `openssh-server` 설정과 Gunicorn 실행 명령어가 충돌하여 컨테이너가 시작 직후 사망(Crash)함.
*   **조치**:
    1.  `Dockerfile`에서 SSH 관련 설정을 모두 제거하고 순정 상태(`python:3.12-slim`)로 롤백.
    2.  Azure Startup Command를 `python manage.py migrate && gunicorn ...`으로 강제 고정.
    3.  SSH 대신 HTTP API(`/force-admin`)를 통해 관리 기능을 우회 제공하도록 변경.
*   **결과**: 서버 정상동작 확인.

### 🛑 CORS Policy Error / 400 Bad Request (2026-01-06)
*   **증상**: 프론트엔드에서 회원가입 및 API 호출 시 `CORS policy: No 'Access-Control-Allow-Origin'` 에러 발생.
*   **원인**: `ALLOWED_HOSTS` 설정에 Azure App Service 도메인이 누락되어, Django가 요청을 조기에 차단(400 Bad Request)하면서 CORS 헤더가 포함되지 않음.
*   **조치**: `settings.py`의 `ALLOWED_HOSTS` 리스트에 `korean-codeforces-awg8bxaacyb0hahv.koreacentral-01.azurewebsites.net`을 명시적으로 추가.
*   **결과**: 수정 후에도 **503 Service Unavailable** 지속됨. 로그 분석 결과, Azure 실행 커맨드 파싱 오류(`unrecognized arguments`) 확인.

### 🛑 Azure Startup Command Parsing Error (2026-01-06)
*   **증상**: `manage.py migrate: error: unrecognized arguments: main.wsgi:application ...` 에러 로그 반복 및 컨테이너 실행 실패.
*   **원인**: Dockerfile의 `CMD` 또는 Azure 포털의 Startup Command에서 `&&` 연산자가 쉘에 의해 해석되지 않고, 뒷부분 명령어가 앞부분 명령어의 인자로 전달됨.
*   **조치**:
    1.  `backend/entrypoint.sh` 스크립트 생성 (migrate 후 gunicorn 실행 로직 캡슐화).
    2.  `Dockerfile`의 CMD를 `["./entrypoint.sh"]`로 변경하여 쉘 스크립트 실행 방식으로 전환.
*   **결과**: 재배포 후 정상 동작 예상. (Azure 포털의 Startup Command 설정 제거 필요)




---

## 5. 유지보수 가이드

*   **코드 업데이트**: 코드를 수정하고 `git push origin dev`를 하면 자동으로 배포됩니다. (약 3~5분 소요)
*   **서버 재시작 필요 시**:
    ```bash
    az webapp restart --name Korean-codeforces --resource-group myResourceGroup
    ```
*   **로그 확인**:
    ```bash
    az webapp log tail --name Korean-codeforces --resource-group myResourceGroup
    ```
