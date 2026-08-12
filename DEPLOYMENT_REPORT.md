# 인프라 아키텍처 및 배포 리포트

## 1. 아키텍처 개요

본 프로젝트는 비용 효율적인 운영과 유연한 확장을 목적으로 Azure VM 기반의 컨테이너 환경으로 구축되었습니다.

### 시스템 구성
- **Infrastructure**: Microsoft Azure Virtual Machine (Standard B1s)
- **OS**: Ubuntu 24.04 LTS
- **Orchestration**: Docker Compose
- **Network**: Azure NSG (Network Security Group)

### 접속 정보
- **Web**: http://csforces.koreacentral.cloudapp.azure.com
- **Admin**: http://csforces.koreacentral.cloudapp.azure.com/admin

### 구성 다이어그램
User -> Azure Load Balancer -> Azure VM (Nginx) -> Django / React Container

## 2. 주요 기술적 의사결정

### 단일 VM 기반 컨테이너 통합
초기 MSA(Microservices Architecture) 지향의 PaaS 분리 모델(App Service + Static Web App)에서 단일 VM 모델로 전환했습니다.
- **비용 절감**: 분산 리소스 사용으로 인한 비용을 단일 인스턴스 비용(월 $10 미만)으로 통합하여 약 80% 절감.
- **관리 효율성**: 배포 포인트 단일화 및 Docker Compose를 통한 서비스 의존성 관리가 용이해짐.

### Swap Memory를 활용한 리소스 최적화
- **배경**: B1s 인스턴스의 물리적 RAM(1GB) 제약으로 인해 빌드 및 배포 시 OOM(Out of Memory) 현상 발생.
- **조치**: 디스크 IO 부하를 감수하고 가용성을 확보하기 위해 Swap File(2GB) 생성 및 적용.
- **결과**: 빌드 타임의 일시적 메모리 스파이크를 Swap 영역에서 처리하여, 추가적인 하드웨어 스케일업 없이 안정적인 배포 파이프라인 확보.

## 3. 배포 파이프라인 (CI/CD)

GitHub Actions를 활용한 자동화된 배포 프로세스를 구축했습니다.

1. **Source Control**: GitHub Repository (dev branch)
2. **Trigger**: Push Event 감지
3. **Execution**: Azure VM SSH 접속 및 Docker Compose 빌드/재기동
4. **Maintenance**: Dangling Image 정리를 통한 스토리지 최적화

## 4. 운영 가이드

### 서비스 제어
- 서비스 시작/재시작: `docker compose up -d --build`
- 서비스 중지: `docker compose down`

### 모니터링
- Backend Log: `docker logs -f backend`
- Nginx Log: `docker logs -f nginx`
- System Resource: `htop` 또는 `free -h`
