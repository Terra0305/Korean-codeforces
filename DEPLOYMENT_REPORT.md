# 배포 리포트: Korean-codeforce
**작성일**: 2025-12-31
**상태**: 배포 완료 (Production Ready)

## 📌 배포 요약
기존 Azure 환경에서의 비용 및 할당량(Quota) 이슈를 해결하기 위해 **Render.com**으로 인프라를 이전했습니다.
현재 백엔드와 프론트엔드 모두 정상 배포되었으며, 회원가입을 포함한 모든 기능이 라이브 환경에서 동작합니다.

---

## 1. 접속 정보
*   **서비스 URL**: [https://frontend-28mi.onrender.com](https://frontend-28mi.onrender.com)
*   **API 서버**: [https://korean-codeforces.onrender.com](https://korean-codeforces.onrender.com)

---

## 2. 인프라 구성 (Infrastructure)

### Backend (Docker Web Service)
*   **플랫폼**: Render
*   **환경**: Python 3.12, Django 5.x
*   **서버 실행**: `gunicorn main.wsgi:application`
*   **주요 설정**:
    *   `ALLOWED_HOSTS`에 전체(`*`) 허용
    *   CORS/CSRF 설정에 프론트엔드 도메인 화이트리스팅 완료

### Frontend (Static Site)
*   **플랫폼**: Render
*   **환경**: React, Vite
*   **빌드**: `npm install && npm run build`
*   **연동**: `VITE_API_BASE_URL` 환경 변수를 통해 백엔드와 통신

---

## 3. 주요 트러블슈팅 내역

### 🛑 Azure & CloudType 이슈
*   **Azure**: F1(Free) 티어의 CPU 할당량 초과로 서버가 지속적으로 중단되는 현상 발생.
*   **CloudType**: 무료 플랜의 리포지토리 개수 제한으로 배포 불가.
*   **결정**: Docker 컨테이너를 무료로 안정적으로 호스팅할 수 있는 Render로 최종 마이그레이션.

### 🐛 배포 과정 디버깅
1.  **빌드 컨텍스트 오류 (`requirements.txt` not found)**
    *   Docker 빌드 시작 위치가 프로젝트 루트가 아닌 `backend` 폴더여야 함. Render 설정에서 `Root Directory`를 변경하여 해결.

2.  **모듈 경로 오류 (`ModuleNotFoundError`)**
    *   기존 Dockerfile 설정이 예전 프로젝트명(`contest`)으로 되어 있어 실행 실패. `main.wsgi`로 수정하여 해결.

3.  **회원가입 API 호출 실패 (CORS)**
    *   프론트엔드에서 회원가입 요청 시 백엔드에서 보안상의 이유로 차단.
    *   Django 설정(`settings.py`)에 프론트엔드 도메인을 명시적으로 허용하여 통신 성공.

---

## 4. 유지보수 가이드
*   **업데이트 방법**: GitHub의 `feature/azure-deployment` 브랜치에 코드를 푸시하면 Render가 자동으로 감지하여 재배포합니다.
*   **데이터베이스**: 현재 SQLite를 사용 중이므로, 서버가 재배포되면 위와 같이 회원 데이터가 초기화됩니다. (테스트 목적)

---
*End of Document*
