# Shippeasy — Engineering Backlog

**Derived from**: `docs/SDLC_MULTI_AGENT_REPORT.md`
**Created**: 2026-03-06
**Total Tasks**: 40

---

## Table of Contents

- [1. Critical Issues (P0)](#1-critical-issues-p0) — 10 tasks
- [2. High Priority Issues (P1)](#2-high-priority-issues-p1) — 12 tasks
- [3. Medium Priority Issues (P2)](#3-medium-priority-issues-p2) — 10 tasks
- [4. SaaS Enhancements (P3)](#4-saas-enhancements-p3) — 8 tasks

---

# 1. Critical Issues (P0)

These tasks address active security vulnerabilities, broken deployment gates, and compliance-blocking issues. They should be resolved before any new feature work.

---

## CRIT-01: Remove Hardcoded Secrets from Frontend Environment Files

**Description**
Five frontend environment files contain hardcoded secrets that ship inside the compiled JavaScript bundle, visible to anyone who inspects the browser network tab or source maps. Exposed values include an AES encryption key (`secretkey`), an API key (`x-api-key`), test user credentials (`username` / `password`), Firebase config, and Azure AD client IDs. All exposed credentials must be rotated immediately after removal.

**Files Affected**

| File | Secrets Found |
|------|---------------|
| `shipeasy/src/environments/environment.ts` | `secretkey`, `x-api-key`, `username`, `password`, Firebase config, `azureClientId` |
| `shipeasy/src/environments/environment.prod.ts` | `secretkey`, `x-api-key` |
| `shipeasy/src/environments/environment.dev.ts` | `secretkey`, `x-api-key` |
| `shipeasy/src/environments/environment.demo.ts` | `secretkey`, `x-api-key` |
| `shipeasy/src/environments/environment.indianproduction.ts` | `secretkey`, `x-api-key` |

**Estimated Effort**: 1 day
**Risk Level**: Low (read-only change; no runtime behavior shift if env vars are set correctly at build time)

**Implementation Steps**

1. For each of the five environment files, replace every hardcoded secret value with a build-time placeholder (e.g. `'#{SECRET_KEY}#'`) or remove the field entirely if it is not needed at runtime.
2. Remove the `username` and `password` fields from `environment.ts` completely — these are test credentials that have no place in any environment config.
3. Update the Angular build pipeline (`azure-pipelines.yml`, Frontend BuildPush stage) to inject the real values via `sed` or `envsubst` during the Docker build, the same way `baseUrl` and `baseUrlMaster` are already handled.
4. Add the new variables (`SECRET_KEY`, `X_API_KEY`) to the Azure DevOps variable group `shipeasy-secrets`.
5. Add a `pre-commit` or CI lint step that greps environment files for known secret patterns and fails the build if any are found.
6. After deployment, rotate every credential that was previously hardcoded: the AES `secretkey`, the `x-api-key`, the test user password, and the WhatsApp verify token (see CRIT-07).

---

## CRIT-02: Enforce RBAC Middleware on Backend Routes

**Description**
The `requireRole()` and `requireFeature()` middleware functions are fully implemented in `middleware/tenantIsolation.js` but are not applied to a single route in `router/route.js`. This means any authenticated user — regardless of role — can call any API endpoint. The frontend hides UI elements via `AccessControlDirective` and `AccessFeatureDirective`, but the backend does not enforce access control, making UI-only restrictions trivially bypassable.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/router/route.js` | Add `requireRole()` and `requireFeature()` to protected routes |
| `shipeasy-api/middleware/tenantIsolation.js` | No change needed (already implemented) |

**Estimated Effort**: 2–3 days
**Risk Level**: Medium (incorrectly restricting a route could lock out legitimate users; requires careful role mapping)

**Implementation Steps**

1. Audit every named endpoint in `route.js` and classify it by the minimum role required (e.g. `admin`, `manager`, `finance`, `operations`, `warehouse`, `customer`).
2. Apply `requireRole()` middleware to each route after `validateAuth`:
   - Configuration and org-management routes → `requireRole('admin', 'superAdmin')`
   - Finance routes (e-invoicing, Tally, credit reports) → `requireRole('admin', 'finance')`
   - Dashboard/report routes → `requireRole('admin', 'manager')`
   - Warehouse routes → `requireRole('admin', 'warehouse')`
   - Customer-facing routes → `requireRole('customer', 'admin')`
3. Apply `requireFeature()` to premium feature endpoints:
   - `/api/scan-bl`, `/api/scan-p-invoice` → `requireFeature('ai-scanning')`
   - `/api/sent-to-einvoicing/:invoiceId` → `requireFeature('einvoicing')`
   - `/api/containerTrack` → `requireFeature('container-tracking')`
4. Add integration tests (at least one per role tier) to verify that unauthorized roles receive 403 responses.
5. Coordinate with frontend team to ensure role names match the values stored in the `role` collection.

---

## CRIT-03: Fix Plain-Text Password Storage and Comparison

**Description**
`auth.controller.js` stores and compares passwords in plain text. The login query filters by `{ password: Password }` directly, and the change-password handler compares `user.password !== currentPassword` as string equality. The file even contains comments acknowledging this is insecure. This is a critical vulnerability — a database leak would expose every user's password.

**Files Affected**

| File | Lines | Issue |
|------|-------|-------|
| `shipeasy-api/controller/auth.controller.js` | ~13 | Login query uses plain-text `password` field |
| `shipeasy-api/controller/auth.controller.js` | ~119–132 | Change-password compares and stores plain text |
| `shipeasy-api/schema/schema.js` | `user` schema definition | `password` field is `type: String` with no hashing |

**Estimated Effort**: 2 days
**Risk Level**: High (requires a data migration to hash all existing passwords; must be coordinated with a maintenance window)

**Implementation Steps**

1. Add `bcrypt` (already in `package.json` as a dependency) to the auth controller if not already imported.
2. Modify the login handler:
   - Query by `userLogin` only (remove `password` from the query filter).
   - After fetching the user, compare the submitted password against the stored hash using `bcrypt.compare()`.
3. Modify the change-password handler:
   - Use `bcrypt.compare(currentPassword, user.password)` instead of `===`.
   - Hash the new password with `bcrypt.hash(newPassword, 12)` before saving.
4. Modify the agent-onboarding handler to hash the initial password before storing.
5. Write a one-time migration script (`scripts/migrate-passwords.js`) that:
   - Iterates all users in the `users` collection.
   - Checks if each password is already a bcrypt hash (starts with `$2b$`).
   - If not, hashes the plain-text value and updates the document.
6. Run the migration script during a maintenance window, then deploy the updated code.
7. Add tests for login with hashed passwords, change-password flow, and rejected invalid passwords.

---

## CRIT-04: Lock Down CORS Default to Deny-All

**Description**
In `middleware/security.js`, the CORS configuration allows all origins when `CORS_ORIGINS` is not set or is empty. The check `allowedOrigins.length === 0` returns `true` when the env var is missing, making the default wide-open. The Socket.io server in `service/socketHelper.js` has a separate CORS config hardcoded to `origin: '*'`.

**Files Affected**

| File | Lines | Issue |
|------|-------|-------|
| `shipeasy-api/middleware/security.js` | 11–34 | `allowedOrigins.length === 0` allows all |
| `shipeasy-api/service/socketHelper.js` | 14–16 | `origin: '*'` on Socket.io |
| `shipeasy-api/index.js` | Socket.io initialization (if CORS is set there too) |

**Estimated Effort**: 0.5 day
**Risk Level**: Low (may break dev setups if `CORS_ORIGINS` is not set locally; mitigate by documenting required env var)

**Implementation Steps**

1. In `security.js`, change the CORS origin callback to reject when `allowedOrigins` is empty:
   ```javascript
   if (!origin) { callback(null, true); return; } // allow non-browser clients
   if (allowedOrigins.length === 0) { callback(new Error('CORS_ORIGINS not configured')); return; }
   ```
2. In `socketHelper.js`, replace the hardcoded `origin: '*'` with a function that reads `CORS_ORIGINS`:
   ```javascript
   const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
   cors: { origin: (origin, cb) => { ... same logic as Express ... }, methods: ['GET', 'POST'] }
   ```
3. Update `.env.example` to document that `CORS_ORIGINS` is required (e.g. `CORS_ORIGINS=https://app.shippeasy.com,https://admin.shippeasy.com`).
4. Update `docker-compose.dev.yml` to include `CORS_ORIGINS=http://localhost:4200,http://localhost:80`.
5. Add a test that verifies a request from a disallowed origin receives a CORS error.

---

## CRIT-05: Add TLS Termination to Production Deployment

**Description**
The production nginx configuration (`shipeasy/nginx.conf.template`) serves HTTP on port 80 with no TLS. All API traffic — including JWT tokens, passwords, and business data — travels unencrypted between the client and the server. The compliance docs mention TLS/ACM but it is not actually implemented.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy/nginx.conf.template` | Add TLS server block or redirect to HTTPS |
| `docker-compose.yml` | Expose port 443, mount certificate volumes |
| `deploy.sh` | Add Certbot renewal or ALB health check adjustments |
| `docs/compliance/` | Update network and security documentation |

**Estimated Effort**: 2–3 days
**Risk Level**: Medium (DNS and certificate provisioning required; must coordinate with domain registrar)

**Implementation Steps**

1. **Option A (Recommended) — ALB + ACM**:
   a. Create an AWS Application Load Balancer in front of the EC2 instance.
   b. Request an ACM certificate for the production domain(s).
   c. Configure ALB listener on 443 (HTTPS) forwarding to EC2:80.
   d. Add an HTTP→HTTPS redirect rule on the ALB.
   e. Update the security group to restrict port 80 to ALB-only traffic.
2. **Option B — Certbot on EC2**:
   a. Install Certbot on the EC2 instance.
   b. Obtain Let's Encrypt certificates for the production domain.
   c. Update `nginx.conf.template` to listen on 443 with the certificate paths and redirect 80→443.
   d. Add a cron job or systemd timer for automatic renewal (`certbot renew`).
   e. Mount certificate directory into the frontend Docker container.
3. Update `deploy.sh` health checks to use `https://` URLs.
4. Update frontend `environment.prod.ts` to use `https://` for `baseUrlMaster` and `socketUrl`.
5. Update compliance documentation to reflect the new TLS architecture.

---

## CRIT-06: Remove `continueOnError` from Frontend CI Tests

**Description**
Line 169 of `azure-pipelines.yml` sets `continueOnError: true` on the frontend Karma test step. This means test failures are silently ignored, and broken code can be deployed to production without any test gate. The comment says "non-blocking until test suite is stable" — the test suite must be stabilized rather than bypassed.

**Files Affected**

| File | Lines | Change |
|------|-------|--------|
| `azure-pipelines.yml` | 169 | Remove `continueOnError: true` |
| `shipeasy/src/**/*.spec.ts` | Various | Fix failing tests |

**Estimated Effort**: 3–5 days (depends on number of broken tests)
**Risk Level**: Medium (fixing tests may reveal bugs; removing `continueOnError` will block deploys until tests pass)

**Implementation Steps**

1. Run the frontend test suite locally in headless mode: `yarn test --watch=false --browsers=ChromeHeadless`.
2. Triage all failures into three buckets:
   - **Quick fix**: Missing imports, typos (e.g. `useVale` → `useValue`), outdated mocks.
   - **Test-only fix**: Tests that need updated assertions or mock data.
   - **App bug**: Tests that expose real application defects.
3. Fix all quick-fix and test-only-fix failures first.
4. For app-bug failures, decide whether to fix the bug or skip the test with a `// TODO: CRIT-06` marker and a tracking issue.
5. Once the suite passes locally, remove `continueOnError: true` from `azure-pipelines.yml` line 169.
6. Push the changes and verify the pipeline passes end-to-end.
7. Add a code coverage threshold (40% minimum) to the test step to prevent regression.

---

## CRIT-07: Move Hardcoded WhatsApp Verify Token to Environment Variable

**Description**
The WhatsApp webhook verification handler in `whatsapp.controller.js` contains a 256-character verify token hardcoded at line 310. This token is committed to version control and visible to anyone with repository access. It should be in an environment variable.

**Files Affected**

| File | Lines | Change |
|------|-------|--------|
| `shipeasy-api/controller/whatsapp.controller.js` | 310–316 | Replace hardcoded token with `process.env.WHATSAPP_VERIFY_TOKEN` |
| `shipeasy-api/.env.example` | — | Add `WHATSAPP_VERIFY_TOKEN` entry |

**Estimated Effort**: 0.5 day
**Risk Level**: Low

**Implementation Steps**

1. In `whatsapp.controller.js`, replace the hardcoded `VERIFY_TOKEN` constant with `process.env.WHATSAPP_VERIFY_TOKEN`.
2. Add a startup check that logs a warning if the env var is not set.
3. Add `WHATSAPP_VERIFY_TOKEN=<your-token>` to `.env.example` with a comment.
4. Add the actual value to the Azure DevOps variable group `shipeasy-secrets` and to the EC2 `.env` file.
5. After deployment, rotate the token in the Facebook Business dashboard and update the env var.

---

## CRIT-08: Secure Unauthenticated Business Endpoints

**Description**
Several endpoints that perform business operations are exposed without any authentication: `POST /api/load-plan`, `POST /api/load-calculate`, `POST /api/agentOnBoarding`, `GET /api/quotation/update/:id/:status`, and `POST /api/quotation/download`. An attacker can create organizations, modify quotation statuses, and generate reports without credentials.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/router/route.js` | Add `validateAuth` to unprotected routes |
| `shipeasy-api/controller/non-auth.controller.js` | Update `quotationUpdates` to use signed links |

**Estimated Effort**: 2 days
**Risk Level**: Medium (adding auth to `load-plan` and `load-calculate` may break public-facing load calculator if one exists; verify with product team)

**Implementation Steps**

1. Add `validateAuth` middleware to `/api/load-plan` and `/api/load-calculate` routes.
2. Add rate limiting to `/api/agentOnBoarding` (e.g. 5 per hour per IP) since it creates tenants.
3. Replace the unauthenticated `GET /api/quotation/update/:id/:status` with a signed URL pattern:
   a. When generating the quotation email, create a JWT or HMAC-signed token embedding the quotation ID and intended status.
   b. The endpoint validates the signature before updating the status.
   c. Add an expiry (e.g. 72 hours) to prevent indefinite reuse.
4. Add authentication to `/api/quotation/download` or scope it to the signed-URL pattern.
5. Verify the `contactFormFilled` endpoint still works with its `WORDPRESS_TOKEN` check and add rate limiting.
6. Add integration tests for each previously-unauthenticated endpoint to verify the new auth requirements.

---

## CRIT-09: Validate or Remove the `x-api-key` Header

**Description**
The frontend injects an `x-api-key` header on every request (hardcoded in environment files). The backend accepts this header in the CORS `allowedHeaders` list but never validates it. This creates a false sense of security — the key appears to protect the API but actually does nothing.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/middleware/auth.js` | Add `x-api-key` validation or remove references |
| `shipeasy-api/middleware/security.js` | Potentially remove from `allowedHeaders` |
| `shipeasy/src/app/services/api.interceptor.ts` | Update or remove header injection |
| `shipeasy/src/environments/environment*.ts` | Remove hardcoded `x-api-key` values |

**Estimated Effort**: 1 day
**Risk Level**: Low

**Implementation Steps**

1. **Decision**: Either validate the key or remove it entirely.
   - **Option A (Validate)**: In `auth.js`, before JWT validation, check `req.headers['x-api-key']` against `process.env.X_API_KEY`. Return 403 if missing or mismatched. This adds a defense-in-depth layer.
   - **Option B (Remove)**: Delete the `x-api-key` from all environment files and the interceptor. Remove it from the CORS `allowedHeaders`. This simplifies the stack and removes the false signal.
2. If Option A: Add the key to `.env.example` and the variable group. Rotate the currently-exposed key.
3. If Option B: Remove the key from all 5 environment files and `api.interceptor.ts`.
4. Add a test verifying the chosen behavior (403 on missing key, or that the header is simply not sent).

---

## CRIT-10: Add Webhook Authentication for OceanIO

**Description**
The `POST /api/oceanIOWebhook` endpoint in `route.js` has no authentication, validation, or signature verification. Any actor who discovers the URL can send arbitrary payloads that the system will process as legitimate tracking events.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/router/route.js` | Add webhook signature verification middleware |
| `shipeasy-api/controller/webhooks.controller.js` | Add signature validation logic |
| `shipeasy-api/.env.example` | Add `OCEANIO_WEBHOOK_SECRET` |

**Estimated Effort**: 1 day
**Risk Level**: Low

**Implementation Steps**

1. Check OceanIO's documentation for their webhook signature format (typically HMAC-SHA256 in a header like `X-Signature`).
2. Create a `verifyOceanIOSignature` middleware that:
   a. Reads the raw request body.
   b. Computes HMAC-SHA256 using `OCEANIO_WEBHOOK_SECRET`.
   c. Compares the computed signature with the header value using `crypto.timingSafeEqual()`.
   d. Returns 401 if the signature is invalid.
3. Apply this middleware to the `/api/oceanIOWebhook` route.
4. Add `OCEANIO_WEBHOOK_SECRET` to `.env.example` and the variable group.
5. Add IP allowlisting if OceanIO publishes a list of webhook source IPs.
6. Add a test with a valid and an invalid signature.

---

# 2. High Priority Issues (P1)

These tasks address architectural debt, missing test coverage, and infrastructure reliability. They should be planned for the next 1–2 sprints.

---

## HIGH-01: Split Monolithic `route.js` into Domain Routers

**Description**
`router/route.js` is approximately 5,890 lines — a single file containing every API route definition. This causes merge conflicts, makes code review impractical, and makes it impossible to understand the API surface of a single domain in isolation.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/router/route.js` | Split into ~10 domain-specific files |
| `shipeasy-api/router/auth.routes.js` | New — auth endpoints |
| `shipeasy-api/router/crud.routes.js` | New — generic CRUD endpoints |
| `shipeasy-api/router/finance.routes.js` | New — e-invoicing, Tally, credit reports |
| `shipeasy-api/router/tracking.routes.js` | New — ULIP, container tracking |
| `shipeasy-api/router/communication.routes.js` | New — email, WhatsApp |
| `shipeasy-api/router/storage.routes.js` | New — file upload/download |
| `shipeasy-api/router/reports.routes.js` | New — Jasper, dashboard reports |
| `shipeasy-api/router/ai.routes.js` | New — BL scanning, invoice scanning |
| `shipeasy-api/router/webhook.routes.js` | New — OceanIO, WhatsApp webhooks |
| `shipeasy-api/router/index.js` | New — aggregates and re-exports all routers |

**Estimated Effort**: 3–5 days
**Risk Level**: Medium (must verify every route still works after the split; integration tests are essential)

**Implementation Steps**

1. Create a `router/` directory with one file per domain.
2. For each domain file, create an `express.Router()` instance and move the relevant routes from `route.js`.
3. Preserve the exact middleware chain on each route (validation → auth → tenant isolation → controller).
4. Create `router/index.js` that imports all domain routers and mounts them on the parent router.
5. Update `index.js` to `app.use('/api', require('./router'))`.
6. Run the existing `retrieval.test.js` and any manual API tests to verify nothing broke.
7. Update imports in any file that references `router/route.js` directly.

---

## HIGH-02: Split Monolithic `schema.js` into Domain Modules

**Description**
`schema/schema.js` is approximately 9,114 lines containing all 87 Mongoose schema definitions in a single object literal. This makes it impossible to navigate, causes long load times in editors, and couples all schemas into one import.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/schema/schema.js` | Refactor into per-domain modules |
| `shipeasy-api/schema/shipment.schema.js` | New — enquiry, quotation, batch, container, etc. |
| `shipeasy-api/schema/finance.schema.js` | New — invoice, transaction, payment, etc. |
| `shipeasy-api/schema/warehouse.schema.js` | New — 13 warehouse schemas |
| `shipeasy-api/schema/communication.schema.js` | New — email, message, notification |
| `shipeasy-api/schema/user.schema.js` | New — user, role, feature, menu |
| `shipeasy-api/schema/masters.schema.js` | New — port, vessel, commodity, etc. |
| `shipeasy-api/schema/transport.schema.js` | New — air, rail, land, lorry |
| `shipeasy-api/schema/audit.schema.js` | New — event, auditlog, logaudit |
| `shipeasy-api/schema/index.js` | New — aggregates all schemas into the same `schemas` object |

**Estimated Effort**: 3–5 days
**Risk Level**: Medium (the schema object keys are used as collection names throughout the app; the aggregated export must maintain identical keys)

**Implementation Steps**

1. Create one file per domain group, each exporting a partial object (e.g. `module.exports = { enquiry: { ... }, quotation: { ... } }`).
2. Move the audit post-hook setup and the `newSchemaWithObject` function into a shared `schema/helpers.js`.
3. Create `schema/index.js` that merges all partial exports into the single `schemas` object and applies the Mongoose model creation logic.
4. Update all `require('../schema/schema')` imports to `require('../schema')` (index.js).
5. Run the existing tests to verify all 87 models are still registered correctly.
6. Verify the `checkIndex` middleware still resolves schema names correctly.

---

## HIGH-03: Extract Backend Service Layer from Controllers

**Description**
Controllers in `shipeasy-api/controller/` contain raw business logic, database queries, external API calls, and response formatting all in one place. There is no service layer. This makes the code untestable in isolation, creates tight coupling, and prevents code reuse across controllers.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/controller/*.js` | Extract business logic into services |
| `shipeasy-api/services/` | New domain service files |

**Estimated Effort**: 2–3 weeks (incremental; can be done one domain at a time)
**Risk Level**: Medium

**Implementation Steps**

1. Start with the highest-value domains: auth, finance (e-invoicing), and tracking (ULIP).
2. For each controller function:
   a. Move database queries and business logic into a service function.
   b. The controller should only handle request parsing, input validation, calling the service, and formatting the response.
   c. The service should accept plain JavaScript objects (not `req`/`res`) and return results or throw errors.
3. Create service files:
   - `services/auth.service.js` — login, password reset, token generation
   - `services/finance.service.js` — e-invoicing, Tally, credit reports
   - `services/tracking.service.js` — ULIP integration, container events
   - `services/storage.service.js` — Azure Blob operations (consolidating the two existing controllers)
   - `services/email.service.js` — email sending, IMAP processing
4. Update controller imports to use the new services.
5. Add unit tests for each service function (pure logic, mocked DB).

---

## HIGH-04: Consolidate Duplicate Controllers and Loggers

**Description**
The backend has multiple duplicated or near-duplicate files: two storage controllers (`storage.controller.js` and `azureStorageContoller.js`), two EDI controllers (`edi.controller.js` and `ediController.js`), and two logger files (`service/logger.js` and `utils/logger.js`). The storage controller also has a filename typo (`Contoller` instead of `Controller`).

**Files Affected**

| File | Action |
|------|--------|
| `shipeasy-api/controller/storage.controller.js` | Keep as primary; merge unique functions from azureStorageContoller.js |
| `shipeasy-api/controller/azureStorageContoller.js` | Deprecate and delete after merge |
| `shipeasy-api/controller/edi.controller.js` | Keep as primary; merge from ediController.js |
| `shipeasy-api/controller/ediController.js` | Deprecate and delete after merge |
| `shipeasy-api/service/logger.js` | Delete; redirect imports to `utils/logger.js` |
| `shipeasy-api/utils/logger.js` | Keep as the single logger |
| All files importing from deleted paths | Update imports |

**Estimated Effort**: 1–2 days
**Risk Level**: Low (straightforward find-and-replace; verify with tests)

**Implementation Steps**

1. Diff `storage.controller.js` and `azureStorageContoller.js` to identify unique functions.
2. Merge any unique functions from `azureStorageContoller.js` into `storage.controller.js`.
3. Search the entire codebase for `require('..azureStorageContoller')` and update to the primary controller.
4. Delete `azureStorageContoller.js`.
5. Repeat for the two EDI controllers.
6. For loggers: search for `require('../service/logger')` across the codebase, update all to `require('../utils/logger')`, then delete `service/logger.js`.
7. Run full test suite.

---

## HIGH-05: Add Security Middleware Tests

**Description**
There are zero tests for the security middleware chain (Helmet, CORS, rate limiting, NoSQL sanitization, HPP, input validation, error handling, tenant isolation). This is the most security-critical code in the application and has no automated verification.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/tests/security.test.js` | New — security middleware test suite |
| `shipeasy-api/tests/auth.test.js` | New — authentication edge case tests |
| `shipeasy-api/tests/tenant-isolation.test.js` | New — multi-tenant isolation tests |

**Estimated Effort**: 3–5 days
**Risk Level**: Low (additive; no production code changes)

**Implementation Steps**

1. Create `tests/security.test.js` with tests for:
   - Rate limiting: verify 429 after exceeding global limit (1000 req/15min) and auth limit (20 req/15min).
   - NoSQL injection: send `{ "$gt": "" }` in a query body; verify it is sanitized.
   - Path traversal: send `../../etc/passwd` as a filename; verify 400 rejection.
   - Invalid `indexName`: send special characters; verify 400 rejection.
   - CORS: send request from disallowed origin; verify rejection.
   - 404: request undefined route; verify structured 404 response.
   - Error handler: trigger a server error; verify stack trace is hidden in production.
2. Create `tests/auth.test.js` with tests for:
   - Valid JWT login → 200 with token.
   - Invalid credentials → 401.
   - Expired JWT → 401.
   - Missing Authorization header → 401.
   - Token length < 10 → 401.
   - Disabled user → 401 with message.
   - Expired trial → 401 with trial message.
3. Create `tests/tenant-isolation.test.js` with tests for:
   - Search auto-injects orgId.
   - Insert auto-injects orgId.
   - User A cannot see User B's org data.
   - SuperAdmin bypasses tenant filter.
   - Exempt collections (country, port) are not filtered.
4. Add all new test files to the Jest configuration.
5. Integrate into the CI pipeline as a required test step.

---

## HIGH-06: Add Backend Named Endpoint Integration Tests

**Description**
The only backend tests cover generic CRUD operations. None of the ~60 named business endpoints (scan-bl, e-invoicing, EDI, container tracking, dashboard, reports, etc.) have any test coverage.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/tests/endpoints/` | New test directory with per-domain test files |

**Estimated Effort**: 5–7 days
**Risk Level**: Low (additive)

**Implementation Steps**

1. Create test files for each domain:
   - `tests/endpoints/finance.test.js` — e-invoicing, Tally, credit reports
   - `tests/endpoints/tracking.test.js` — container tracking, ULIP
   - `tests/endpoints/ai.test.js` — BL scanning, invoice scanning
   - `tests/endpoints/email.test.js` — send email, batch email
   - `tests/endpoints/storage.test.js` — upload, download
   - `tests/endpoints/dashboard.test.js` — chart data, notifications
   - `tests/endpoints/reports.test.js` — Jasper, scheduled reports
2. Mock external API calls (ULIP, Zircon, OpenAI, Gemini, Freightos) using `jest.mock()` or `nock`.
3. Seed test data in `beforeAll` hooks; clean up in `afterAll`.
4. Test both success and error paths for each endpoint.
5. Remove hardcoded credentials from the existing `retrieval.test.js` — use `process.env.TEST_USERNAME` / `process.env.TEST_PASSWORD`.
6. Add a `.env.test` file with test-specific configuration.

---

## HIGH-07: Fix Eager Module Imports in Frontend LayoutModule

**Description**
`layout.module.ts` eagerly imports `EnquiryModule` and `DashboardModule` even though they are also configured as lazy-loaded routes in `layout-routing.module.ts`. This defeats the purpose of lazy loading and increases the initial bundle size — these modules and all their dependencies are loaded on every page.

**Files Affected**

| File | Lines | Change |
|------|-------|--------|
| `shipeasy/src/app/layout/layout.module.ts` | 32–34, 63–65 | Remove eager imports of `EnquiryModule` and `DashboardModule` |

**Estimated Effort**: 0.5 day
**Risk Level**: Low (if the modules are correctly lazy-loaded via routing, removing the eager import should have no effect on functionality)

**Implementation Steps**

1. Remove the `import { DashboardModule }` and `import { EnquiryModule }` statements from `layout.module.ts`.
2. Remove `EnquiryModule` and `DashboardModule` from the `imports` array in the `@NgModule` decorator.
3. Verify that `layout-routing.module.ts` correctly lazy-loads both modules via `loadChildren`.
4. Run the app and navigate to `/home/dashboard` and `/home/enquiry` to verify they load correctly.
5. Run `yarn build --configuration=production` and compare the bundle size before and after.

---

## HIGH-08: Migrate MongoDB to Managed Service

**Description**
MongoDB runs as a Docker container on the same EC2 instance as the application, using a Docker volume (`mongo_data`) for persistence. There are no automated backups, no replication, and no failover. A disk failure, EC2 termination, or Docker volume corruption would result in complete data loss.

**Files Affected**

| File | Change |
|------|--------|
| `docker-compose.yml` | Remove `mongo` service; update `backend` to use external connection |
| `shipeasy-api/.env.example` | Update `MONGO_CONNECTION` to Atlas/DocumentDB URI |
| `shipeasy-api/service/mongooseConnection.js` | Verify TLS and connection string compatibility |
| `shipeasy-api/schema/indexes.js` | Verify indexes are compatible with managed service |

**Estimated Effort**: 3–5 days
**Risk Level**: High (data migration required; must verify application compatibility with the managed service's MongoDB version)

**Implementation Steps**

1. Provision a MongoDB Atlas cluster (M10 or higher for production) or an AWS DocumentDB cluster.
2. Enable automated backups with a retention period of at least 7 days.
3. Dump the existing production database using `mongodump`.
4. Restore to the managed service using `mongorestore`.
5. Update `MONGO_CONNECTION` in the production `.env` to point to the new cluster.
6. Enable TLS for the connection (`ssl=true` in the connection string).
7. Remove the `mongo` service from `docker-compose.yml` (keep it in `docker-compose.dev.yml` for local development).
8. Verify all application functionality, especially index creation (`indexes.js`).
9. Monitor for 48 hours before decommissioning the old container.

---

## HIGH-09: Add Staging Environment and Pipeline

**Description**
There is no staging environment. All code pushed to `main` is deployed directly to production after passing tests. There is no approval gate, no smoke test in a staging-like environment, and no way to validate changes before they reach real users.

**Files Affected**

| File | Change |
|------|--------|
| `azure-pipelines.yml` | Add staging deployment stage with approval gate |
| `docker-compose.staging.yml` | New — staging-specific overrides |
| `deploy.sh` | Parameterize for staging vs. production |

**Estimated Effort**: 3–5 days
**Risk Level**: Low (additive infrastructure; does not affect production)

**Implementation Steps**

1. Provision a second EC2 instance (or use a smaller instance type) for staging.
2. Clone the production Docker Compose setup to the staging instance.
3. Create a `staging` environment in Azure DevOps with an approval gate.
4. Add a `DeployStaging` stage to `azure-pipelines.yml` that runs before `Deploy`:
   - Deploys to the staging EC2 using the same `deploy.sh` script.
   - Runs a smoke test (hit `/health`, login, create an enquiry, delete it).
   - Requires manual approval to proceed to production.
5. Parameterize `deploy.sh` to accept a target environment argument (staging vs. production).
6. Configure staging to use a separate database (copy of production schema, test data only).

---

## HIGH-10: Add Pipeline Caching for Dependencies

**Description**
The CI pipeline runs `npm ci` (backend) and `yarn install` (frontend) on every build without any caching. This adds 2–5 minutes to each pipeline run and wastes bandwidth.

**Files Affected**

| File | Change |
|------|--------|
| `azure-pipelines.yml` | Add cache steps for npm and yarn |

**Estimated Effort**: 0.5 day
**Risk Level**: Low

**Implementation Steps**

1. Add Azure Pipelines `Cache@2` task before the backend test step:
   ```yaml
   - task: Cache@2
     inputs:
       key: 'npm | "$(Agent.OS)" | shipeasy-api/package-lock.json'
       path: 'shipeasy-api/node_modules'
   ```
2. Add a similar cache task for the frontend:
   ```yaml
   - task: Cache@2
     inputs:
       key: 'yarn | "$(Agent.OS)" | shipeasy/yarn.lock'
       path: 'shipeasy/node_modules'
   ```
3. Verify that cached builds pass correctly.

---

## HIGH-11: Remove Dead Code (GHCR Block, Mock AuthService)

**Description**
`deploy.sh` contains an unreachable GHCR deployment block (lines 136–194) that never executes because the ACR block exits first. The frontend has a mock `AuthService` with hardcoded credentials (`amich` / `test1234`) that is never used for real authentication but exists in the production bundle.

**Files Affected**

| File | Lines | Change |
|------|-------|--------|
| `deploy.sh` | 136–194 | Remove unreachable GHCR block |
| `shipeasy/src/app/services/auth.service.ts` | 25 | Remove mock login logic |
| `shipeasy/src/app/services/auth.service.spec.ts` | 59 | Update test |

**Estimated Effort**: 0.5 day
**Risk Level**: Low

**Implementation Steps**

1. In `deploy.sh`, delete lines 136–194 (the entire GHCR block) and any associated comments.
2. In `auth.service.ts`, remove the mock `login()` method that compares against `amich`/`test1234`, or replace it with a no-op that always returns `false`.
3. Update `auth.service.spec.ts` to reflect the change.
4. Search the codebase for any imports of `AuthService` — if nothing uses the mock `login()`, the service can be simplified or removed entirely.
5. Verify the app still compiles and tests pass.

---

## HIGH-12: Hardcoded Test Credentials in Backend Tests

**Description**
`tests/retrieval.test.js` contains hardcoded production credentials (`rutvikm` / `:0W+{6#F`) on lines 39–40. If the repository is ever made public, these credentials are immediately compromised. The test also creates a full Express server manually instead of importing the app.

**Files Affected**

| File | Lines | Change |
|------|-------|--------|
| `shipeasy-api/tests/retrieval.test.js` | 38–41 | Replace with env var references |
| `shipeasy-api/.env.test` | New — test-specific environment |

**Estimated Effort**: 0.5 day
**Risk Level**: Low

**Implementation Steps**

1. Create a `.env.test` file in `shipeasy-api/`:
   ```
   TEST_USERNAME=test_user
   TEST_PASSWORD=test_password_hash
   MONGO_CONNECTION=mongodb://localhost:27017/shipeasy_test
   ```
2. Update `retrieval.test.js` to read credentials from `process.env.TEST_USERNAME` and `process.env.TEST_PASSWORD`.
3. Ensure `dotenv` loads `.env.test` in test mode (it already calls `require("dotenv").config()`; may need to point to the correct file).
4. Add `.env.test` to `.gitignore`.
5. Document the required test environment variables in `README.md`.

---

# 3. Medium Priority Issues (P2)

These tasks address performance, code quality, and developer experience. They should be planned across the next quarter.

---

## MED-01: Convert Date Fields from String to Date Type

**Description**
All date fields across the 87 Mongoose schemas (`createdOn`, `updatedOn`, `validFrom`, `validTo`, etc.) are defined as `type: String`. This prevents MongoDB from using date-specific operators (`$gte`, `$lte`), breaks date-range indexing, and forces string comparison for sorting.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/schema/schema.js` (or split modules) | Change `type: String` to `type: Date` for all date fields |
| `shipeasy-api/schema/indexes.js` | Verify indexes still work after type change |
| `scripts/migrate-dates.js` | New — migration script to convert existing String dates to Date objects |
| All controllers and services that read/write dates | Verify compatibility |

**Estimated Effort**: 5–7 days (schema change + migration + testing)
**Risk Level**: High (requires a data migration; must handle malformed date strings gracefully)

**Implementation Steps**

1. Identify all date fields across all schemas (search for fields containing `On`, `Date`, `Till`, `From`, `To`, `Time` in names).
2. Change their type from `String` to `Date` in the schema definitions.
3. Write a migration script that iterates all collections and converts string dates to `Date` objects using `new Date(stringValue)`. Handle invalid date strings by logging them and skipping.
4. Test the migration on a copy of the production database.
5. Update all controllers/services that format dates for API responses to use `toISOString()`.
6. Update frontend date parsing if it relies on string format assumptions.
7. Run in staging for at least 1 week before production.

---

## MED-02: Add Server-Side Pagination to Search Endpoints

**Description**
The generic search endpoint (`POST /api/search/:indexName`) passes user-provided queries directly to `Model.find()` without enforcing `limit` or `skip`. A query returning thousands of records can exhaust memory and cause timeouts.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/controller/search.controller.js` | Add default pagination |
| `shipeasy-api/controller/insert.commonController.js` | May need updates for batch operations |

**Estimated Effort**: 2 days
**Risk Level**: Medium (may break frontend components that assume they receive all records; coordinate with frontend)

**Implementation Steps**

1. In the search handler (`get` function in `search.controller.js`), enforce a maximum `limit` (e.g. 500 records) and a default (e.g. 50).
2. Read `page` and `limit` from `req.body` or `req.query`, with validation.
3. Apply `.skip((page - 1) * limit).limit(limit)` to all queries.
4. Return pagination metadata in the response: `{ documents, total, page, limit, totalPages }`.
5. Update the frontend `ApiService` and components to handle pagination.
6. Add tests for pagination edge cases (page 0, page beyond total, limit > max).

---

## MED-03: Add Cron Job Locking to Prevent Overlapping Execution

**Description**
Two cron jobs run every minute (IMAP email processing and reminder delivery). If processing takes longer than 1 minute, a second invocation starts while the first is still running, potentially causing duplicate emails, race conditions, or database corruption.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/service/schedulers.js` | Add locking mechanism to all cron jobs |

**Estimated Effort**: 1 day
**Risk Level**: Low

**Implementation Steps**

1. Add an in-memory lock using a simple boolean flag per job:
   ```javascript
   let isProcessingEmails = false;
   cron.schedule('* * * * *', async () => {
     if (isProcessingEmails) return;
     isProcessingEmails = true;
     try { await fetchAndProcessEmails(); }
     finally { isProcessingEmails = false; }
   });
   ```
2. For distributed deployments (future), use a Redis-based lock (`SET key NX EX ttl`).
3. Apply the same pattern to all 16 cron jobs.
4. Add logging when a job is skipped due to lock.

---

## MED-04: Split SharedModule into Feature-Specific Sub-Modules

**Description**
The frontend `SharedModule` contains 100+ components, 15+ pipes, and 8+ directives. Every feature module that imports `SharedModule` gets all of these, even if it only needs 2–3 components. This increases memory usage and slows initial compilation.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy/src/app/shared/shared.module.ts` | Refactor into sub-modules |
| `shipeasy/src/app/shared/shared-finance.module.ts` | New |
| `shipeasy/src/app/shared/shared-warehouse.module.ts` | New |
| `shipeasy/src/app/shared/shared-core.module.ts` | New — pipes, directives, common components |
| All feature modules importing SharedModule | Update imports |

**Estimated Effort**: 3–5 days
**Risk Level**: Medium (must verify no component breaks when moved to a sub-module)

**Implementation Steps**

1. Audit which shared components each feature module actually uses.
2. Create sub-modules:
   - `SharedCoreModule` — pipes, directives, common utilities (always imported)
   - `SharedFinanceModule` — Invoice, Payment, Credit, Debit, PNL components
   - `SharedWarehouseModule` — GRN, Gate Entry, Packing, Dispatch components
   - `SharedShipmentModule` — Route, Port, Container, Milestone components
   - `SharedMasterModule` — Master data components (Vessel, Voyage, etc.)
3. Each feature module imports only the sub-module(s) it needs.
4. `SharedModule` can be kept as a convenience re-export of all sub-modules for backwards compatibility.
5. Verify build and all existing tests pass.

---

## MED-05: Standardize on Single UI Component Library

**Description**
The frontend uses four UI libraries simultaneously: Angular Material, NG-Zorro Antd, Bootstrap 5, and ng-bootstrap. This creates visual inconsistency, large bundle size, and confusion about which library to use for new components.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy/package.json` | Remove deprecated libraries after migration |
| `shipeasy/src/app/**/*.html` | Replace components from deprecated libraries |
| `shipeasy/src/app/**/*.module.ts` | Update module imports |

**Estimated Effort**: 4–8 weeks (large-scale migration; can be done incrementally)
**Risk Level**: Medium

**Implementation Steps**

1. **Choose primary library**: Angular Material (already the primary, better Angular integration) or NG-Zorro (more complete component set).
2. Audit every template to identify which library each component comes from.
3. Create a migration spreadsheet mapping each NG-Zorro component to its Material equivalent (or vice versa).
4. Migrate one module at a time, starting with low-traffic pages.
5. Keep Bootstrap 5 for layout utilities (grid, spacing) — it has minimal overlap with component libraries.
6. Remove ng-bootstrap after all modals and dropdowns are migrated to the primary library.
7. Run visual regression tests (or manual review) after each module migration.

---

## MED-06: Add Backend ESLint Configuration

**Description**
The backend has no ESLint or Prettier configuration. Code style is inconsistent, `console.log` is used instead of the Winston logger in many places, and there is no automated way to catch code quality issues.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/.eslintrc.json` | New — ESLint configuration |
| `shipeasy-api/package.json` | Add ESLint dev dependencies |
| `shipeasy-api/service/schedulers.js` | Replace `console.log` with logger |
| Various controller files | Fix lint violations |

**Estimated Effort**: 2–3 days
**Risk Level**: Low

**Implementation Steps**

1. Install ESLint: `npm install --save-dev eslint eslint-config-node`.
2. Create `.eslintrc.json` with rules matching the frontend conventions where applicable:
   - `no-console: ["error", { allow: ["info", "error"] }]`
   - `no-unused-vars: "warn"`
   - `prefer-const: "error"`
3. Run `npx eslint . --fix` to auto-fix simple issues.
4. Manually fix remaining violations (primarily `console.log` → `logger.info`).
5. Add `"lint": "eslint ."` to `package.json` scripts.
6. Add a lint step to the CI pipeline before tests.

---

## MED-07: Add API Versioning

**Description**
All routes are under `/api/` with no version prefix. Any breaking change to an endpoint immediately affects all clients. There is no way to maintain backward compatibility during migrations.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/router/index.js` (or `route.js`) | Mount routes under `/api/v1/` |
| `shipeasy-api/index.js` | Update base path |
| `shipeasy/src/environments/environment*.ts` | Update `baseUrlMaster` to include `/v1/` |
| `shipeasy/src/proxy.conf.json` | Update proxy target |

**Estimated Effort**: 1–2 days
**Risk Level**: Medium (must update all frontend API calls; can keep `/api/` as an alias for `/api/v1/` during transition)

**Implementation Steps**

1. Mount the router at `/api/v1/` instead of `/api/`.
2. Add a redirect or alias from `/api/` → `/api/v1/` for backward compatibility during the transition.
3. Update all frontend `baseUrlMaster` values to include `/v1/`.
4. Update the proxy config and nginx template.
5. Document the versioning policy: major breaking changes get a new version; additive changes are backward compatible.

---

## MED-08: Add Centralized Logging and Monitoring Alerts

**Description**
Application logs are written to Docker volumes (`logs_data`) on the EC2 instance. There is no centralized log aggregation, no alerting on error rates, and no way to search logs across time without SSH access to the server.

**Files Affected**

| File | Change |
|------|--------|
| `docker-compose.yml` | Add log driver configuration or sidecar |
| `shipeasy-api/utils/logger.js` | Add CloudWatch or ELK transport |

**Estimated Effort**: 3–5 days
**Risk Level**: Low

**Implementation Steps**

1. **Option A (CloudWatch)**: Add `winston-cloudwatch` transport to `utils/logger.js`. Configure log group and stream per environment.
2. **Option B (ELK)**: Deploy an Elasticsearch + Kibana instance (or use Elastic Cloud). Add `winston-elasticsearch` transport.
3. **Option C (Loki)**: Deploy Grafana Loki with a Docker log driver. Minimal code changes.
4. Configure alerts for: error rate > 10/min, 5xx responses > 1%, authentication failures > 50/hour.
5. Add a dashboard for key metrics: request count, response times, error rates, cron job execution.
6. Update the compliance documentation.

---

## MED-09: Update `proxy.conf.json` to Default to Localhost

**Description**
The development proxy configuration points to an external Azure container instance (`https://diabos-masters.centralus.azurecontainer.io:8253`) instead of the local backend. Developers working with a local backend must manually edit this file every time.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy/src/proxy.conf.json` | Change target to `http://localhost:3000` |

**Estimated Effort**: 15 minutes
**Risk Level**: Low

**Implementation Steps**

1. Change the `target` in `proxy.conf.json` from `https://diabos-masters.centralus.azurecontainer.io:8253` to `http://localhost:3000`.
2. Add a comment explaining how to override for remote backend development.
3. Document the change in the developer setup guide.

---

## MED-10: Add Infrastructure as Code (Terraform)

**Description**
All infrastructure (EC2, security groups, VPC, Docker Compose) is manually provisioned. There is no way to reproduce the environment, audit changes, or spin up new instances consistently.

**Files Affected**

| File | Change |
|------|--------|
| `infra/main.tf` | New — EC2, VPC, security groups, ALB |
| `infra/variables.tf` | New — configurable parameters |
| `infra/outputs.tf` | New — EC2 IP, ALB DNS, etc. |

**Estimated Effort**: 5–7 days
**Risk Level**: Medium (Terraform state management required; must not accidentally destroy existing infrastructure)

**Implementation Steps**

1. Install Terraform and configure AWS provider credentials.
2. Import existing resources (`terraform import`) for the EC2 instance, security group, and VPC.
3. Define the infrastructure as code:
   - VPC with public/private subnets
   - Security groups (HTTP/HTTPS, SSH, internal MongoDB)
   - EC2 instance with user data script
   - ALB with ACM certificate (see CRIT-05)
   - S3 bucket for Terraform state (remote backend)
4. Add a `terraform plan` step to the CI pipeline (PR only — do not auto-apply).
5. Document the Terraform workflow in `docs/DEPLOYMENT_GUIDE.md`.

---

# 4. SaaS Enhancements (P3)

These tasks transform the platform from a multi-tenant application into a monetizable SaaS product. They should be prioritized after P0 and P1 items are resolved.

---

## SAAS-01: Implement Subscription Management System

**Description**
The platform has no subscription or billing system. Organizations can be created via `agentOnBoarding` and have a trial period, but there is no paid tier, no plan management, and no way to enforce usage limits after the trial ends.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/schema/schema.js` | Add `plan`, `subscription`, `billingevent` schemas |
| `shipeasy-api/controller/subscription.controller.js` | New — plan CRUD, subscription lifecycle |
| `shipeasy-api/services/subscription.service.js` | New — plan enforcement, usage checks |
| `shipeasy-api/middleware/tenantIsolation.js` | Add subscription status check |
| `shipeasy-api/router/route.js` | Add subscription management routes |

**Estimated Effort**: 2–3 weeks
**Risk Level**: Medium

**Implementation Steps**

1. Design the data model:
   - `plan`: `planId`, `name`, `maxUsers`, `maxShipments`, `maxStorage`, `features[]`, `price`, `billingCycle`
   - `subscription`: `subscriptionId`, `orgId`, `planId`, `status`, `startDate`, `endDate`, `paymentMethod`
   - `billingevent`: `eventId`, `orgId`, `type`, `amount`, `timestamp`
2. Create seed data for three plans: Starter, Professional, Enterprise.
3. Implement the subscription controller with endpoints: create, upgrade, downgrade, cancel.
4. Add a middleware check in `enforceTenantIsolation` that verifies the organization's subscription is active.
5. Return 402 (Payment Required) for requests from organizations with expired subscriptions.
6. Add a cron job to send subscription renewal reminders and handle expired subscriptions.
7. Build admin UI for plan management (SuperAdmin only).

---

## SAAS-02: Integrate Payment Gateway (Stripe or Razorpay)

**Description**
There is no payment gateway integration. Organizations cannot pay for their subscriptions programmatically. This is a prerequisite for self-service SaaS monetization.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/controller/payment-gateway.controller.js` | New — Stripe/Razorpay integration |
| `shipeasy-api/services/billing.service.js` | New — invoice generation, payment processing |
| `shipeasy-api/router/route.js` | Add payment routes |
| `shipeasy/src/app/admin/billing/` | New — billing UI module |
| `shipeasy-api/package.json` | Add `stripe` or `razorpay` SDK |

**Estimated Effort**: 2–3 weeks
**Risk Level**: Medium (payment handling requires PCI compliance awareness)

**Implementation Steps**

1. Choose gateway: Stripe (global) or Razorpay (India-focused). Consider supporting both.
2. Install the SDK: `npm install stripe` or `npm install razorpay`.
3. Implement:
   - Checkout session creation (redirect to hosted payment page)
   - Webhook handler for payment events (success, failure, refund)
   - Subscription renewal automation
   - Invoice generation (PDF via Jasper or ExcelJS)
4. Add webhook signature verification (similar to CRIT-10).
5. Build frontend billing module with: plan selection, payment history, invoice download, card management.
6. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` to `.env.example` and variable group.
7. Test with sandbox/test mode before going live.

---

## SAAS-03: Add Usage Metering and Plan Enforcement

**Description**
There are no usage limits enforced per organization. An organization on a Starter plan can create unlimited shipments, users, and storage. Plan-based limits must be tracked and enforced at the API level.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/schema/schema.js` | Add `usagemetric` schema |
| `shipeasy-api/middleware/tenantIsolation.js` | Add usage limit enforcement |
| `shipeasy-api/services/metering.service.js` | New — usage tracking and limit checking |
| `shipeasy-api/service/schedulers.js` | Add daily usage aggregation cron |

**Estimated Effort**: 1–2 weeks
**Risk Level**: Medium (must not break existing organizations during rollout; use soft limits initially)

**Implementation Steps**

1. Define metered dimensions: active users, shipments per month, storage (bytes), API calls per day.
2. Create `usagemetric` schema: `orgId`, `dimension`, `period`, `count`, `limit`.
3. Implement `metering.service.js` with:
   - `increment(orgId, dimension)` — called on each create/upload operation
   - `checkLimit(orgId, dimension)` — returns true if under limit
4. Add a middleware or helper that checks limits before insert operations:
   - If `indexName === 'batch'`, check shipment limit.
   - If `indexName === 'user'`, check user limit.
   - On file upload, check storage limit.
5. Return 429 with a descriptive message when a limit is exceeded.
6. Add a daily cron job to aggregate usage and reset monthly counters.
7. Build a usage dashboard in the frontend showing current usage vs. plan limits.

---

## SAAS-04: Build Platform Admin Dashboard

**Description**
SuperAdmin users currently manage tenants via the same UI as regular users, with no platform-wide visibility. A dedicated admin dashboard is needed for tenant management, usage monitoring, subscription oversight, and system health.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy/src/app/admin/platform-admin/` | New — platform admin module |
| `shipeasy-api/controller/platform-admin.controller.js` | New — admin-only endpoints |
| `shipeasy-api/router/route.js` | Add admin routes with `requireRole('superAdmin')` |

**Estimated Effort**: 2–3 weeks
**Risk Level**: Low

**Implementation Steps**

1. Create a new lazy-loaded Angular module at `/home/platform-admin`.
2. Protect the route with `AuthGuard` and the API with `requireRole('superAdmin')`.
3. Build dashboard pages:
   - **Tenant List**: All organizations with subscription status, user count, creation date.
   - **Tenant Detail**: Edit org settings, manage subscription, view usage.
   - **System Health**: API error rates, response times (from APM), cron job status.
   - **Subscription Overview**: Revenue, plan distribution, trial conversions.
   - **User Management**: Cross-org user search, disable accounts.
4. Create corresponding backend endpoints that aggregate data across all organizations (SuperAdmin bypasses tenant isolation).
5. Add audit logging for all admin actions.

---

## SAAS-05: Add Tenant-Level Rate Limiting

**Description**
The current rate limiting is per-IP only. In a SaaS model, limits should also be per-organization (tenant), tied to the subscription plan. A Starter plan organization should have lower API quotas than an Enterprise plan.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/middleware/security.js` | Add tenant-level rate limiter |
| `shipeasy-api/middleware/tenantIsolation.js` | Expose plan limits to downstream middleware |

**Estimated Effort**: 1–2 days
**Risk Level**: Low

**Implementation Steps**

1. After `enforceTenantIsolation` runs (orgId and plan are known), apply a per-org rate limiter.
2. Use `express-rate-limit` with a custom `keyGenerator` that uses `req.orgId`:
   ```javascript
   keyGenerator: (req) => req.orgId || req.ip
   ```
3. Set the `max` based on the organization's plan:
   - Starter: 500 req/15min
   - Professional: 2000 req/15min
   - Enterprise: 10000 req/15min
4. Store the rate limit configuration in the `plan` schema.
5. Use a Redis store for the rate limiter (required for multi-instance deployments).
6. Return plan-specific error messages: "API rate limit exceeded for your plan. Upgrade to increase limits."

---

## SAAS-06: Implement Feature Flag Admin UI and Runtime Toggles

**Description**
The `feature` schema and `requireFeature()` middleware exist but there is no admin interface to manage feature flags, no runtime toggle (requires database edits), no plan-to-feature mapping, and no usage tracking.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy/src/app/admin/configuration/` | Add feature flag management page |
| `shipeasy-api/schema/schema.js` | Enhance `feature` schema with plan mapping |
| `shipeasy-api/services/feature-flag.service.js` | New — feature flag evaluation with caching |

**Estimated Effort**: 1–2 weeks
**Risk Level**: Low

**Implementation Steps**

1. Enhance the `feature` schema to include: `planId` (which plans include this feature), `isGlobal` (available to all), `rolloutPercentage`.
2. Create a `feature-flag.service.js` that:
   - Loads all features for an org on first request and caches in Redis (TTL: 5 min).
   - Evaluates whether a feature is enabled based on plan + org-level overrides.
   - Supports percentage-based rollout for A/B testing.
3. Update `requireFeature()` middleware to use the service instead of querying the database directly.
4. Build an admin UI page under Configuration:
   - List all features with toggle switches.
   - Assign features to plans.
   - Override per-org (enable a feature for a specific org regardless of plan).
5. Add a feature usage counter (increment on each `requireFeature()` pass) for analytics.

---

## SAAS-07: Add Data Export and GDPR Portability

**Description**
There is no way for an organization to export all their data from the platform. GDPR Article 20 requires data portability — users must be able to download their data in a machine-readable format.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy-api/controller/data-export.controller.js` | New — data export endpoint |
| `shipeasy-api/services/data-export.service.js` | New — aggregate and package org data |
| `shipeasy-api/router/route.js` | Add export route |

**Estimated Effort**: 1–2 weeks
**Risk Level**: Low

**Implementation Steps**

1. Create a `POST /api/v1/org/export` endpoint (admin role required).
2. The service queries all collections filtered by `orgId` and produces a ZIP file containing:
   - One JSON file per collection (enquiries.json, quotations.json, etc.)
   - All documents from Azure Blob Storage associated with the org.
   - Metadata file with export date, org info, schema version.
3. Upload the ZIP to Azure Blob Storage and return a time-limited download URL (SAS token, 24h expiry).
4. Add a rate limit (1 export per org per 24 hours) to prevent abuse.
5. Add audit logging for the export event.
6. Add a "Delete my organization" endpoint for GDPR right-to-erasure (soft delete first, hard delete after 30 days).

---

## SAAS-08: Add Organization Onboarding Wizard

**Description**
The current agent onboarding (`/api/agentOnBoarding`) creates a bare organization with no guided setup. New users must figure out configuration, master data, and feature setup on their own. A guided wizard would reduce time-to-value and improve trial conversion.

**Files Affected**

| File | Change |
|------|--------|
| `shipeasy/src/app/admin/onboarding/` | New — onboarding wizard module |
| `shipeasy-api/schema/schema.js` | Add `onboardingprogress` schema |
| `shipeasy-api/controller/onboarding.controller.js` | New — onboarding state management |

**Estimated Effort**: 2–3 weeks
**Risk Level**: Low

**Implementation Steps**

1. Design the onboarding flow:
   - Step 1: Company profile (name, logo, address, GST number).
   - Step 2: Branch setup (create at least one branch).
   - Step 3: User invites (invite team members with roles).
   - Step 4: Master data (import ports, shipping lines, or use defaults).
   - Step 5: Configuration (email templates, notification preferences).
   - Step 6: First enquiry (guided walkthrough of creating an enquiry).
2. Create `onboardingprogress` schema: `orgId`, `currentStep`, `completedSteps[]`, `isComplete`.
3. Build the wizard as a new Angular module with `angular-archwizard` (already in dependencies).
4. Show the wizard on first login after registration; allow dismissing and resuming later.
5. Track completion rates for product analytics.
6. Add a "Setup Checklist" widget on the dashboard for incomplete onboarding.

---

# Appendix: Task Summary by Sprint

## Sprint 1 (Week 1–2): Security Hardening

| ID | Task | Effort |
|----|------|--------|
| CRIT-01 | Remove hardcoded secrets from frontend | 1d |
| CRIT-03 | Fix plain-text password storage | 2d |
| CRIT-04 | Lock down CORS default | 0.5d |
| CRIT-07 | Move WhatsApp verify token to env | 0.5d |
| CRIT-09 | Validate or remove x-api-key | 1d |
| CRIT-10 | Add OceanIO webhook auth | 1d |
| HIGH-11 | Remove dead code | 0.5d |
| HIGH-12 | Remove hardcoded test credentials | 0.5d |
| MED-09 | Fix proxy.conf.json | 0.25d |
| **Total** | | **~7 days** |

## Sprint 2 (Week 3–4): Access Control & Testing

| ID | Task | Effort |
|----|------|--------|
| CRIT-02 | Enforce RBAC on routes | 3d |
| CRIT-08 | Secure unauthenticated endpoints | 2d |
| HIGH-05 | Add security middleware tests | 5d |
| **Total** | | **~10 days** |

## Sprint 3 (Week 5–8): Architecture Refactoring

| ID | Task | Effort |
|----|------|--------|
| HIGH-01 | Split route.js | 5d |
| HIGH-02 | Split schema.js | 5d |
| HIGH-04 | Consolidate duplicates | 2d |
| HIGH-07 | Fix eager module imports | 0.5d |
| MED-06 | Add backend ESLint | 3d |
| **Total** | | **~15 days** |

## Sprint 4 (Week 9–12): Infrastructure & CI

| ID | Task | Effort |
|----|------|--------|
| CRIT-05 | Add TLS | 3d |
| CRIT-06 | Fix frontend tests, remove continueOnError | 5d |
| HIGH-08 | Migrate MongoDB to managed service | 5d |
| HIGH-09 | Add staging environment | 5d |
| HIGH-10 | Add pipeline caching | 0.5d |
| **Total** | | **~18 days** |

## Quarter 2: Performance & Modernization

| ID | Task | Effort |
|----|------|--------|
| HIGH-03 | Extract service layer | 15d |
| HIGH-06 | Named endpoint tests | 7d |
| MED-01 | Date field migration | 7d |
| MED-02 | Server-side pagination | 2d |
| MED-03 | Cron job locking | 1d |
| MED-04 | Split SharedModule | 5d |
| MED-07 | API versioning | 2d |
| MED-08 | Centralized logging | 5d |

## Quarter 3: SaaS Product

| ID | Task | Effort |
|----|------|--------|
| SAAS-01 | Subscription management | 15d |
| SAAS-02 | Payment gateway | 15d |
| SAAS-03 | Usage metering | 10d |
| SAAS-04 | Platform admin dashboard | 15d |
| SAAS-05 | Tenant-level rate limiting | 2d |
| SAAS-06 | Feature flag admin UI | 10d |
| SAAS-07 | Data export / GDPR | 10d |
| SAAS-08 | Onboarding wizard | 15d |

---

*Backlog derived from the Multi-Agent SDLC Analysis Report. Each task is traceable to specific agent findings and references real files in the repository.*
