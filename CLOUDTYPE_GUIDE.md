# CloudType(클라우드타입) 배포 가이드

[CloudType](https://cloudtype.io)은 한국어 기반의 클라우드 플랫폼으로, GitHub와 연동하여 매우 쉽게 배포할 수 있습니다. 이미 `Dockerfile` 설정이 완료되어 있으므로 클릭 몇 번으로 배포가 가능합니다.

---

## 1. 사전 준비 (계정 가입)
1. [CloudType 홈페이지](https://cloudtype.io) 접속.
2. **'시작하기'** 클릭 후 **GitHub 계정으로 로그인**.
3. 새 스페이스(프로젝트 공간) 생성. (이름은 자유, 예: `my-project`)

---

## 2. 백엔드 배포 (Django)
가장 먼저 백엔드를 배포하여 서버 주소를 얻어야 합니다.

1. CloudType 대시보드에서 **[+ 새 프로젝트]** -> **[저장소에서 불러오기]** 클릭.
2. 본인의 GitHub 리포지토리(`Korean-codeforce`) 선택.
3. 설정 화면에서 다음과 같이 입력:
   *   **이름**: `backend` (원하는 이름)
   *   **언어/프레임워크**: `Dockerfile` (자동 감지될 것임)
   *   **Context Path**: `.` (기본값 유지)
   *   **Dockerfile Path**: `backend/Dockerfile` (**중요: 경로 수정**)
   *   **Container Port**: `8000` (**중요: 8000으로 변경**)
4. **[배포하기]** 클릭.
5. 배포가 시작되면 **로그**를 확인합니다. "Listening at: http://0.0.0.0:8000" 뜨면 성공.
6. 배포 완료 후 상단의 **웹사이트 주소(URL)** 복사해두기. (예: `https://backend-xxx.cloudtype.app`)

> **⚠️ 주의 (데이터 저장)**
> CloudType 무료 버전은 배포를 새로 하거나 시간이 지나면 **SQLite 파일(`db.sqlite3`)이 초기화**되어 회원가입 정보가 사라집니다.
> 영구 저장을 원하시면 CloudType에서 **PostgreSQL**을 추가로 생성해서 연결해야 합니다. (일단은 테스트를 위해 그냥 진행 추천)

---

## 3. 프론트엔드 배포 (React)
백엔드 주소를 알았으니 프론트엔드를 배포합니다.

1. 대시보드에서 **[+]** 버튼 눌러서 서비스 추가.
2. 동일한 GitHub 리포지토리(`Korean-codeforce`) 선택.
3. 설정 화면에서:
   *   **이름**: `frontend`
   *   **언어/프레임워크**: `Dockerfile` (또는 React/Vite 선택 가능하지만 Dockerfile 추천)
   *   **Context Path**: `.` (기본값 유지)
   *   **Dockerfile Path**: `frontend/app/Dockerfile` (**중요: 경로 수정**)
   *   **Container Port**: `80` (Dockerfile에서 80으로 설정함)
4. **환경 변수 (Environment Variables)** 설정 (**필수!**)
   *   아래 설정을 추가합니다.
   *   **Key**: `VITE_API_BASE_URL`
   *   **Value**: 아까 복사한 백엔드 주소 (예: `https://backend-xxx.cloudtype.app`)
5. **[배포하기]** 클릭.

---

## 4. 최종 연결 확인 (CORS 설정)
프론트엔드 배포가 완료되면 프론트엔드 주소(`https://frontend-xxx.cloudtype.app`)가 생깁니다.
**백엔드가 이 주소를 허용하도록 설정을 업데이트**해야 합니다.

1. CloudType 대시보드에서 **`backend`** 서비스 클릭 -> **설정(Settings)** 탭.
2. **환경 변수** 섹션에 다음을 추가하고 **저장 및 재배포**:
   *   **Key**: `CORS_ALLOWED_ORIGINS`
   *   **Value**: 프론트엔드 주소 (예: `https://frontend-xxx.cloudtype.app`)
   *   **Key**: `CSRF_TRUSTED_ORIGINS`
   *   **Value**: 프론트엔드 주소
   *   (참고: `ALLOWED_HOSTS`는 우리가 코드에서 `*`로 처리해둬서 따로 안 해도 됨)

3. 재배포 완료되면 프론트엔드 접속해서 **회원가입** 테스트!
