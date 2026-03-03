# Shippeasy SaaS — CI/CD Flow Diagram

**Document Version:** 1.0  
**Classification:** Internal  
**Last Updated:** March 2026

---

## 1. End-to-End CI/CD Pipeline

```
DEVELOPER WORKSTATION
┌────────────────────────────────────┐
│                                    │
│  feature/* branch                  │
│  git commit -m "feat: ..."         │
│  git push origin feature/my-feat   │
│                                    │
└──────────────┬─────────────────────┘
               │
               │  Pull Request → main
               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  AZURE REPOS / GITHUB (Source Control)                                      │
│                                                                              │
│  main branch    ◄──── PR approved + squash merge                            │
│                                 │                                            │
│                  trigger: push to main                                       │
└─────────────────────────────────┼────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  AZURE PIPELINES  (azure-pipelines.yml)                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 0 — DetectChanges  (ubuntu-latest agent)                      │   │
│  │                                                                       │   │
│  │  git diff HEAD~1 HEAD                                                 │   │
│  │  ┌──────────────────┐    ┌──────────────────┐                        │   │
│  │  │ backendChanged?  │    │ frontendChanged?  │                        │   │
│  │  │  shipeasy-api/** │    │  shipeasy/**      │                        │   │
│  │  └────────┬─────────┘    └────────┬──────────┘                       │   │
│  │           │ output vars            │ output vars                      │   │
│  └───────────┼────────────────────────┼──────────────────────────────────┘  │
│              │                        │                                       │
│  ┌───────────▼────────────────────────▼──────────────────────────────────┐  │
│  │  STAGE 1 — Test  (parallel jobs)                                       │  │
│  │                                                                         │  │
│  │  ┌──────────────────────────────┐  ┌─────────────────────────────┐    │  │
│  │  │  TestBackend (if changed)    │  │  TestFrontend (if changed)  │    │  │
│  │  │  Node 22                     │  │  Node 20                    │    │  │
│  │  │  npm ci                      │  │  yarn install               │    │  │
│  │  │  npm test (Jest)             │  │  yarn test (Karma headless) │    │  │
│  │  │  PublishTestResults (JUnit)  │  │  PublishTestResults (JUnit) │    │  │
│  │  └──────────────────────────────┘  └─────────────────────────────┘    │  │
│  │                                                                         │  │
│  │  ⛔ FAIL: Build stops here if any test fails                           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  STAGE 2 — BuildPush  (only on push to main, not PRs)                  │  │
│  │                                                                         │  │
│  │  ┌──────────────────────────────────┐                                  │  │
│  │  │  BuildBackend (if backendChanged)│                                  │  │
│  │  │                                  │                                  │  │
│  │  │  docker build (BuildKit)         │                                  │  │
│  │  │  Context: ./shipeasy-api         │                                  │  │
│  │  │  Dockerfile: multi-stage         │                                  │  │
│  │  │    Stage 1: npm ci --omit=dev    │                                  │  │
│  │  │    Stage 2: node:22-alpine       │                                  │  │
│  │  │             non-root appuser     │                                  │  │
│  │  │                                  │                                  │  │
│  │  │  docker push → ACR               │                                  │  │
│  │  │  Tags: <sha7>  +  latest         │                                  │  │
│  │  │  Cache: ACR buildcache layer     │                                  │  │
│  │  └──────────────────────────────────┘                                  │  │
│  │                                                                         │  │
│  │  ┌──────────────────────────────────┐                                  │  │
│  │  │  BuildFrontend (if frontendChanged)                                 │  │
│  │  │                                  │                                  │  │
│  │  │  docker build (BuildKit)         │                                  │  │
│  │  │  Context: ./shipeasy             │                                  │  │
│  │  │  Build ARGs (from Variable Group)│                                  │  │
│  │  │    API_URL, API_URL_MASTER       │                                  │  │
│  │  │    SOCKET_URL, ENVIRONMENT       │                                  │  │
│  │  │  Dockerfile: multi-stage         │                                  │  │
│  │  │    Stage 1: node:20-alpine       │                                  │  │
│  │  │             yarn install         │                                  │  │
│  │  │             ng build --prod      │                                  │  │
│  │  │             sed replaces env URLs│                                  │  │
│  │  │    Stage 2: nginx:stable-alpine  │                                  │  │
│  │  │             + nginx.conf.template│                                  │  │
│  │  │                                  │                                  │  │
│  │  │  docker push → ACR               │                                  │  │
│  │  │  Tags: <sha7>  +  latest         │                                  │  │
│  │  └──────────────────────────────────┘                                  │  │
│  │                                                                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  STAGE 3 — Deploy  (ADO Environment: production)                       │  │
│  │                                                                         │  │
│  │  ⏸  Optional: Manual Approval Gate (ADO Environment check)             │  │
│  │                                                                         │  │
│  │  SSH → AWS EC2 (aws-ec2-ssh service connection)                        │  │
│  │                                                                         │  │
│  │  Runs deploy.sh with env vars:                                         │  │
│  │    ACR_REGISTRY, BACKEND_IMAGE, FRONTEND_IMAGE                        │  │
│  │    BACKEND_TAG=<sha7>, FRONTEND_TAG=<sha7>                            │  │
│  │    ACR_USERNAME, ACR_PASSWORD (masked vars)                           │  │
│  │                                                                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │  SSH + env vars
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AWS EC2 — deploy.sh                                                         │
│                                                                               │
│  1. docker login <acr>.azurecr.io  (service principal)                       │
│       └── ACR_USERNAME + ACR_PASSWORD                                         │
│                                                                               │
│  2. docker pull <acr>.azurecr.io/shipeasy-api:<sha7>                         │
│     docker pull <acr>.azurecr.io/shipeasy-frontend:<sha7>                    │
│                                                                               │
│  3. Update .env                                                               │
│       BACKEND_TAG=<sha7>                                                      │
│       FRONTEND_TAG=<sha7>                                                     │
│                                                                               │
│  4. docker compose up -d --no-build --no-deps --pull never backend           │
│     docker compose up -d --no-build --no-deps --pull never frontend          │
│     (mongo is NOT restarted)                                                  │
│                                                                               │
│  5. Health checks (HTTP polling)                                              │
│       /api-docs  → backend healthy?                                           │
│       /          → frontend healthy?                                          │
│                                                                               │
│  6. docker logout <acr>.azurecr.io                                           │
│                                                                               │
│  7. docker image prune -f                                                     │
│                                                                               │
│  ✅ Deploy log: ~/shipeasy/deploy.log                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PR Validation Flow (no deploy)

```
git push origin feature/my-feature
         │
         │  Pull Request opened → main
         ▼
Azure Pipelines PR trigger
         │
         ├── Stage 0: DetectChanges
         ├── Stage 1: Test (backend + frontend)
         │
         └── ✅ Green → PR can be merged
             ❌ Red   → PR blocked until tests pass
             
         Note: BuildPush and Deploy stages do NOT run on PRs
               (condition: IS_MAIN_PUSH == true)
```

---

## 3. Image Lifecycle in ACR

```
Build #1 (commit: abc1234)
  → shipeasy-api:abc1234  (immutable)
  → shipeasy-api:latest   (mutable pointer)

Build #2 (commit: def5678)
  → shipeasy-api:def5678  (immutable)
  → shipeasy-api:latest   (moved to def5678)

ACR Lifecycle Policy: keep last 20 tags
  → Tags abc1234 through def5600 auto-deleted after 20 builds
```

---

## 4. Rollback Procedure

If a deployment causes issues, roll back to the previous known-good SHA:

```bash
# On EC2 directly
cd ~/shipeasy

# Edit .env to set previous tag
PREVIOUS_BACKEND_TAG=abc1234   # previous good SHA
PREVIOUS_FRONTEND_TAG=abc1234

grep -v '^BACKEND_TAG\|^FRONTEND_TAG' .env > .env.tmp
echo "BACKEND_TAG=${PREVIOUS_BACKEND_TAG}" >> .env.tmp
echo "FRONTEND_TAG=${PREVIOUS_FRONTEND_TAG}" >> .env.tmp
mv .env.tmp .env

# Pull previous images (already in ACR)
docker pull shippeasy.azurecr.io/shipeasy-api:${PREVIOUS_BACKEND_TAG}
docker pull shippeasy.azurecr.io/shipeasy-frontend:${PREVIOUS_FRONTEND_TAG}

# Restart with previous images
docker compose up -d --no-build --no-deps --pull never backend frontend
```

Alternatively, re-run the ADO pipeline on a previous commit:
1. ADO → Pipelines → select pipeline
2. Click **Run pipeline** → **Advanced options** → select previous commit SHA

---

## 5. Pipeline Variables & Secrets Flow

```
Azure DevOps Library
└── Variable Group: shipeasy-secrets
    ├── ACR_NAME          (plain)    ──► BuildPush stage (--build-arg)
    ├── API_URL           (plain)    ──► Frontend Docker build ARG
    ├── API_URL_MASTER    (plain)    ──► Frontend Docker build ARG
    ├── SOCKET_URL        (plain)    ──► Frontend Docker build ARG
    ├── ACR_SP_CLIENT_ID  (🔒secret) ──► Deploy stage SSH env var
    └── ACR_SP_CLIENT_SECRET (🔒secret) ► Deploy stage SSH env var

Secrets marked 🔒 are:
  - Masked in all pipeline logs (ADO redacts them)
  - Never written to disk on the agent
  - Passed to EC2 only via SSH environment injection
  - Immediately discarded after deploy.sh exits
```

---

## 6. Key Security Controls in the Pipeline

| Control | Implementation |
|---|---|
| No secrets in YAML | All secrets in ADO Variable Group (masked) |
| No secrets in container images | Build ARGs for non-secret config only; secrets injected at runtime via `.env` |
| Image immutability | Every image tagged with Git SHA — `latest` also set but SHA tag is used for deploy |
| Least-privilege registry access | ADO uses AcrPush, EC2 uses AcrPull |
| PR gate | Tests must pass before merge to main |
| Deploy approval | ADO Environment `production` with optional manual approval |
| Audit trail | Every pipeline run recorded in ADO with logs, timestamps, triggering user |
| Rollback ready | Previous SHA tags retained in ACR for 20+ builds |
