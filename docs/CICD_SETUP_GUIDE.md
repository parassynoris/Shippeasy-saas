# Shippeasy — CI/CD Setup Guide

**Pipeline:** Azure DevOps (Azure Pipelines)  
**Container Registry:** Azure Container Registry (ACR)  
**Deployment Target:** AWS EC2 (via AWS Marketplace AMI)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Accounts](#2-prerequisites--accounts)
3. [Azure — Create Container Registry (ACR)](#3-azure--create-container-registry-acr)
4. [Azure — Create ACR Service Principal](#4-azure--create-acr-service-principal)
5. [AWS — Launch EC2 Instance](#5-aws--launch-ec2-instance)
6. [AWS EC2 — Server Setup](#6-aws-ec2--server-setup)
7. [Azure DevOps — Create Organisation & Project](#7-azure-devops--create-organisation--project)
8. [Azure DevOps — Connect Repository](#8-azure-devops--connect-repository)
9. [Azure DevOps — Service Connections](#9-azure-devops--service-connections)
10. [Azure DevOps — Variable Group (Secrets)](#10-azure-devops--variable-group-secrets)
11. [Azure DevOps — Create the Pipeline](#11-azure-devops--create-the-pipeline)
12. [Azure DevOps — Environment & Approval Gate](#12-azure-devops--environment--approval-gate)
13. [EC2 — First Deployment Setup](#13-ec2--first-deployment-setup)
14. [Verify End-to-End Pipeline Run](#14-verify-end-to-end-pipeline-run)
15. [Troubleshooting](#15-troubleshooting)
16. [Security Checklist](#16-security-checklist)

---

## 1. Architecture Overview

```
Developer
   │
   │  git push → main
   ▼
Azure Repos (or GitHub mirror)
   │
   ▼
Azure Pipelines (azure-pipelines.yml at repo root)
   │
   ├─ Stage 1: Detect Changes
   │    git diff → flags which services changed
   │
   ├─ Stage 2: Test
   │    Backend  → Jest (Node 22)
   │    Frontend → Karma headless (Node 20)
   │
   ├─ Stage 3: Build & Push → Azure Container Registry
   │    shipeasy-api      → <acr>.azurecr.io/shipeasy-api:<sha>
   │    shipeasy-frontend → <acr>.azurecr.io/shipeasy-frontend:<sha>
   │
   └─ Stage 4: Deploy → AWS EC2
        SSH → deploy.sh
          ├─ docker login <acr>.azurecr.io  (service principal)
          ├─ docker pull  new images
          ├─ docker compose up -d  (rolling restart)
          ├─ health checks
          └─ docker logout + image prune

AWS EC2 (running Docker + Docker Compose)
   ├─ nginx (frontend container, port 80)
   ├─ Node.js API (backend container, port 3000)
   └─ MongoDB (container, internal only)
```

---

## 2. Prerequisites & Accounts

| Requirement | Notes |
|---|---|
| Azure account | [portal.azure.com](https://portal.azure.com) — free tier sufficient for ACR and ADO |
| Azure DevOps organisation | [dev.azure.com](https://dev.azure.com) — free for 5 users |
| AWS account | [aws.amazon.com](https://aws.amazon.com) |
| Azure CLI | Install: `brew install azure-cli` or [docs.microsoft.com/cli](https://docs.microsoft.com/cli) |
| AWS CLI | Install: `pip install awscli` or [aws.amazon.com/cli](https://aws.amazon.com/cli) |
| Git | For pushing code to the repository |

---

## 3. Azure — Create Container Registry (ACR)

ACR stores the Docker images built by the pipeline.

### Via Azure Portal

1. Go to [portal.azure.com](https://portal.azure.com)
2. Search **"Container registries"** → click **+ Create**
3. Fill in:
   | Field | Value |
   |---|---|
   | Subscription | Your subscription |
   | Resource group | `shipeasy-rg` (create new) |
   | Registry name | `shippeasy` _(globally unique, lowercase, no hyphens)_ |
   | Location | Choose nearest region |
   | SKU | **Basic** (sufficient for this use case) |
4. Click **Review + create** → **Create**
5. Once created, note the **Login server** value: `shippeasy.azurecr.io`

### Via Azure CLI (alternative)

```bash
# Login
az login

# Create resource group
az group create --name shipeasy-rg --location eastus

# Create ACR
az acr create \
  --resource-group shipeasy-rg \
  --name shippeasy \
  --sku Basic

# Verify
az acr show --name shippeasy --query loginServer -o tsv
# Output: shippeasy.azurecr.io
```

---

## 4. Azure — Create ACR Service Principal

The EC2 server needs credentials to pull images from ACR without using your personal account.

```bash
# Get the full ACR resource ID
ACR_ID=$(az acr show --name shippeasy --query id --output tsv)

# Create a service principal with AcrPull role
az ad sp create-for-rbac \
  --name shipeasy-ec2-pull \
  --role AcrPull \
  --scope $ACR_ID \
  --query "{clientId:appId, clientSecret:password}" \
  --output json
```

**Save the output — you will not be able to retrieve the secret again:**

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

> `clientId` → used as `ACR_USERNAME`  
> `clientSecret` → used as `ACR_PASSWORD`

---

## 5. AWS — Launch EC2 Instance

### 5.1 Choose an AMI

1. Go to [console.aws.amazon.com/ec2](https://console.aws.amazon.com/ec2)
2. Click **Launch Instance**
3. Under **Application and OS Images**, choose one of:

| AMI | Default SSH User | Notes |
|---|---|---|
| **Amazon Linux 2023** (recommended) | `ec2-user` | Minimal, fast boot, long-term AWS support |
| **Amazon Linux 2** | `ec2-user` | Stable, widely used |
| **Ubuntu 22.04 LTS** | `ubuntu` | Alternative if preferred |

> **Tip:** If you already have an Amazon Linux instance with Docker installed, skip to [Step 6](#6-aws-ec2--server-setup).

### 5.2 Instance configuration

| Setting | Recommended value |
|---|---|
| Instance type | `t3.medium` (2 vCPU, 4GB RAM) minimum |
| Key pair | Create new → download `.pem` file — **keep this safe** |
| Network | Default VPC |
| Auto-assign public IP | **Enable** |
| Storage | 30 GB gp3 |

### 5.3 Security Group — inbound rules

| Type | Protocol | Port | Source | Purpose |
|---|---|---|---|---|
| SSH | TCP | 22 | Your IP / Azure Pipelines IP range | Pipeline SSH deploy |
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | API (restrict if behind load balancer) |
| Custom TCP | TCP | 27017 | _None — internal only_ | MongoDB |

> **Note:** Port 27017 must NOT be in the inbound rules. MongoDB is accessed only by containers on the internal Docker network.

### 5.4 Note the public IP/DNS

After launch, go to the instance and copy:
- **Public IPv4 address** (e.g. `54.123.45.67`)
- **Public DNS** (e.g. `ec2-54-123-45-67.compute-1.amazonaws.com`)

---

## 6. AWS EC2 — Server Setup

SSH into the instance and run all commands below. Do this **once** before the first pipeline run.

```bash
# SSH in (replace with your .pem path and EC2 IP)
chmod 400 ~/Downloads/shipeasy-key.pem

# Amazon Linux:
ssh -i ~/Downloads/shipeasy-key.pem ec2-user@<EC2-PUBLIC-IP>

# Ubuntu (if using Ubuntu AMI instead):
# ssh -i ~/Downloads/shipeasy-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 6.1 Install Docker (if not pre-installed)

**Amazon Linux 2023:**

```bash
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker
docker --version
# Docker version 25.x.x
```

**Amazon Linux 2:**

```bash
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker
docker --version
```

### 6.2 Install Docker Compose v2 plugin

Docker Compose v2 runs as a Docker CLI plugin (`docker compose` instead of `docker-compose`).

```bash
# Install the plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify
docker compose version
# Docker Compose version v2.x.x
```

### 6.3 Add your user to the docker group

```bash
sudo usermod -aG docker $USER
newgrp docker

# Verify (should run without sudo)
docker ps
```

### 6.4 Automated setup (recommended)

The quickest way to configure the server is to use the provided bootstrap script:

```bash
# Clone the repo (or copy files to the server)
git clone https://github.com/parassynoris/Shippeasy-saas.git ~/setup-temp
cd ~/setup-temp

# Run the bootstrap script
bash scripts/setup-ec2.sh
```

This script will:
- Verify Docker and Docker Compose v2
- Create `~/shipeasy` deployment directory
- Copy `docker-compose.yml`, `deploy.sh`, and `.env`
- Start MongoDB for the first time
- Print next steps

After the script completes, you can remove the temp clone:

```bash
rm -rf ~/setup-temp
```

> **Alternatively**, you can do the manual setup in steps 6.5–6.8 below.

### 6.5 Create the deployment directory (manual)

```bash
mkdir -p ~/shipeasy
cd ~/shipeasy
```

### 6.6 Copy project files to EC2 (manual)

From your **local machine**, copy the required files:

```bash
# Replace with your .pem path and EC2 IP
# Use ec2-user for Amazon Linux, ubuntu for Ubuntu
EC2="ec2-user@<EC2-PUBLIC-IP>"
KEY="~/Downloads/shipeasy-key.pem"

scp -i $KEY docker-compose.yml     $EC2:~/shipeasy/
scp -i $KEY deploy.sh              $EC2:~/shipeasy/
scp -i $KEY .env.example           $EC2:~/shipeasy/
```

### 6.7 Create the server `.env` file

Back on the EC2 instance:

```bash
cd ~/shipeasy

# Copy example and edit
cp .env.example .env
nano .env
```

Fill in all values in `.env`. The minimum required:

```dotenv
NODE_ENV=production

FRONTEND_PORT=80
BACKEND_PORT=3000

MONGO_DB_NAME=shipeasy
BACKEND_URL=http://backend:3000

# Generate with: openssl rand -base64 32
SECRET_KEY_JWT=<your-secure-random-secret>

# CORS — set to your domain or EC2 public IP
CORS_ORIGINS=http://<EC2-PUBLIC-IP>,http://localhost
FRONTEND_URL=http://<EC2-PUBLIC-IP>

API_URL=/api
API_URL_MASTER=/api/
SOCKET_URL=

# ACR details — from Step 3
ACR_NAME=shippeasy
BACKEND_IMAGE=shippeasy.azurecr.io/shipeasy-api
FRONTEND_IMAGE=shippeasy.azurecr.io/shipeasy-frontend
BACKEND_TAG=latest
FRONTEND_TAG=latest

# ACR service principal — from Step 4
ACR_USERNAME=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ACR_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6.8 Make deploy script executable

```bash
chmod +x ~/shipeasy/deploy.sh
```

### 6.9 Confirm the setup

```bash
ls -la ~/shipeasy/
# Should show: docker-compose.yml  deploy.sh  .env
```

---

## 7. Azure DevOps — Create Organisation & Project

1. Go to [dev.azure.com](https://dev.azure.com)
2. Sign in with your Microsoft/Azure account
3. Click **New organisation** (or use existing)
4. Click **New project**:
   | Field | Value |
   |---|---|
   | Project name | `Shippeasy` |
   | Visibility | Private |
   | Version control | Git |
5. Click **Create**

---

## 8. Azure DevOps — Connect Repository

### Option A: Azure Repos (recommended — repo lives in Azure)

1. In ADO, go to **Repos** → **Import repository**
2. Clone URL: your existing GitHub/GitLab repo URL
3. ADO will import and host the code in Azure Repos
4. Going forward, push to Azure Repos (`dev.azure.com/.../Shippeasy`)

### Option B: GitHub (repo stays on GitHub)

1. In ADO, go to **Project Settings** → **Service connections**
2. **+ New service connection** → **GitHub**
3. Authorize via OAuth
4. Name it: `github-shippeasy`

---

## 9. Azure DevOps — Service Connections

Two service connections are required.

### 9.1 ACR — Docker Registry connection

1. **Project Settings** → **Service connections** → **+ New service connection**
2. Select **Docker Registry** → **Next**
3. Choose **Azure Container Registry**
4. Fill in:
   | Field | Value |
   |---|---|
   | Subscription | Your Azure subscription |
   | Azure container registry | `shippeasy` |
   | Service connection name | `acr-connection` ← **must match exactly** |
5. Check **Grant access permission to all pipelines**
6. Click **Save**

### 9.2 AWS EC2 — SSH connection

1. **Project Settings** → **Service connections** → **+ New service connection**
2. Select **SSH** → **Next**
3. Fill in:
   | Field | Value |
   |---|---|
   | Host name | Your EC2 public IP or DNS |
   | Port | `22` |
   | Username | `ec2-user` _(Amazon Linux)_ or `ubuntu` _(Ubuntu)_ |
   | Private key | Paste the full contents of your `.pem` file |
   | Service connection name | `aws-ec2-ssh` ← **must match exactly** |
4. Check **Grant access permission to all pipelines**
5. Click **Save** and **Verify connection**

> **Important:** The SSH username depends on your AMI. Amazon Linux uses `ec2-user`, Ubuntu uses `ubuntu`. This is configured in the service connection — the pipeline YAML does not specify the user.

---

## 10. Azure DevOps — Variable Group (Secrets)

The pipeline reads all secrets from an ADO variable group named `shipeasy-secrets`.

1. **Pipelines** → **Library** → **+ Variable group**
2. Name: `shipeasy-secrets` ← **must match exactly**
3. Add the following variables (click the **lock icon** to mark as secret):

| Variable | Value | Secret? |
|---|---|---|
| `ACR_NAME` | `shippeasy` | No |
| `API_URL` | `/api` | No |
| `API_URL_MASTER` | `/api/` | No |
| `SOCKET_URL` | _(leave empty)_ | No |
| `ACR_SP_CLIENT_ID` | Service principal `clientId` from Step 4 | **Yes** |
| `ACR_SP_CLIENT_SECRET` | Service principal `clientSecret` from Step 4 | **Yes** |

4. Click **Save**

> **Important:** The pipeline YAML references `$(ACR_SP_CLIENT_ID)` and `$(ACR_SP_CLIENT_SECRET)`. These are injected into the SSH deploy command at runtime — they never appear in logs because ADO automatically masks secret variables.

---

## 11. Azure DevOps — Create the Pipeline

1. In ADO, go to **Pipelines** → **+ New pipeline**
2. Choose your repository source:
   - **Azure Repos Git** → select `Shippeasy` repository, **or**
   - **GitHub** → select the repo (uses the GitHub service connection from Step 8)
3. On the **Configure** step, choose **Existing Azure Pipelines YAML file**
4. Branch: `main`
5. Path: `/azure-pipelines.yml` ← the root-level file
6. Click **Continue** → review the YAML
7. Click **Save** (not Run yet — environment must be set up first)

---

## 12. Azure DevOps — Environment & Approval Gate

The pipeline deploys to an ADO **Environment** named `production`. This lets you add a manual approval gate before any deployment runs.

### 12.1 Create the environment

1. **Pipelines** → **Environments** → **+ New environment**
2. Name: `production`
3. Resource: **None** (SSH deploy, not Kubernetes)
4. Click **Create**

### 12.2 Add an approval (optional but recommended)

1. Open the `production` environment
2. Click **...** (three dots) → **Approvals and checks**
3. Click **+** → **Approvals**
4. Add approvers (yourself or your team)
5. Set timeout (e.g. 24 hours)
6. Click **Create**

> Every deployment will now pause and send a notification. An approver clicks **Approve** in ADO before the SSH deploy runs.

---

## 13. EC2 — First Deployment Setup

Before the pipeline can deploy using pre-built images, you need to do **one manual bootstrap** to start the database and verify connectivity.

```bash
# Amazon Linux:
ssh -i ~/Downloads/shipeasy-key.pem ec2-user@<EC2-PUBLIC-IP>

# Ubuntu:
# ssh -i ~/Downloads/shipeasy-key.pem ubuntu@<EC2-PUBLIC-IP>

cd ~/shipeasy

# Pull a placeholder image for first boot
# (pipeline will replace these on first run)
docker compose up -d mongo

# Verify mongo started
docker compose ps
# shipeasy_mongo   Up (healthy)
```

> On the first real pipeline run, the backend and frontend containers will be started automatically by `deploy.sh`.

### Verify SSH access from ADO (optional manual test)

From your local machine, confirm ADO's pipeline agent IP can reach your EC2 instance. Azure Pipelines uses Microsoft-hosted agents — their IPs are published at:

**[dev.azure.com — IP ranges for Microsoft-hosted agents](https://docs.microsoft.com/azure/devops/pipelines/agents/hosted#networking)**

If your EC2 security group restricts SSH to specific IPs, add the Azure Pipelines service IP ranges to port 22.
Alternatively, set the SSH security group rule to `0.0.0.0/0` and rely on the private key for authentication.

---

## 14. Verify End-to-End Pipeline Run

### 14.1 Trigger the pipeline

```bash
# On your local machine — make a small change and push
git checkout main
echo "# trigger CI" >> README.md
git add README.md
git commit -m "chore: trigger first pipeline run"
git push origin main
```

### 14.2 Watch the pipeline

1. Go to **Pipelines** → click the running pipeline
2. You should see four stages progress in order:

```
DetectChanges → [green]
Test          → [green]  (backend + frontend jobs)
BuildPush     → [green]  (images pushed to ACR)
Deploy        → [waiting for approval if configured]
              → [green]  (deploy.sh runs on EC2)
```

### 14.3 Verify deployment on EC2

```bash
# Amazon Linux:
ssh -i ~/Downloads/shipeasy-key.pem ec2-user@<EC2-PUBLIC-IP>

# Ubuntu:
# ssh -i ~/Downloads/shipeasy-key.pem ubuntu@<EC2-PUBLIC-IP>

# Check running containers
docker compose -f ~/shipeasy/docker-compose.yml ps
# shipeasy_mongo     Up (healthy)
# shipeasy_api       Up
# shipeasy_frontend  Up

# Check logs
docker compose -f ~/shipeasy/docker-compose.yml logs --tail=20 backend
docker compose -f ~/shipeasy/docker-compose.yml logs --tail=20 frontend

# Check deploy log
tail -50 ~/shipeasy/deploy.log
```

### 14.4 Verify the application

| Check | URL |
|---|---|
| Frontend | `http://<EC2-PUBLIC-IP>/` |
| Backend API docs | `http://<EC2-PUBLIC-IP>:3000/api-docs` |

---

## 15. Troubleshooting

### Pipeline fails at "Detect Changes" — `HEAD~1` error
**Cause:** Shallow clone on first run.  
**Fix:** The pipeline uses `fetchDepth: 2`. If the repo has only one commit, the diff falls back to `git diff --name-only HEAD` which marks all files as changed — that is expected and safe.

---

### Pipeline fails at "Build & Push" — ACR login error
**Cause:** `acr-connection` service connection not configured correctly.  
**Fix:**
1. Go to **Project Settings** → **Service connections** → `acr-connection`
2. Click **Edit** → **Verify**
3. Ensure the identity has **AcrPush** role on the ACR resource in Azure Portal:
   - ACR → **Access control (IAM)** → **+ Add role assignment** → `AcrPush` → assign to the ADO service connection identity

---

### Pipeline fails at "Deploy" — SSH timeout
**Cause:** EC2 security group blocks the Azure Pipelines agent IP.  
**Fix:**
- Add inbound rule for port 22 from `0.0.0.0/0` (secured by key only), or
- Add the [Azure Pipelines IP ranges](https://docs.microsoft.com/azure/devops/pipelines/agents/hosted#networking) to the security group

---

### deploy.sh fails — `ACR_REGISTRY is required`
**Cause:** Variable group not linked to the pipeline, or variable name mismatch.  
**Fix:**
1. Confirm the variable group name is exactly `shipeasy-secrets`
2. In the pipeline YAML, confirm `- group: shipeasy-secrets` is listed under `variables`
3. Confirm `ACR_NAME` is set in the variable group (not just in `.env.example`)

---

### Docker containers not starting on EC2
**Cause:** Old images or missing `.env`.  
**Fix:**
```bash
cd ~/shipeasy
docker compose down
docker compose up -d
docker compose logs --tail=30
```

---

### Frontend shows 502 Bad Gateway for API calls
**Cause:** nginx `BACKEND_URL` env var not set, or backend container not running.  
**Fix:**
```bash
# Check BACKEND_URL is in .env
grep BACKEND_URL ~/shipeasy/.env

# Check backend is running
docker compose -f ~/shipeasy/docker-compose.yml ps backend

# Restart frontend so nginx re-reads BACKEND_URL
docker compose -f ~/shipeasy/docker-compose.yml restart frontend
```

---

## 16. Security Checklist

| Item | Status |
|---|---|
| `.env` file is gitignored at repo root | ✅ |
| `shipeasy-api/.env` is gitignored | ✅ |
| ACR service principal has `AcrPull` only (not Owner/Contributor) | ✅ |
| EC2 MongoDB port 27017 is NOT in the inbound security group rules | ✅ |
| ADO variable group secrets are locked (masked in logs) | Required — set in Step 10 |
| EC2 SSH key `.pem` file is stored securely (not in repo) | Required |
| Production environment approval gate is configured | Recommended — Step 12.2 |
| ACR admin account is **disabled** (use service principal only) | Verify in ACR → Settings → Access keys → Admin user = OFF |
| EC2 instance has automatic OS security updates enabled | Amazon Linux: `sudo dnf install -y dnf-automatic && sudo systemctl enable --now dnf-automatic.timer` / Ubuntu: `sudo apt-get install unattended-upgrades` |
| Containers run as non-root user (appuser) | ✅ — set in Dockerfiles |

---

*Last updated: March 2026 — Shippeasy SaaS v1.0*
