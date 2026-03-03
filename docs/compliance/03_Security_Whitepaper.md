# Shippeasy SaaS — Security Whitepaper

**Document Version:** 1.0  
**Classification:** Confidential — Internal / Compliance  
**Author:** Engineering & Security Team  
**Last Updated:** March 2026  
**Review Cycle:** Annually or after major infrastructure change

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope & Applicability](#2-scope--applicability)
3. [Security Architecture](#3-security-architecture)
4. [Identity & Access Management](#4-identity--access-management)
5. [Data Security & Encryption](#5-data-security--encryption)
6. [Network Security](#6-network-security)
7. [Application Security](#7-application-security)
8. [Container Security](#8-container-security)
9. [Secrets Management](#9-secrets-management)
10. [Monitoring, Logging & Alerting](#10-monitoring-logging--alerting)
11. [Third-Party Integration Security](#11-third-party-integration-security)
12. [Compliance & Regulatory Alignment](#12-compliance--regulatory-alignment)
13. [Known Risks & Mitigations](#13-known-risks--mitigations)
14. [Security Improvement Roadmap](#14-security-improvement-roadmap)

---

## 1. Executive Summary

Shippeasy is a SaaS logistics and shipping management platform serving freight forwarders, agents, and shipping lines. The platform processes sensitive business data including shipment records, commercial invoices, EDI messages, and customer information.

This whitepaper documents the security controls implemented across the platform's cloud infrastructure (AWS EC2), application layer (Node.js + Angular), container runtime (Docker), and CI/CD pipeline (Azure DevOps + ACR). It serves as a reference for internal security reviews, customer due diligence requests, and compliance audits.

**Security posture summary:**

| Domain | Current Maturity | Target |
|---|---|---|
| Network perimeter | Medium | High |
| Identity & access | Medium-High | High |
| Data encryption | Medium | High |
| Container security | High | High |
| Secrets management | Medium | High |
| Monitoring & logging | Medium | High |
| Incident response | Defined | Tested |

---

## 2. Scope & Applicability

This whitepaper applies to:

- **AWS EC2 instance** (`shipeasy-prod`) hosting the containerised application
- **Docker containers:** `shipeasy_frontend`, `shipeasy_api`, `shipeasy_mongo`
- **Azure DevOps** CI/CD pipeline and Azure Container Registry (ACR)
- **Azure Blob Storage** used for document file storage
- **AWS Cognito** user pool used for authentication
- **Source code repositories** hosted on Azure Repos (primary) and GitHub (mirror)

Out of scope:
- End-user devices and browsers
- Third-party APIs (Mapbox, OpenAI, WhatsApp Business)

---

## 3. Security Architecture

### 3.1 Defence in Depth Layers

```
Layer 1 — Perimeter:    AWS Security Group (stateful firewall)
Layer 2 — Host:         Ubuntu UFW + OS hardening
Layer 3 — Container:    Docker isolation, non-root users, minimal base images
Layer 4 — Application:  JWT auth, input validation, rate limiting
Layer 5 — Data:         Encrypted at rest (EBS), TLS in transit
Layer 6 — Secrets:      ADO Variable Groups (masked), server-only .env
Layer 7 — Monitoring:   Elastic APM, Winston logs, CloudWatch, SNS alerts
```

### 3.2 Trust Boundaries

| Boundary | Control |
|---|---|
| Internet → EC2 | AWS Security Group + nginx |
| nginx → API | Docker internal bridge (no external exposure) |
| API → MongoDB | Docker internal bridge (27017 never externally reachable) |
| CI Pipeline → EC2 | SSH key authentication (no password) |
| CI Pipeline → ACR | Service principal (AcrPull role only) |
| API → External services | HTTPS mutual TLS, API keys in environment vars |

---

## 4. Identity & Access Management

### 4.1 User Authentication

Shippeasy supports three authentication mechanisms:

| Method | Implementation | Token Type | Session Management |
|---|---|---|---|
| Username / Password | bcrypt (cost factor 12) hashed in MongoDB | JWT (signed with `SECRET_KEY_JWT`) | `tokenVersion` stored in DB — server-side invalidation |
| AWS Cognito | `amazon-cognito-identity-js` | Cognito JWT (RS256) | Managed by Cognito |
| Google OAuth 2.0 | `google-auth-library` | Google ID Token | Verified server-side |

### 4.2 JWT Security

- Algorithm: HS256 with server-side `SECRET_KEY_JWT` (minimum 32 chars, environment variable)
- Expiry: Configurable (recommend: 1 hour access token)
- Invalidation: `tokenVersion` field in user document. Any password change or admin reset increments `tokenVersion`, invalidating all existing tokens.
- Transmission: `Authorization: Bearer <token>` header only — never in URL parameters or cookies without `HttpOnly` flag

### 4.3 AWS IAM Roles

See the dedicated [IAM Role Matrix](06_IAM_Role_Matrix.md) document.

**EC2 Instance Profile (`shipeasy-ec2-role`) permissions:**

| Service | Action | Purpose |
|---|---|---|
| S3 | `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` | Backup uploads, document access |
| CloudWatch Logs | `logs:CreateLogGroup`, `logs:PutLogEvents` | Application log shipping |
| SNS | `sns:Publish` | Ops alert notifications |
| Cognito | `cognito-idp:AdminGetUser` | User validation |

### 4.4 Principle of Least Privilege

- EC2 IAM role has no `*` wildcard actions
- ACR service principal: `AcrPull` role only (cannot push or delete images)
- CI/CD pipeline agent: no standing access to AWS; deploys only via SSH with a scoped key
- MongoDB: no username/password in current configuration (single-node, Docker internal) — **see known risks §13**

---

## 5. Data Security & Encryption

### 5.1 Encryption in Transit

| Data Path | Protocol | Minimum TLS | Certificate |
|---|---|---|---|
| User → nginx | HTTPS | TLS 1.2 | Let's Encrypt / ACM |
| nginx → Node.js API | HTTP (internal Docker bridge) | N/A — same host | N/A |
| Node.js → MongoDB | MongoDB wire protocol (Docker internal) | N/A — same host | N/A |
| Node.js → Azure Blob | HTTPS | TLS 1.2 | Azure managed |
| Node.js → AWS Cognito | HTTPS | TLS 1.2 | AWS managed |
| Node.js → External APIs | HTTPS | TLS 1.2 | Provider managed |

### 5.2 Encryption at Rest

| Storage | Encryption | Key Management |
|---|---|---|
| EC2 EBS (MongoDB volume) | AWS EBS encryption (AES-256) | AWS KMS (CMK recommended) |
| EC2 EBS (OS volume) | AWS EBS encryption (AES-256) | AWS KMS |
| S3 (backups) | SSE-S3 or SSE-KMS | AWS KMS |
| Azure Blob Storage | Azure Storage Service Encryption | Azure managed |
| ACR (container images) | Azure managed encryption at rest | Azure managed |

### 5.3 Data Classification & Handling

| Classification | Examples | Controls |
|---|---|---|
| **Confidential** | Passwords, JWT secrets, API keys, DB backups | Encrypted at rest & in transit; access-logged; never committed to git |
| **Sensitive** | Shipment data, commercial invoices, customer PII | TLS in transit; role-based access in application |
| **Internal** | Application logs, audit trails | Retained 90 days; CloudWatch log group with KMS |
| **Public** | Product documentation, API docs | No special controls |

### 5.4 Password Policy

- Minimum 8 characters
- Must contain: uppercase, lowercase, digit, special character
- Regex enforced: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`
- Hashing: bcrypt with cost factor ≥ 12

---

## 6. Network Security

### 6.1 Ingress Controls

| Port | Protocol | Source | Justification |
|---|---|---|---|
| 80 | TCP | 0.0.0.0/0 | HTTP — redirected to HTTPS |
| 443 | TCP | 0.0.0.0/0 | HTTPS application traffic |
| 22 | TCP | Azure Pipelines CIDR + Admin IP | SSH — pipeline deploy + emergency access |
| 27017 | TCP | **BLOCKED** | MongoDB internal-only |
| 3000 | TCP | Internal VPC only | API — proxied by nginx |

### 6.2 Egress Controls

All outbound traffic permitted (0.0.0.0/0). Future hardening should restrict outbound to known-good CIDR lists for third-party APIs.

### 6.3 nginx Security Headers

Configured in `nginx.conf.template`:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; ...";
```

*(These headers should be added to nginx.conf.template — see security roadmap §14)*

### 6.4 CORS Policy

Current state: `Access-Control-Allow-Origin: *` in Express (permissive).  
**Recommended:** Restrict to `https://app.shippeasy.com` in production.

---

## 7. Application Security

### 7.1 Authentication Middleware

All API routes are protected by `validateAuth` middleware (`middleware/auth.js`) except:
- `GET /health` — health check (no auth)
- `GET /version` — version info
- `GET /webhook` — WhatsApp webhook verification
- `POST /webhook` — WhatsApp webhook receiver
- `POST /api/contactFormFilled` — public contact form
- Specific search endpoints listed in `restrictAuth` array

### 7.2 Input Validation

- JSON body limit: 50MB (Express `json({ limit: '50mb' })`)
- File uploads: handled via Multer (memory storage) with type-based validation
- MongoDB injection: Mongoose schema typing provides implicit validation
- **Recommended:** Add `express-validator` or `joi` for explicit field-level validation

### 7.3 Rate Limiting

Currently: Not implemented.  
**Recommended:** Add `express-rate-limit` middleware — 100 requests/minute per IP for auth endpoints.

### 7.4 Dependency Security

| Tool | Schedule | Action |
|---|---|---|
| `npm audit` | Every CI run | Fail build on critical CVEs |
| Dependabot / Renovate | Weekly | Auto PRs for dependency updates |
| Snyk / OWASP Dependency Check | Monthly | Deep vulnerability scan |

---

## 8. Container Security

### 8.1 Image Hardening

| Control | Frontend (nginx) | Backend (Node.js) |
|---|---|---|
| Base image | `nginx:stable-alpine` (minimal) | `node:22-alpine` (minimal) |
| Multi-stage build | ✅ — build artefacts excluded from final image | ✅ — dev dependencies excluded |
| Non-root user | nginx default (non-root) | `appuser` (custom non-root) |
| No shell in production | ✅ (alpine — busybox only) | ✅ |
| Pinned base image | ❌ — should use digest pinning | ❌ — should use digest pinning |
| Secrets in image | None — all via environment variables | None — all via environment variables |

### 8.2 Runtime Security

| Control | Status |
|---|---|
| MongoDB port not exposed on host | ✅ |
| Containers on isolated Docker bridge | ✅ |
| `restart: unless-stopped` on all containers | ✅ |
| `--read-only` filesystem flag | ❌ — recommended for frontend |
| Docker Content Trust (image signing) | ❌ — recommended |
| Resource limits (CPU/memory) | ❌ — recommended (`mem_limit`, `cpus`) |

### 8.3 Image Scanning

**Recommended:** Enable Azure Defender for Containers on ACR — automatic vulnerability scan on every push.

---

## 9. Secrets Management

### 9.1 Secret Categories & Storage

| Secret | Storage | Access |
|---|---|---|
| JWT signing key | EC2 `.env` (server-only) | Backend process only |
| MongoDB URI | EC2 `.env` | Backend process only |
| Azure Blob Storage key | EC2 `.env` / env var | Backend process only |
| AWS Cognito credentials | EC2 `.env` | Backend process only |
| SMTP credentials | EC2 `.env` | Backend process only |
| OpenAI API key | EC2 `.env` | Backend process only |
| ACR service principal | ADO Variable Group (masked) + EC2 `.env` | CI pipeline + deploy script |
| Angular build-time vars | ADO Variable Group (masked) | CI build stage only |

### 9.2 Secret Hygiene Rules

1. **Never commit** `.env` files — enforced by `.gitignore` at root, `shipeasy/`, and `shipeasy-api/`
2. **Never log** secrets — Winston transports filter environment variables from log output
3. **Rotate** all secrets on personnel change or suspected compromise
4. **Minimum 32-character** random strings for JWT secret and API keys
5. ADO secret variables are **masked** — they never appear in pipeline logs

### 9.3 Recommended: AWS Secrets Manager

Replace file-based secrets with AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
  --name shipeasy/production/jwt-secret \
  --secret-string "$(openssl rand -hex 32)"
```
Application reads via AWS SDK at startup — no `.env` file on disk.

---

## 10. Monitoring, Logging & Alerting

### 10.1 Application Performance Monitoring

- **Elastic APM** (`elastic-apm-node`) integrated in `index.js`
- Captures: all HTTP transactions, response times, error rates, SQL queries
- Configuration: `captureBody: all`, `captureHeaders: true`, `transactionSampleRate: 1.0`
- APM server: `https://apm.synoris.co`

### 10.2 Application Logging

| Logger | Transport | Retention |
|---|---|---|
| Winston | Files in `/app/logs` (Docker volume) | 30 days rolling |
| Winston | CloudWatch Logs group `shipeasy-api` | 90 days |
| Morgan (HTTP) | Piped to Winston | 30 days |

Log levels: `error`, `warn`, `info`, `debug`  
Log format: structured JSON with `timestamp`, `level`, `message`, `traceId`

### 10.3 Infrastructure Monitoring

| Metric | Tool | Alert Threshold |
|---|---|---|
| CPU utilisation | CloudWatch | > 80% for 5 min → SNS alert |
| Memory utilisation | CloudWatch Agent | > 85% → SNS alert |
| Disk usage (EBS) | CloudWatch Agent | > 80% → SNS alert |
| Container health | Docker healthcheck | mongo: `mongosh ping` |
| HTTP 5xx error rate | Elastic APM | > 5% → alert |
| API response time | Elastic APM | p95 > 2s → alert |

### 10.4 Audit Logging

All authenticated API requests include:
- `userId` / `orgId` from JWT
- `traceId` (UUID generated per request via `requestTracer` middleware)
- Route path, HTTP method, response status
- APM transaction label: `frontendTraceId` for cross-layer correlation

---

## 11. Third-Party Integration Security

| Integration | Data Shared | Auth Method | Security Control |
|---|---|---|---|
| AWS Cognito | User identity | Service account | IAM role, HTTPS |
| Azure Blob Storage | Binary files | Storage Account Key (env var) | HTTPS, private container |
| Google OAuth | User email | OAuth 2.0 client secret | Server-side token verification |
| OpenAI API | Prompt data (no PII policy required) | API key (env var) | HTTPS |
| WhatsApp Business API | Message content | API key (env var) | Webhook signature verification |
| Elastic APM | Performance traces, error messages | APM secret token | HTTPS |
| Firebase FCM | Device tokens, notification payload | Service account key | HTTPS |
| ULIP API | Container/shipment tracking data | Auth token (env var) | HTTPS, proxied via backend |
| Mapbox GL | Map tiles (no user data) | Public access token | Client-side only |

---

## 12. Compliance & Regulatory Alignment

| Standard | Status | Notes |
|---|---|---|
| **OWASP Top 10** | Partial | Auth ✅, Injection ✅ (Mongoose), Exposure ⚠️ (see roadmap) |
| **GDPR** | Partial | PII stored in MongoDB — data residency policy needed |
| **ISO 27001 (basic)** | In progress | This document set forms the initial evidence package |
| **AWS Well-Architected Framework** | Partial | Security pillar addressed here; reliability + performance in roadmap |
| **SOC 2 Type I** | Not started | Requires formal policy register + access reviews |

---

## 13. Known Risks & Mitigations

| Risk ID | Risk Description | Severity | Current Mitigation | Recommended Fix |
|---|---|---|---|---|
| R-01 | MongoDB has no auth credentials (single-node Docker) | **High** | Not reachable from outside Docker network | Enable MongoDB auth (`--auth`) |
| R-02 | CORS policy set to `*` in Express | **Medium** | nginx restricts origin at proxy level | Restrict to app domain in Express |
| R-03 | No rate limiting on auth endpoints | **Medium** | None | Add `express-rate-limit` |
| R-04 | Angular environment file contains encryption key (`secretkey`) in source code | **High** | Code is private repo | Move to build-time `ARG`, never in source |
| R-05 | EBS volumes not confirmed encrypted | **High** | Docker volume isolation | Verify KMS encryption on EBS at provisioning |
| R-06 | No image digest pinning (`:latest` tag used) | **Medium** | ACR SHA tags used in prod | Pin to `sha256:...` digests |
| R-07 | SSH port 22 open to broad CIDR | **Medium** | Key-based auth only | Narrow to ADO IP range + bastion |
| R-08 | No WAF in front of EC2 | **High** | Security group filters | Add AWS WAF on ALB |
| R-09 | No automated dependency vulnerability scanning in CI | **Medium** | Manual `npm audit` | Add `npm audit --audit-level=high` to pipeline |
| R-10 | Single EC2 — no high availability | **Medium** | Docker restart policy | Add ALB + secondary EC2 or ECS |

---

## 14. Security Improvement Roadmap

### Immediate (0–30 days)

- [ ] Enable MongoDB authentication (`--auth` flag + admin user creation)
- [ ] Restrict CORS in Express to production domain
- [ ] Confirm EBS volume encryption is enabled
- [ ] Add `npm audit --audit-level=high` to CI pipeline; fail build on critical CVEs
- [ ] Add security headers to nginx (`X-Frame-Options`, `HSTS`, `CSP`)
- [ ] Rotate the `secretkey` in Angular environment and move to build-time ARG

### Short-term (30–90 days)

- [ ] Add `express-rate-limit` on auth and sensitive endpoints
- [ ] Introduce AWS Secrets Manager for all application secrets
- [ ] Enable VPC Flow Logs to CloudWatch
- [ ] Add Docker resource limits (`mem_limit`, `cpus`) to docker-compose.yml
- [ ] Enable AWS Defender for Containers on ACR
- [ ] Implement structured log filtering to prevent secret leakage in logs

### Medium-term (90–180 days)

- [ ] Deploy Application Load Balancer (ALB) + AWS WAF
- [ ] Move to ECS Fargate or EKS for container orchestration
- [ ] Implement AWS Secrets Manager rotation policies
- [ ] Achieve SOC 2 Type I readiness — formal control register
- [ ] Conduct external penetration test
- [ ] Add multi-AZ deployment for high availability
