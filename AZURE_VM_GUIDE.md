# Azure VM 배포 가이드 (Korean-codeforces)

이 문서는 Azure Virtual Machine (VM)을 생성하고, Docker를 사용하여 프로젝트를 배포하는 과정을 다룹니다.

## 1. 사전 준비 (완료됨)
*   **Docker 설정**: `Dockerfile`, `docker-compose.yml` 등은 이미 프로젝트에 준비되어 있습니다.
*   **Git**: 프로젝트가 GitHub `dev` 브랜치에 최신 상태로 올라가 있어야 합니다.

## 2. Azure VM 생성
우리는 **Ubuntu 22.04 LTS** 이미지를 사용하는 가장 저렴한(B1s) 가상머신을 생성할 것입니다.

### CLI로 생성하기 (추천)
```bash
# 리소스 그룹 생성 (이미 있으면 생략)
az group create --name myResourceGroup --location koreacentral

# VM 생성 (SSH 키 자동 생성)
az vm create \
  --resource-group myResourceGroup \
  --name KoreanCodeforcesVM \
  --image Ubuntu2204 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --size Standard_B1s
```

## 3. 포트 개방 (방화벽 설정)
웹 서버(80, 8000) 접속을 위해 포트를 열어야 합니다.

```bash
az vm open-port --resource-group myResourceGroup --name KoreanCodeforcesVM --port 80
az vm open-port --resource-group myResourceGroup --name KoreanCodeforcesVM --port 8000
az vm open-port --resource-group myResourceGroup --name KoreanCodeforcesVM --port 22
```

## 4. VM 접속 및 설정
생성된 VM의 IP 주소(Public IP)를 확인하고 SSH로 접속합니다.

```bash
# IP 주소 확인
az vm show --resource-group myResourceGroup --name KoreanCodeforcesVM -d --query [publicIps] -o tsv

# SSH 접속
ssh azureuser@<VM-IP-ADDRESS>
```

### 서버 내부 설정 (한방 명령어)
접속 후 아래 명령어를 순서대로 실행하여 Docker를 설치하고 서버를 켭니다.

```bash
# 1. 시스템 업데이트 및 Docker 설치 (한 줄씩 복사해서 실행하세요)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. 권한 적용 (필수: 여기서 일단 로그아웃 됩니다)
exit

# 3. [내 컴퓨터] 다시 SSH 접속
ssh azureuser@<VM-IP-ADDRESS>

# 4. 소스코드 다운로드
git clone https://github.com/Terra0305/Korean-codefoce.git
cd Korean-codefoce
git checkout dev

# 5. 서버 실행 (자동으로 빌드되고 켜집니다)
docker compose up -d --build
```

## 5. 접속 확인
브라우저 주소창에 `http://<VM-IP-ADDRESS>`를 입력하여 접속합니다.
