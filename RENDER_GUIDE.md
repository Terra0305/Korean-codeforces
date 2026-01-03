# Render.com 배포 가이드

[Render](https://render.com)는 전 세계적으로 가장 인기 있는 무료 클라우드 서비스 중 하나입니다. GitHub와 연동하여 백엔드(Docker)와 프론트엔드(Static Site)를 무료로 운영할 수 있습니다.

---

## 1. 회원가입 및 준비
1. [Render.com](https://render.com) 접속.
2. **GET STARTED FOR FREE** 클릭 후 **GitHub**로 로그인.

---

## 2. 백엔드 배포 (Web Service)
Docker 이미지를 사용하여 백엔드를 배포합니다.

1. 대시보드에서 **[New +]** -> **Web Service** 클릭.
2. **Build and deploy from a Git repository** 선택 -> **Next**.
3. 리포지토리(`Korean-codeforce`) 연결 (Connect).
4. 설정 화면에서 다음 내용 입력:
   *   **Name**: `backend` (원하는 이름)
   *   **Region**: `Singapore` (그나마 한국과 가까움)
   *   **Branch**: `feature/azure-deployment` (우리가 작업한 브랜치확인!)
   *   **Root Directory**: `.` (그냥 두기)
   *   **Runtime**: **Docker** (중요!)
   *   **Plan**: **Free** 선택.
5. **환경 변수 (Environment Variables)** 섹션으로 이동하여 **Add Environment Variable** 클릭:
   *   **Key**: `ALLOWED_HOSTS`
   *   **Value**: `*`
   *   **Key**: `SECRET_KEY`
   *   **Value**: `django-insecure-test-key-1234` (또는 임의의 문자열)
   *   **Key**: `WEBSITES_PORT`
   *   **Value**: `8000`
6. **[Create Web Service]** 클릭.
7. 배포가 완료되면 상단의 **URL** (예: `https://backend-xxx.onrender.com`)을 복사합니다.

> **참고**: 무료 버전은 15분간 접속이 없으면 절전 모드로 들어갑니다. 다시 접속할 때 약 30초~1분 정도 로딩이 걸릴 수 있습니다.

---

## 3. 프론트엔드 배포 (Static Site)
프론트엔드는 정적 사이트로 배포하여 속도도 빠르고 무료로 이용합니다.

1. 대시보드에서 **[New +]** -> **Static Site** 클릭.
2. 동일한 리포지토리 연결.
3. 설정 화면에서:
   *   **Name**: `frontend`
   *   **Branch**: `feature/azure-deployment`
   *   **Root Directory**: `frontend/app` (**중요: 프론트엔드 폴더 경로**)
   *   **Build Command**: `npm install && npm run build`
   *   **Publish Directory**: `dist`
4. **환경 변수 (Environment Variables)** 추가:
   *   **Key**: `VITE_API_BASE_URL`
   *   **Value**: 아까 복사한 백엔드 주소 (예: `https://backend-xxx.onrender.com`)
5. **[Create Static Site]** 클릭.
6. 배포 완료 후 제공되는 **URL**로 접속하면 끝!

---

## 4. 마지막 연결 (CORS 설정)
프론트엔드 접속 주소(예: `https://frontend-xxx.onrender.com`)가 나왔으니, 백엔드에 알려줘야 합니다.

1. Render 대시보드 -> **`backend`** 서비스 클릭.
2. **Environment** 탭 클릭.
3. 다음 변수 추가:
   *   **Key**: `CORS_ALLOWED_ORIGINS`
   *   **Value**: 프론트엔드 주소
   *   **Key**: `CSRF_TRUSTED_ORIGINS`
   *   **Value**: 프론트엔드 주소
4. **Save Changes** 클릭하면 자동으로 재배포됩니다.

이제 완벽하게 동작합니다!
