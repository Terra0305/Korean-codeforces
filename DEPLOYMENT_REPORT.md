# Azure 배포 완료 보고서 (Deployment Report)

이 문서는 **Korean-codeforce** 프로젝트의 Azure 배포 작업 내역과 현재 설정을 정리한 문서입니다.

## 1. 배포 아키텍처 (Architecture)

| 컴포넌트 | 기술 스택 | 배포 방식 | Azure 리소스 |
| :--- | :--- | :--- | :--- |
| **Backend** | Django (Python 3.12) | Docker Container | **Azure App Service** (Linux) |
| **Frontend** | React (Vite, TypeScript) | Static Site | **Azure Static Web Apps** |
| **Database** | SQLite (현재) | Docker 내장 파일 | (App Service 내부 스토리지) |
| **Registry** | Docker Image 저장소 | - | **Azure Container Registry (ACR)** |

## 2. 생성된 Azure 리소스 정보

| 리소스 종류 | 이름 (Name) | 지역 (Region) | 설 명 |
| :--- | :--- | :--- | :--- |
| **Resource Group** | `myResourceGroup` | `koreacentral` | 모든 리소스를 담는 그룹 |
| **Container Registry** | `koreancodeforcesregistry` | `koreacentral` | 백엔드/프론트엔드 Docker 이미지 저장소 |
| **App Service** (Backend) | `Korean-codeforces` | `koreacentral` | 백엔드 API 서버 |
| **Static Web App** (Frontend) | `Korean-forces` | `eastasia` | 프론트엔드 웹 호스팅 |

## 3. 주요 환경 변수 설정 (Configuration)

### Backend (App Service: `Korean-codeforces`)
설정 위치: *Settings > Environment variables*

| 키 (Key) | 값 (Value) | 역할 |
| :--- | :--- | :--- |
| `WEBSITES_PORT` | `8000` | Django 컨테이너가 사용하는 포트 지정 (필수) |
| `ALLOWED_HOSTS` | `*` (또는 도메인) | 접속 허용 호스트 |
| `CORS_ALLOWED_ORIGINS` | Front URL | 프론트엔드에서의 API 호출 허용 |
| `CSRF_TRUSTED_ORIGINS` | Front URL | CSRF 보안 검사 통과용 |

### Frontend (Static Web App: `Korean-forces`)
설정 위치: *Settings > Environment variables*

| 키 (Key) | 값 (Value) | 역할 |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://korean-codeforces.azurewebsites.net` | 백엔드 API 서버 주소 |

## 4. 작업 히스토리 & 트러블슈팅

1.  **Docker화 (Dockerization)**
    *   `backend/Dockerfile`: Python 3.12 + Gunicorn 설정.
    *   `frontend/app/Dockerfile`: Node.js 20 빌드 설정을 위한 `package.json` 엔진 버전 명시 (`>=20.0.0`).

2.  **배포 과정**
    *   Azure CLI를 사용하여 리소스 그룹 및 ACR 생성 (`az group create`, `az acr create`).
    *   `MissingSubscriptionRegistration` 오류 해결: `Microsoft.ContainerRegistry` 공급자 등록 완료.
    *   Docker 이미지를 빌드하여 ACR에 업로드 (`docker push`).

3.  **연동 및 문제 해결**
    *   백엔드 배포 후 `WEBSITES_PORT=8000` 설정을 통해 접속 불가 문제 해결.
    *   프론트엔드 배포(GitHub Actions) 시 Node.js 버전 호환성 문제 발생 -> `package.json` 수정으로 해결.
    *   프론트엔드 라우팅 및 API 호출을 위한 `VITE_API_BASE_URL` 환경 변수 주입 완료.
    *   **404 및 400 Bad Request 해결**: 백엔드 `ALLOWED_HOSTS`가 비어있어 접속이 차단됨 -> `*` (전체 허용)으로 변경하여 해결.
    *   **할당량 초과(Quota Exceeded) 이슈**: 무료(F1) 요금제의 CPU 한도 도달 -> **Basic (B1) 또는 Shared (D1) 요금제로 업그레이드 권장**.
    *   **이미지 가져오기 실패(ImagePullFailure)**: App Service가 ACR에 접근할 권한이 없음 -> ACR 관리자 계정 활성화 후 App Service 배포 센터에 자격 증명(ID/PW) 등록하여 해결.

## 5. 유지보수 및 업데이트 방법

*   **Frontend**: 코드를 수정하고 `feature/azure-deployment` (또는 연결된 브랜치)에 `git push` 하면 **자동으로 배포**됩니다.
*   **Backend**: 코드를 수정한 뒤, 로컬에서 Docker 이미지를 빌드하고 ACR로 푸시(`docker push`)한 다음, App Service를 재시작하거나 웹훅을 설정해야 합니다. (현재는 수동 푸시 방식)

---
*작성일: 2025-12-30*
*작성자: Antigravity (AI Assistant)*
