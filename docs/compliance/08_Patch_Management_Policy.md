# Shippeasy SaaS — Patch Management Policy

**Document Version:** 1.0  
**Classification:** Internal / Compliance  
**Owner:** Engineering Lead  
**Last Updated:** March 2026  
**Review Cycle:** Annually

---

## 1. Purpose & Scope

This policy defines the process for identifying, testing, approving, and applying security patches and software updates across all components of the Shippeasy SaaS platform. Timely patching reduces the attack surface and maintains compliance with security standards.

**In scope:**
- EC2 operating system (Ubuntu 22.04 LTS)
- Docker Engine and Docker Compose
- Container base images (node:alpine, nginx:alpine, mongo)
- Application dependencies (npm / yarn packages)
- Azure Container Registry runtime
- Third-party integrations (Cognito SDK, Azure SDK, etc.)

**Out of scope:**
- End-user device OS and browsers
- AWS managed services (AWS manages patching for RDS, EKS, etc.)

---

## 2. Patch Classification

| Class | Severity | SLA — Apply By | Example |
|---|---|---|---|
| **Critical** | CVSS 9.0–10.0 | Within **48 hours** of release | Remote code execution, unauthenticated data access |
| **High** | CVSS 7.0–8.9 | Within **7 days** of release | Privilege escalation, authentication bypass |
| **Medium** | CVSS 4.0–6.9 | Within **30 days** | Denial of service, information disclosure |
| **Low** | CVSS 0.1–3.9 | Within **90 days** | Minor information leakage |
| **None / Enhancement** | N/A | Quarterly update cycle | Feature updates, performance improvements |

---

## 3. Patch Sources & Monitoring

| Component | Source | Tool | Frequency |
|---|---|---|---|
| Ubuntu OS | Ubuntu Security Notices (USN) | `unattended-upgrades` | Automatic daily |
| Docker Engine | Docker release notes | Manual check | Monthly |
| Node.js | Node.js security releases | `npm audit` in CI | Every CI run |
| npm packages (backend) | npm advisory database | `npm audit` in CI | Every CI run |
| yarn packages (frontend) | npm advisory database | `yarn audit` in CI | Every CI run |
| Container base images | Docker Hub / ACR scan | Azure Defender for Containers | On push + weekly |
| MongoDB container | Docker Hub security advisories | Manual review | Monthly |

---

## 4. Patch Management Process

### 4.1 OS Patching (Ubuntu EC2)

**Automatic security patches (low-risk):**

Configure `unattended-upgrades` on the EC2 instance:

```bash
# Install
sudo apt-get install -y unattended-upgrades update-notifier-common

# Configure /etc/apt/apt.conf.d/50unattended-upgrades
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<EOF
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::Automatic-Reboot "false";  // Manual reboot required
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
Unattended-Upgrade::Mail "ops@shippeasy.com";
EOF

# Enable
sudo dpkg-reconfigure -f noninteractive unattended-upgrades
```

**Manual patch window (monthly):**

```bash
# 1. Connect to EC2
ssh -i shipeasy-key.pem ubuntu@<EC2-IP>

# 2. Check available updates
sudo apt-get update
sudo apt-get --just-print upgrade | grep "^Inst" | head -20

# 3. Apply all updates (non-disruptive first)
sudo apt-get upgrade -y

# 4. Apply kernel/system updates (may require reboot)
sudo apt-get dist-upgrade -y

# 5. Check if reboot required
cat /var/run/reboot-required 2>/dev/null && echo "REBOOT REQUIRED"

# 6. Schedule reboot during maintenance window
sudo shutdown -r +5 "System reboot for security patches — 5 minutes"
```

**Pre-reboot checklist:**
```
[ ] Create EBS snapshot before patching
[ ] Notify team in #devops channel
[ ] Confirm maintenance window approved (low traffic period)
[ ] Verify Docker containers will auto-restart after reboot
      → docker update --restart unless-stopped shipeasy_frontend shipeasy_api shipeasy_mongo
[ ] After reboot: docker compose ps → all healthy
```

---

### 4.2 Docker Engine Patching

**Check current version:**
```bash
docker --version
docker compose version
```

**Update procedure:**
```bash
# 1. Check release notes at https://docs.docker.com/engine/release-notes/
# 2. Take EBS snapshot
# 3. Update
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4. Verify containers still running
docker compose -f ~/shipeasy/docker-compose.yml ps
```

---

### 4.3 Application Dependency Patching

**Automated scanning in CI pipeline:**

Every pipeline run includes:

```yaml
# In azure-pipelines.yml — TestBackend job
- script: |
    npm audit --audit-level=high
    # Fail build if high or critical CVEs found
  displayName: Security audit
  workingDirectory: shipeasy-api

# In azure-pipelines.yml — TestFrontend job
- script: |
    yarn audit --level high || true  # non-blocking until audit is tuned
  displayName: Security audit
  workingDirectory: shipeasy
```

**Manual dependency update process:**

```bash
# Backend
cd shipeasy-api

# List outdated packages
npm outdated

# Check for vulnerabilities
npm audit

# Fix automatically (non-breaking)
npm audit fix

# Review breaking changes before applying
npm audit fix --force   # use carefully

# Update specific package (e.g., express)
npm install express@latest

# Test after update
npm test

# Commit
git commit -m "security: update express to vX.Y.Z (CVE-XXXX-XXXX)"
```

```bash
# Frontend
cd shipeasy

yarn outdated
yarn audit
yarn upgrade-interactive --latest  # interactive update tool
yarn test
git commit -m "security: update Angular dependencies (CVE-XXXX-XXXX)"
```

---

### 4.4 Container Base Image Patching

Container base images are rebuilt every time the CI pipeline runs. Keeping base images current requires updating the `FROM` line in Dockerfiles.

**Monthly base image review:**

| Dockerfile | Current `FROM` | Check URL |
|---|---|---|
| `shipeasy-api/Dockerfile` | `node:22-alpine` | hub.docker.com/_/node |
| `shipeasy/Dockerfile` | `nginx:stable-alpine` | hub.docker.com/_/nginx |
| `docker-compose.yml` | `mongo:6` | hub.docker.com/_/mongo |

**Update procedure:**

1. Check release notes for new patch versions
2. Update the `FROM` tag in the Dockerfile
3. Build and test locally:
   ```bash
   docker build -t shipeasy-api-test ./shipeasy-api
   docker run --rm shipeasy-api-test node --version
   ```
4. Push to feature branch → CI pipeline tests the new base image
5. Merge to main → pipeline builds and pushes new production images

**Image digest pinning (recommended):**

Replace floating tags with digest pinning for reproducible builds:
```dockerfile
# Instead of:
FROM node:22-alpine

# Use:
FROM node:22-alpine@sha256:<digest>
```

---

### 4.5 MongoDB Patching

MongoDB runs as a Docker container. Patch by updating the image tag in `docker-compose.yml`.

**Check for new releases:** https://www.mongodb.com/docs/manual/release-notes/

```bash
# Update docker-compose.yml
sed -i 's/image: mongo:6/image: mongo:6.X.Y/' ~/shipeasy/docker-compose.yml

# Pull new image
docker pull mongo:6.X.Y

# Schedule rolling restart during maintenance window
docker compose -f ~/shipeasy/docker-compose.yml up -d --no-deps mongo

# Verify
docker compose logs mongo --tail=20
```

> **Caution:** MongoDB major version upgrades (e.g., 6 → 7) require feature compatibility version (`setFeatureCompatibilityVersion`) to be bumped first. Follow MongoDB upgrade documentation exactly.

---

## 5. Patch Testing Procedure

All patches follow this testing sequence before production deployment:

| Step | Environment | Action |
|---|---|---|
| 1 | **Local** | Apply patch in local dev container |
| 2 | **Local** | Run unit tests: `npm test` / `yarn test` |
| 3 | **CI (PR)** | Open PR — pipeline runs all tests against patched code |
| 4 | **Staging** (future) | Deploy to staging and run smoke tests |
| 5 | **Production** | Merge to main → pipeline auto-deploys |

**Exception for Critical patches (CVSS 9+):**

Critical patches may skip staging and deploy directly to production after local test pass. The Engineering Lead must approve via ADO environment gate.

---

## 6. Patch Rollback Procedure

If a patch causes issues in production:

**Application patch rollback:**
```bash
# Redeploy previous Docker image (see CI/CD Flow Diagram §4)
PREVIOUS_TAG=<last-known-good-sha>
docker pull shippeasy.azurecr.io/shipeasy-api:${PREVIOUS_TAG}
docker compose up -d --no-build --no-deps --pull never backend
```

**OS patch rollback:**
```bash
# If kernel update caused issues
sudo apt-get install linux-image-<previous-version>
sudo update-grub
sudo reboot
```

**Package rollback:**
```bash
# Backend
npm install <package>@<previous-version>
npm test && git commit -m "revert: rollback <package> to vX.Y.Z"
```

---

## 7. Patch Schedule

| Activity | Schedule | Owner | Duration |
|---|---|---|---|
| `npm audit` scan | Every CI pipeline run | Automated | ~1 min |
| OS security updates (automatic) | Daily (unattended-upgrades) | Automated | ~5 min |
| OS manual patch window | First Tuesday of each month (Patch Tuesday alignment) | DevOps Engineer | ~30 min |
| Docker Engine update review | Monthly | DevOps Engineer | ~15 min |
| Container base image review | Monthly | DevOps Engineer | ~30 min |
| Full dependency audit + upgrade | Quarterly | Senior Backend Dev | ~4 hrs |
| Annual security tooling review | Annually | Engineering Lead | ~2 hrs |

---

## 8. Patch Documentation Requirements

For every patch applied in production, record in the **Patch Register** (`docs/compliance/patch-register.csv`):

| Column | Example |
|---|---|
| Date | 2026-03-15 |
| Component | `express` npm package |
| Old Version | `4.18.2` |
| New Version | `4.19.0` |
| CVE / Advisory | CVE-2024-12345 |
| CVSS Score | 7.5 (High) |
| Applied By | John Smith |
| Test Result | Pass |
| Deployment Method | CI/CD pipeline (commit abc1234) |
| Notes | Fixed path traversal vulnerability |

---

## 9. Exceptions Process

If a patch cannot be applied within the SLA (e.g., breaking change with no quick fix):

1. **Document** the exception in the Patch Register with justification
2. **Implement compensating control** (e.g., WAF rule, network restriction, feature flag)
3. **Engineering Lead approval** required for all exceptions
4. **Exception expires** in 30 days — must be re-reviewed or resolved
5. **Critical exceptions** must be reported to management and documented

---

## 10. Tooling Summary

| Tool | Purpose | Integration |
|---|---|---|
| `unattended-upgrades` | Automatic OS security patches | EC2 system service |
| `npm audit` | Node.js dependency CVE detection | CI pipeline (every run) |
| `yarn audit` | Frontend dependency CVE detection | CI pipeline (every run) |
| Azure Defender for Containers | ACR image vulnerability scanning | ACR + Azure Security Center |
| CloudWatch Agent | OS-level monitoring, patch compliance | EC2 → CloudWatch |
| AWS Systems Manager Patch Manager | Centralised OS patch tracking (future) | AWS SSM |
