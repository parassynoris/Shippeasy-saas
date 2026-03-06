#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
# deploy.sh — runs on the AWS EC2 production server.
# Invoked over SSH by Azure Pipelines (Stage 3 — Deploy).
#
# Required environment variables (injected by Azure Pipelines,
# sourced from the 'shipeasy-secrets' ADO variable group):
#
#   ACR_REGISTRY      <name>.azurecr.io
#   BACKEND_IMAGE     <name>.azurecr.io/shipeasy-api
#   FRONTEND_IMAGE    <name>.azurecr.io/shipeasy-frontend
#   BACKEND_TAG       short Git SHA  (e.g. a1b2c3d)
#   FRONTEND_TAG      short Git SHA
#   ACR_USERNAME      ACR service principal client ID
#   ACR_PASSWORD      ACR service principal client secret
#
# Manual usage (from EC2):
#   ACR_REGISTRY=x.azurecr.io \
#   BACKEND_TAG=a1b2c3d FRONTEND_TAG=a1b2c3d \
#   ACR_USERNAME=<sp-id> ACR_PASSWORD=<sp-secret> \
#   bash ~/shipeasy/deploy.sh
# ══════════════════════════════════════════════════════════════════

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$HOME/shipeasy}"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.yml"
LOG_FILE="$DEPLOY_DIR/deploy.log"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"; }

log "══════════════════════════════════════"
log "Shippeasy deployment starting"
log "  BACKEND_TAG   = ${BACKEND_TAG:-latest}"
log "  FRONTEND_TAG  = ${FRONTEND_TAG:-latest}"
log "  ACR_REGISTRY  = ${ACR_REGISTRY:-<not set>}"
log "══════════════════════════════════════"

# ── Guard: required variables ─────────────────────────────────────
: "${ACR_REGISTRY:?  ACR_REGISTRY is required}"
: "${BACKEND_IMAGE:?  BACKEND_IMAGE is required}"
: "${FRONTEND_IMAGE:? FRONTEND_IMAGE is required}"
: "${ACR_USERNAME:?   ACR_USERNAME (service principal client ID) is required}"
: "${ACR_PASSWORD:?   ACR_PASSWORD (service principal client secret) is required}"

# ── 1. Authenticate with Azure Container Registry ─────────────────
# Uses an ACR service principal — no az CLI required on the EC2 host.
log "Authenticating with ACR → ${ACR_REGISTRY}..."
echo "${ACR_PASSWORD}" | docker login "${ACR_REGISTRY}" \
  --username "${ACR_USERNAME}" \
  --password-stdin
log "ACR login successful ✓"

# ── 2. Pull new images ────────────────────────────────────────────
log "Pulling backend  → ${BACKEND_IMAGE}:${BACKEND_TAG:-latest}"
docker pull "${BACKEND_IMAGE}:${BACKEND_TAG:-latest}"

log "Pulling frontend → ${FRONTEND_IMAGE}:${FRONTEND_TAG:-latest}"
docker pull "${FRONTEND_IMAGE}:${FRONTEND_TAG:-latest}"

# ── 3. Update .env on the server with new image tags ──────────────
# Only BACKEND_TAG and FRONTEND_TAG are rewritten; all other values
# (secrets, MONGO_URI, etc.) remain unchanged in the server .env.
cd "$DEPLOY_DIR"
grep -v '^BACKEND_TAG\|^FRONTEND_TAG\|^BACKEND_IMAGE\|^FRONTEND_IMAGE' .env > .env.tmp || true
{
  echo "BACKEND_IMAGE=${BACKEND_IMAGE}"
  echo "FRONTEND_IMAGE=${FRONTEND_IMAGE}"
  echo "BACKEND_TAG=${BACKEND_TAG:-latest}"
  echo "FRONTEND_TAG=${FRONTEND_TAG:-latest}"
} >> .env.tmp
mv .env.tmp .env
log "Updated .env with new image references ✓"

# ── 4. Rolling restart — zero-downtime ────────────────────────────
# Restarts only frontend/backend; mongo is never interrupted.
# --pull never: images were already pulled above — avoids a second
# registry round-trip and guarantees the exact pulled digest is used.
log "Restarting backend service..."
docker compose -f "$COMPOSE_FILE" up -d \
  --no-build --no-deps --pull never backend

log "Restarting frontend service..."
docker compose -f "$COMPOSE_FILE" up -d \
  --no-build --no-deps --pull never frontend

# ── 5. Health checks ──────────────────────────────────────────────
HEALTH_RETRIES=12
HEALTH_INTERVAL=5

wait_healthy() {
  local service="$1"
  local url="$2"
  log "Waiting for ${service} to become healthy..."
  for i in $(seq 1 "$HEALTH_RETRIES"); do
    if curl -sf --max-time 3 "$url" > /dev/null 2>&1; then
      log "${service} is healthy ✓"
      return 0
    fi
    log "  attempt ${i}/${HEALTH_RETRIES} — retrying in ${HEALTH_INTERVAL}s"
    sleep "$HEALTH_INTERVAL"
  done
  log "ERROR: ${service} did not become healthy after $((HEALTH_RETRIES * HEALTH_INTERVAL))s"
  return 1
}

wait_healthy "backend"  "http://localhost:${BACKEND_PORT:-3000}/health"
wait_healthy "frontend" "http://localhost:${FRONTEND_PORT:-80}/health"

# ── 6. Logout from ACR (security best practice) ───────────────────
docker logout "${ACR_REGISTRY}" || true
log "Logged out from ACR ✓"

# ── 7. Clean up dangling images ───────────────────────────────────
log "Pruning dangling images..."
docker image prune -f

log "══════════════════════════════════════"
log "Deployment complete ✓"
log "══════════════════════════════════════"
