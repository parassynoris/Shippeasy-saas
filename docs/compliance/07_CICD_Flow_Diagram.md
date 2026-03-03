# Shippeasy SaaS — CI/CD Flow Diagram

**Document Version:** 1.0  
**Classification:** Internal  
**Last Updated:** March 2026

---

## 1. End-to-End CI/CD Pipeline

```mermaid
flowchart TD
    Dev["👨‍💻 Developer<br/>git push → feature/*"]
    PR["Azure Repos<br/>Pull Request → main"]
    Detect["Stage 0: DetectChanges<br/>git diff HEAD~1 HEAD"]
    BackendChanged{"backend<br/>changed?"}
    FrontendChanged{"frontend<br/>changed?"}
    TestBE["TestBackend<br/>npm ci + Jest<br/>PublishTestResults"]
    TestFE["TestFrontend<br/>yarn + Karma headless<br/>PublishTestResults"]
    Fail["❌ Pipeline fails<br/>Merge blocked"]
    BuildBE["BuildBackend<br/>docker build · BuildKit<br/>node:22-alpine multi-stage<br/>ACR push — sha7 + latest"]
    BuildFE["BuildFrontend<br/>docker build · BuildKit<br/>nginx:stable-alpine multi-stage<br/>Build ARGs: API_URL, SOCKET_URL<br/>ACR push — sha7 + latest"]
    Gate{"⏸ Manual approval<br/>ADO Environment gate<br/>optional"}
    Deploy["Stage 3: Deploy<br/>SSH → AWS EC2<br/>ADO: aws-ec2-ssh"]
    DeployScript["deploy.sh on EC2<br/>1. docker login ACR<br/>2. docker pull images<br/>3. update .env tags<br/>4. docker compose up<br/>5. health checks<br/>6. docker logout + prune"]
    HealthCheck{"Health checks<br/>/api-docs + /"}
    Success["✅ Deployment complete"]
    Rollback["⚠️ Alert team — manual rollback"]
    Cancelled["🚫 Deployment cancelled"]

    Dev -->|"Pull Request"| PR
    PR --> Detect
    Detect --> BackendChanged
    Detect --> FrontendChanged
    BackendChanged -->|"yes"| TestBE
    FrontendChanged -->|"yes"| TestFE
    TestBE -->|"fail"| Fail
    TestFE -->|"fail"| Fail
    TestBE -->|"pass"| BuildBE
    TestFE -->|"pass"| BuildFE
    BuildBE --> Gate
    BuildFE --> Gate
    Gate -->|"approved"| Deploy
    Gate -->|"rejected"| Cancelled
    Deploy --> DeployScript
    DeployScript --> HealthCheck
    HealthCheck -->|"pass"| Success
    HealthCheck -->|"fail"| Rollback
```

---

## 2. PR Validation Flow (no deploy)

```mermaid
flowchart TD
    Push["git push<br/>feature/my-feature"]
    PROpen["Pull Request opened → main"]
    Detect["Stage 0: DetectChanges"]
    Tests["Stage 1: Test<br/>backend + frontend in parallel"]
    Green["✅ PR can be merged"]
    Red["❌ PR blocked until tests pass"]
    Note["ℹ️ BuildPush + Deploy stages<br/>do NOT run on PRs<br/>condition: IS_MAIN_PUSH == true"]

    Push --> PROpen --> Detect --> Tests
    Tests -->|"all pass"| Green
    Tests -->|"any fail"| Red
    Green -.-> Note
```

---

## 3. Image Lifecycle in ACR

```mermaid
flowchart LR
    B1["Build #1<br/>commit: abc1234"]
    I1["shipeasy-api:abc1234<br/>immutable"]
    L1["shipeasy-api:latest<br/>→ abc1234"]

    B2["Build #2<br/>commit: def5678"]
    I2["shipeasy-api:def5678<br/>immutable"]
    L2["shipeasy-api:latest<br/>→ def5678"]

    Policy["ACR Lifecycle Policy<br/>Keep last 20 tags<br/>Older tags auto-deleted"]

    B1 --> I1
    B1 --> L1
    B2 --> I2
    B2 --> L2
    L1 -.->|"pointer moved"| L2
    Policy -.-> I1
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

```mermaid
flowchart LR
    subgraph ADO["Azure DevOps Library"]
        VG["Variable Group<br/>shipeasy-secrets"]
        ACR_NAME["ACR_NAME — plain"]
        API_URL["API_URL — plain"]
        API_URL_M["API_URL_MASTER — plain"]
        SOCKET_URL["SOCKET_URL — plain"]
        SP_ID["ACR_SP_CLIENT_ID 🔒 secret"]
        SP_SEC["ACR_SP_CLIENT_SECRET 🔒 secret"]
    end

    subgraph Pipeline["Azure Pipelines Stages"]
        BuildStage["BuildPush stage<br/>--build-arg injection"]
        DeployStage["Deploy stage<br/>SSH env vars"]
    end

    EC2["EC2 deploy.sh<br/>docker login ACR"]

    ACR_NAME --> BuildStage
    API_URL --> BuildStage
    API_URL_M --> BuildStage
    SOCKET_URL --> BuildStage
    SP_ID --> DeployStage
    SP_SEC --> DeployStage
    DeployStage -->|"SSH env injection<br/>vars discarded after exit"| EC2
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
