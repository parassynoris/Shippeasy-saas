# SaaS Performance + ISO Readiness Review

Date: 2026-01-30
Scope: ShipEasy API backend (current code structure)

This document lists enhancements needed for performance, SaaS readiness, and ISO/IEC 27001:2022 certification prep.

## Executive Summary

The codebase is functional but needs hardening for SaaS scale, multi-tenancy safety, and security compliance. Key gaps include generic CRUD exposure, limited validation, logging of sensitive data, scattered configuration, and operational controls (rate limiting, readiness checks, secrets handling). The roadmap below targets measurable improvements within 2-3 weeks.

## Key Gaps and Enhancements Needed

### 1) Security and Data Protection (High Priority)
- Sensitive data is logged in `middleware/requestTracer.js` (request/response bodies, headers). This risks PII leakage and violates common ISO controls.
- `.env` is present in repo. Secrets should not live in source control.
- Generic CRUD endpoints (`/:indexName`) allow broad access; current `checkIndex` helps but is not strict by default.
- No centralized input validation. Controllers accept dynamic payloads, which increases risk of invalid data and injection issues.
- Encryption uses a default hardcoded key if `ENCRYPTION_KEY` is missing.
- Lack of explicit role-based access control (RBAC) enforcement in many routes (beyond authentication).

### 2) Multi-Tenancy and SaaS Isolation
- Many queries rely on `orgId` but not consistently enforced at a middleware or model level.
- Generic endpoints allow cross-tenant access unless every handler adds org filtering.
- No tenant-level quotas, rate limits, or usage metrics.

### 3) Performance and Scalability
- Large controllers with multiple responsibilities slow development and optimization.
- Request tracing logs full bodies synchronously; large payloads increase latency.
- Heavy operations run inline (email sending, report generation, OCR/AI parsing). Queueing is partially present but not wired by default.
- Axios calls have limited timeout/retry/circuit breaker usage in most controllers (circuit breaker exists but not used widely).
- Cache is in-memory only (LRU); no distributed cache for multi-instance scaling.

### 4) Observability and Operations
- Two logging systems exist (Winston in `utils/logger.js` and Pino in `service/logger.js`). This fragments logs.
- No structured audit for security events (failed logins, privilege changes) beyond basic audit logs.
- Health endpoint exists, but no readiness/liveness separation or dependency checks.
- No metrics endpoint (e.g., Prometheus) or standardized trace correlation across all external calls.

### 5) Code Structure and Maintainability
- Controllers contain mixed business logic and infrastructure concerns.
- `process.env` is used directly in many places despite a `utils/config.js` module.
- Schema and validation are inconsistent; some collections rely on dynamic schemas and lack runtime validation.

### 6) ISO Readiness (Process + Technical)
- Missing documented policies for access control, incident response, backup/restore, data retention, and change management.
- No evidence of security logging retention policy, access reviews, or least privilege enforcement.
- No documented SDLC/security review or vulnerability management workflow.

## Recommended Fixes (Concrete Actions)

### Security and Compliance
- Remove body logging or redact sensitive fields in `middleware/requestTracer.js`.
- Remove `.env` from repo and add `.env.example` with placeholders.
- Enforce strict `checkIndex` whitelist mode (disable generic CRUD for non-whitelisted collections).
- Add validation layer (e.g., Joi/Zod or Mongoose validation + explicit DTOs) for all input payloads.
- Enforce tenant scoping in a middleware (e.g., inject `orgId` filter automatically for all queries).
- Replace hardcoded defaults for encryption keys with required validation.

### SaaS Hardening
- Implement tenant-based rate limiting (per orgId/userId).
- Add API usage tracking (requests, CPU heavy endpoints, storage usage).
- Provide tenant configuration boundaries and feature flags per org.

### Performance Improvements
- Use job queue for heavy tasks (email, OCR, PDF, Jasper, AI extraction, EDI generation).
- Standardize Axios with timeout + retries + circuit breaker wrapper.
- Introduce a cache layer for reference data (countries, ports, currency, etc.).

### Observability
- Consolidate logging (choose Winston or Pino) and standardize log format.
- Add correlation IDs to outbound HTTP calls and database logs.
- Add readiness endpoint that checks DB + external dependencies.
- Introduce structured security event logging (auth failures, privilege changes).

### Code Structure
- Split large controllers into domain services (QuotationService, InvoiceService, NotificationService, etc.).
- Use `utils/config.js` consistently instead of `process.env` scattered usage.

## 2-3 Week Roadmap

### Week 1 (Stabilize and Secure)
Goals: reduce immediate security risks and enforce SaaS safety.

1) Secrets and config
- Remove `.env` from git; add `.env.example`.
- Enforce required env validation at startup (fail fast in production).

2) Logging safety
- Remove request/response body logging or redact sensitive fields (passwords, tokens, emails, invoices).
- Standardize logger output format and include `traceId` in all logs.

3) Access control and multi-tenancy
- Enable strict whitelist in `checkIndex` (block generic CRUD unless explicitly allowed).
- Add tenant guard middleware: enforce `orgId` filters on all generic queries and critical controllers.

4) Readiness checks
- Add `/readyz` endpoint verifying DB connection and critical service availability.

Deliverables:
- Updated logging middleware
- `.env.example` and git hygiene
- Tenant guard middleware and stricter `checkIndex`
- New readiness endpoint

### Week 2 (Performance and Reliability)
Goals: push heavy work off the request path and increase resilience.

1) Queue integration
- Wire `service/jobQueue.js` and `service/schedulerWorker.js` into the app.
- Move email sending, report generation, OCR, and AI extraction to async jobs.

2) HTTP client hardening
- Create a shared Axios instance with timeouts and optional circuit breaker wrapper.
- Apply to all external calls (WhatsApp, Jasper, Freightos, OceanIO, Zircon).

3) Caching
- Add in-memory caching for reference data (ports, countries, currencies).
- Prepare Redis integration placeholder for multi-instance scaling.

Deliverables:
- Async job processing for heavy endpoints
- Shared HTTP client module
- Cached reference lookups

### Week 3 (Structure, Standards, ISO 27001 Prep)
Goals: improve code structure and formalize ISO-aligned practices.

1) Refactoring foundations
- Create service layer for at least 2-3 core domains (Auth, Quotation, Invoice).
- Replace direct `process.env` usage with `utils/config.js`.

2) Validation and schemas
- Introduce DTO validation for incoming requests on critical endpoints.
- Add schema validation for generic CRUD routes.

3) ISO 27001 documentation and evidence
- Define ISMS scope, interested parties, and context.
- Draft policies: access control, incident response, backup/restore, change management, secure SDLC.
- Add security logging retention and review process.
- Set up dependency vulnerability scanning in CI.

Deliverables:
- Service layer for core domains
- Validation rules in place
- Initial ISO 27001 documentation pack (policies + evidence checklist + draft SoA)

## ISO/IEC 27001:2022 Readiness Checklist (Technical + Process Evidence)

This is a starter checklist aligned to ISO/IEC 27001:2022 Annex A. It focuses on the evidence that auditors typically request.

### Governance and ISMS Core
- ISMS scope statement (systems, locations, products, and data types)
- Risk assessment methodology and risk treatment plan
- Statement of Applicability (SoA) mapping selected Annex A controls
- Information security policy approved by leadership

### Access Control (Annex A: 5.15, 5.16, 5.17, 5.18)
- User provisioning/deprovisioning policy and evidence
- Role-based access control defined and enforced
- MFA for admin and sensitive access
- Periodic access reviews

### Cryptography and Secrets (Annex A: 8.24, 8.25)
- Secrets management process (no secrets in repo, rotation policy)
- Encryption key management and rotation evidence
- TLS configuration and certificate lifecycle documentation

### Logging and Monitoring (Annex A: 8.15, 8.16, 8.17)
- Centralized logging with retention policy
- Audit log integrity and access controls
- Monitoring and alerting for security events

### Secure Development (Annex A: 8.25, 8.28, 8.29, 8.30, 8.31)
- Secure SDLC documented (reviews, approvals, change management)
- Code review evidence and CI/CD checks
- SAST/Dependency scanning and remediation tracking

### Vulnerability and Patch Management (Annex A: 8.8, 8.9)
- Vulnerability scanning schedule and results
- Patch management policy with timelines
- Pen test or security assessment summary

### Incident Management (Annex A: 5.24, 5.25, 5.26)
- Incident response plan and runbooks
- Evidence of incident exercises or tabletop drills

### Backup and Continuity (Annex A: 5.30, 8.13, 8.14)
- Backup policy with recovery testing evidence
- Business continuity and disaster recovery plan

### Supplier and Third-Party Risk (Annex A: 5.19, 5.20, 5.21)
- Supplier risk assessments (Azure, WhatsApp, Jasper, etc.)
- Contracts and security obligations reviewed and documented

## ISO 27001 Control Mapping - High Impact Fixes

Map the following code changes to Annex A controls for SoA and audit evidence:
- Remove request/response body logging or add redaction: A.8.15, A.8.16
- Enforce tenant isolation and access control checks: A.5.15, A.5.16
- Add centralized config + secrets handling (no .env in repo): A.8.24, A.8.25
- Add audit trail for security events: A.8.15, A.8.16, A.5.24
- Add vulnerability scanning in CI: A.8.8, A.8.9

## Suggested Metrics to Track

- Request latency (p50/p95/p99)
- Error rate by endpoint and tenant
- Queue backlog size and processing time
- DB query time and slow query logs
- External API failure rate

---

If you want, I can expand this into a full ISO 27001 artifact pack: ISMS scope, SoA, risk register template, and evidence checklist mapped to Annex A controls.
