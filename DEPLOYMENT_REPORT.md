# 배포 완료 보고서 (Deployment Report)

**Korean-codeforce** 프로젝트의 최종 배포 작업 내역과 현재 설정을 정리한 문서입니다.
초기에는 Azure 배포를 시도했으나, 할당량(Quota) 및 비용 문제로 인해 **Render.com**으로 마이그레이션하여 최종 성공했습니다.

---

## 1. 최종 배포 정보 (Production Info)

### 🚀 접속 링크
*   **Web Site (Frontend)**: [https://frontend-28mi.onrender.com](https://frontend-28mi.onrender.com)
*   **API Server (Backend)**: [https://korean-codeforces.onrender.com](https://korean-codeforces.onrender.com)

### 📌 아키텍처 (Architecture)

| 컴포넌트 | 기술 스택 | 배포 플랫폼 | 상세 방식 |
| :--- | :--- | :--- | :--- |
| **Backend** | Django (Python 3.12) | **Render** | Docker Container (Web Service) |
| **Frontend** | React (Vite, TypeScript) | **Render** | Static Site (Node.js Build) |
| **Database** | SQLite | - | Container 내장 (비영구적, 재배포 시 초기화됨) |

---

## 2. Render 리소스 구성 (Configuration)

### A. Backend (Web Service)
*   **Name**: `backend` (또는 `korean-codeforces`)
*   **Runtime**: Docker
*   **Build Command**: (Dockerfile 사용)
*   **Start Command**: `gunicorn main.wsgi:application --bind 0.0.0.0:8000` (Dockerfile 내 CMD)
*   **환경 변수 (Environment Variables)**:
    *   `WEBSITES_PORT`: `8000`
    *   `ALLOWED_HOSTS`: `*`
    *   `SECRET_KEY`: (임의의 비밀값)
    *   `CORS_ALLOWED_ORIGINS`: `https://frontend-28mi.onrender.com` (프론트엔드 주소)
    *   `CSRF_TRUSTED_ORIGINS`: `https://frontend-28mi.onrender.com`

### B. Frontend (Static Site)
*   **Name**: `frontend` (또는 `frontend-28mi`)
*   **Build Command**: `npm install && npm run build`
*   **Publish Directory**: `dist`
*   **환경 변수 (Environment Variables)**:
    *   `VITE_API_BASE_URL`: `https://korean-codeforces.onrender.com` (백엔드 주소)

---

## 3. 작업 히스토리 & 트러블슈팅 (Troubleshooting)

배포 과정에서 발생한 주요 문제와 해결 방법을 기록합니다.

### 1단계: Azure 배포 시도 (중단)
*   **문제**: 무료(F1) 티어 사용 시 CPU 할당량 초과(Quota Exceeded)로 서버가 계속 중단됨.
*   **해결**: 비용 문제로 인해 **Render.com 마이그레이션 결정**.

### 2단계: CloudType 마이그레이션 시도 (중단)
*   **문제**: 무료 플랜의 프로젝트/레포지토리 개수 제한으로 진행 불가.
*   **해결**: 전 세계적으로 가장 많이 사용되는 무료 호스팅인 **Render**로 재변경.

### 3단계: Render 배포 및 안정화 (성공)
1.  **빌드 경로 문제 (requirements.txt not found)**
    *   **원인**: Render가 루트(`Root Directory`)에서 빌드를 시작하는데, Dockerfile은 `backend/` 폴더 안에 있어서 파일을 못 찾음.
    *   **해결**: Render 설정에서 **Root Directory**를 `backend`로 변경하고 **Dockerfile Path**를 `Dockerfile`로 수정.

2.  **모듈 경로 에러 (ModuleNotFoundError: 'contest.wsgi')**
    *   **원인**: 기존 Dockerfile이 예전 프로젝트명(`contest`)을 참조하고 있었으나, 실제 프로젝트명은 `main`이었음.
    *   **해결**: Dockerfile CMD를 `gunicorn main.wsgi:application ...`으로 수정.

3.  **환경 변수 에러 (NameError: 'os' is not defined)**
    *   **원인**: `settings.py`에서 `os.environ`을 사용했으나, 상단에 `import os`가 누락됨.
    *   **해결**: `backend/main/settings.py`에 `import os` 구문 추가.

4.  **회원가입 실패 (CORS Error)**
    *   **원인**: 프론트엔드(`frontend-28mi`)에서 백엔드로 요청을 보낼 때, 백엔드가 해당 도메인을 차단함.
    *   **해결**: `settings.py`의 `CORS_ALLOWED_ORIGINS` 목록에 프론트엔드 URL(`https://frontend-28mi.onrender.com`)을 명시적으로 추가.

5.  **프론트엔드 빌드 실패 (Empty build command)**
    *   **원인**: Render Static Site 설정에서 빌드 명령어가 비어있었음.
    *   **해결**: `npm install && npm run build` 명령어 입력.

---

## 4. 참고 문서 (Guides)
*   [Render 배포 가이드](file:///Users/parksungmin/Desktop/Projects/KoreanCodeforce/Korean-codefoce/RENDER_GUIDE.md) (`RENDER_GUIDE.md`)
*   [Azure 배포 가이드 (구버전)](file:///Users/parksungmin/.gemini/antigravity/brain/4af528e2-b909-4f14-ac22-97e75478d38a/AZURE_DEPLOYMENT_GUIDE.md)

---
*최종 업데이트: 2025-12-31*
*작성자: Antigravity (AI Assistant)*
