#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
# setup-ec2.sh — Bootstrap an Amazon Linux EC2 instance for Shippeasy
#
# Run this ONCE on a fresh Amazon Linux 2023 (or AL2) EC2 instance
# after Docker is installed. It configures the server to receive
# deployments from the Azure Pipelines CI/CD pipeline.
#
# What this script does:
#   1. Verifies Docker is installed and running
#   2. Installs Docker Compose v2 plugin (if missing)
#   3. Adds ec2-user to the docker group (if not already)
#   4. Creates the deployment directory ~/shipeasy
#   5. Copies docker-compose.yml and deploy.sh
#   6. Creates a starter .env from .env.example
#   7. Bootstraps MongoDB (first container)
#   8. Verifies the setup
#
# Prerequisites:
#   - Amazon Linux 2023 (AL2023) or Amazon Linux 2 (AL2) EC2 instance
#   - Docker already installed (yum install docker / dnf install docker)
#   - This repo cloned or the files available locally
#
# Usage (run as ec2-user on the EC2 instance):
#   bash scripts/setup-ec2.sh
#
# Or from your local machine:
#   scp -i key.pem -r docker-compose.yml deploy.sh .env.example scripts/ ec2-user@<IP>:~/setup/
#   ssh -i key.pem ec2-user@<IP> 'bash ~/setup/scripts/setup-ec2.sh'
# ══════════════════════════════════════════════════════════════════

set -euo pipefail

DEPLOY_DIR="${HOME}/shipeasy"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." 2>/dev/null && pwd || echo "${SCRIPT_DIR}")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[✗]${NC} $*"; }

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Shippeasy — EC2 Server Setup (Amazon Linux)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ── 1. Verify Docker ───────────────────────────────────────────────
echo "── Step 1: Checking Docker ──────────────────────────────────"
if ! command -v docker &> /dev/null; then
    error "Docker is not installed."
    echo ""
    echo "  Install Docker on Amazon Linux 2023:"
    echo "    sudo dnf install -y docker"
    echo "    sudo systemctl enable docker"
    echo "    sudo systemctl start docker"
    echo ""
    echo "  Install Docker on Amazon Linux 2:"
    echo "    sudo yum install -y docker"
    echo "    sudo systemctl enable docker"
    echo "    sudo systemctl start docker"
    echo ""
    exit 1
fi

DOCKER_VERSION=$(docker --version 2>/dev/null || echo "unknown")
log "Docker found: ${DOCKER_VERSION}"

# Ensure Docker service is running
if ! sudo systemctl is-active --quiet docker; then
    warn "Docker service is not running. Starting..."
    sudo systemctl start docker
    sudo systemctl enable docker
    log "Docker service started and enabled"
fi

# ── 2. Docker Compose v2 ──────────────────────────────────────────
echo ""
echo "── Step 2: Checking Docker Compose v2 ───────────────────────"
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "unknown")
    log "Docker Compose v2 found: ${COMPOSE_VERSION}"
else
    warn "Docker Compose v2 not found. Installing..."
    
    # Install Docker Compose v2 as a CLI plugin
    COMPOSE_PLUGIN_DIR="/usr/local/lib/docker/cli-plugins"
    sudo mkdir -p "${COMPOSE_PLUGIN_DIR}"
    
    # Detect architecture
    ARCH=$(uname -m)
    case "${ARCH}" in
        x86_64)  COMPOSE_ARCH="x86_64" ;;
        aarch64) COMPOSE_ARCH="aarch64" ;;
        *)       error "Unsupported architecture: ${ARCH}"; exit 1 ;;
    esac
    
    COMPOSE_URL="https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${COMPOSE_ARCH}"
    echo "  Downloading from: ${COMPOSE_URL}"
    sudo curl -SL "${COMPOSE_URL}" -o "${COMPOSE_PLUGIN_DIR}/docker-compose"
    sudo chmod +x "${COMPOSE_PLUGIN_DIR}/docker-compose"
    
    # Verify
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "installed")
        log "Docker Compose v2 installed: ${COMPOSE_VERSION}"
    else
        error "Docker Compose v2 installation failed"
        exit 1
    fi
fi

# ── 3. Docker group ───────────────────────────────────────────────
echo ""
echo "── Step 3: Docker group permissions ─────────────────────────"
if groups | grep -q docker; then
    log "User '$(whoami)' is already in the docker group"
else
    warn "Adding '$(whoami)' to docker group..."
    sudo usermod -aG docker "$(whoami)"
    log "Added to docker group. NOTE: You may need to log out and back in."
fi

# ── 4. Create deployment directory ────────────────────────────────
echo ""
echo "── Step 4: Creating deployment directory ────────────────────"
mkdir -p "${DEPLOY_DIR}"
log "Deployment directory: ${DEPLOY_DIR}"

# ── 5. Copy project files ────────────────────────────────────────
echo ""
echo "── Step 5: Copying project files ────────────────────────────"

# docker-compose.yml
if [ -f "${REPO_ROOT}/docker-compose.yml" ]; then
    cp "${REPO_ROOT}/docker-compose.yml" "${DEPLOY_DIR}/docker-compose.yml"
    log "Copied docker-compose.yml"
elif [ -f "${DEPLOY_DIR}/docker-compose.yml" ]; then
    log "docker-compose.yml already exists in ${DEPLOY_DIR}"
else
    warn "docker-compose.yml not found — you'll need to copy it manually:"
    echo "  scp -i key.pem docker-compose.yml ec2-user@<IP>:~/shipeasy/"
fi

# deploy.sh
if [ -f "${REPO_ROOT}/deploy.sh" ]; then
    cp "${REPO_ROOT}/deploy.sh" "${DEPLOY_DIR}/deploy.sh"
    chmod +x "${DEPLOY_DIR}/deploy.sh"
    log "Copied deploy.sh (executable)"
elif [ -f "${DEPLOY_DIR}/deploy.sh" ]; then
    chmod +x "${DEPLOY_DIR}/deploy.sh"
    log "deploy.sh already exists in ${DEPLOY_DIR}"
else
    warn "deploy.sh not found — you'll need to copy it manually:"
    echo "  scp -i key.pem deploy.sh ec2-user@<IP>:~/shipeasy/"
fi

# .env
if [ -f "${DEPLOY_DIR}/.env" ]; then
    log ".env already exists — not overwriting"
elif [ -f "${REPO_ROOT}/.env.example" ]; then
    cp "${REPO_ROOT}/.env.example" "${DEPLOY_DIR}/.env"
    log "Created .env from .env.example"
    warn "IMPORTANT: Edit ${DEPLOY_DIR}/.env with your production values!"
    echo "  nano ${DEPLOY_DIR}/.env"
else
    warn ".env.example not found — creating minimal .env"
    cat > "${DEPLOY_DIR}/.env" <<'ENVEOF'
NODE_ENV=production
FRONTEND_PORT=80
BACKEND_PORT=3000
MONGO_DB_NAME=shipeasy
BACKEND_URL=http://backend:3000
API_URL=/api
API_URL_MASTER=/api/
SOCKET_URL=
BACKEND_IMAGE=shipeasy-api
FRONTEND_IMAGE=shipeasy-frontend
BACKEND_TAG=latest
FRONTEND_TAG=latest
ENVEOF
    warn "IMPORTANT: Edit ${DEPLOY_DIR}/.env — set SECRET_KEY_JWT and other secrets!"
fi

# ── 6. Configure .env for production ──────────────────────────────
echo ""
echo "── Step 6: Checking .env configuration ──────────────────────"

# Check for default JWT secret
if grep -q 'change-me-in-production' "${DEPLOY_DIR}/.env" 2>/dev/null; then
    warn "SECRET_KEY_JWT is still the default value!"
    echo "  Generate a secure secret: openssl rand -base64 32"
    echo "  Then update it in ${DEPLOY_DIR}/.env"
fi

# Check ACR_NAME
if grep -q 'your-acr-name' "${DEPLOY_DIR}/.env" 2>/dev/null; then
    warn "ACR_NAME is still the placeholder value."
    echo "  Set it to your Azure Container Registry name (without .azurecr.io)"
fi

# ── 7. Bootstrap MongoDB ─────────────────────────────────────────
echo ""
echo "── Step 7: Bootstrapping MongoDB ────────────────────────────"
if [ -f "${DEPLOY_DIR}/docker-compose.yml" ]; then
    cd "${DEPLOY_DIR}"
    
    # Check if MongoDB is already running
    if docker compose ps 2>/dev/null | grep -q "shipeasy_mongo.*healthy"; then
        log "MongoDB is already running and healthy"
    else
        log "Starting MongoDB (first-time bootstrap)..."
        docker compose up -d mongo 2>/dev/null || sudo docker compose up -d mongo
        
        echo "  Waiting for MongoDB to be healthy..."
        RETRIES=12
        for i in $(seq 1 $RETRIES); do
            if docker compose ps 2>/dev/null | grep -q "healthy"; then
                log "MongoDB is healthy ✓"
                break
            fi
            echo "  attempt ${i}/${RETRIES} — waiting 5s..."
            sleep 5
        done
    fi
else
    warn "Skipping MongoDB bootstrap (docker-compose.yml not found)"
fi

# ── 8. Summary ────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Deployment directory: ${DEPLOY_DIR}"
echo "  Docker:               ${DOCKER_VERSION}"
echo "  Docker Compose:       ${COMPOSE_VERSION:-unknown}"
echo ""
echo "  Files:"
ls -la "${DEPLOY_DIR}/" 2>/dev/null | grep -v total | sed 's/^/    /'
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  Next Steps"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  1. Edit the .env file with production values:"
echo "     nano ${DEPLOY_DIR}/.env"
echo ""
echo "  2. Set up Azure DevOps (follow the CI/CD guide):"
echo "     - Create ACR (Azure Container Registry)"
echo "     - Create service connections in Azure DevOps"
echo "     - Create variable group 'shipeasy-secrets'"
echo "     - Create the pipeline from azure-pipelines.yml"
echo ""
echo "  3. Configure the SSH service connection in Azure DevOps:"
echo "     - Host: $(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '<your-ec2-public-ip>')"
echo "     - Username: $(whoami)"
echo "     - Private key: contents of your .pem file"
echo "     - Service connection name: aws-ec2-ssh"
echo ""
echo "  4. Push code to trigger the pipeline:"
echo "     git push origin main"
echo ""
echo "  Full guide: docs/CICD_SETUP_GUIDE.md"
echo ""
