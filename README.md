# Korean-codeforces (CSForces)

Codeforces 방식의 교내 코딩 대회를 운영하기 위한 웹 플랫폼입니다. 대회 생성, 실시간 스코어보드, 레이팅 산정까지 대회 운영에 필요한 기능을 제공합니다.

## 주요 기능

- Codeforces API 연동으로 대회/문제 정보 자동 동기화
- 가상 대회(Virtual Contest) 참가, 실시간 스코어보드, 종료 전 프리즈(freeze) 기능
- 대회 종료 후 ELO 레이팅 자동 계산 및 반영
- 대회 해설 PDF 업로드/다운로드 (대회 종료 후 참가자 전용)
- 관리자용 대회/문제/참가자 관리 API
- Celery 스케줄러를 통한 대회 상태 자동 갱신

## 기술 스택

- **Backend**: Django, Django REST Framework, Celery, Redis
- **Frontend**: React, TypeScript, Vite
- **Infra**: Docker, Nginx, GitHub Actions (Azure VM 배포)

## 실행 방법

```bash
git clone https://github.com/Terra0305/Korean-codeforces.git
cd Korean-codeforces
cp backend/.env.example backend/.env  # 값 채우기
docker compose up --build
```

프론트엔드는 80/443, 백엔드는 8000 포트로 실행됩니다.

## 폴더 구조

```
backend/    Django 프로젝트 (contest, user 앱)
frontend/   React 클라이언트
```
