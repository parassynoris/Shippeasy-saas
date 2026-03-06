# Shippeasy SaaS — Comprehensive Engineering Audit Report

**Date:** June 2025
**Auditor:** Engineering Review Team
**Version:** 1.0
**Scope:** Full-stack codebase audit covering security, performance, architecture, and SaaS readiness

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Breakdown](#2-architecture-breakdown)
3. [Feature Map](#3-feature-map)
4. [API Inventory](#4-api-inventory)
5. [Code Quality Report](#5-code-quality-report)
6. [Security Audit](#6-security-audit)
7. [Performance Report](#7-performance-report)
8. [Test Plan](#8-test-plan)
9. [SaaS Readiness Report](#9-saas-readiness-report)
10. [DevOps Improvements](#10-devops-improvements)
11. [Refactoring Plan](#11-refactoring-plan)
12. [Production Hardening Checklist](#12-production-hardening-checklist)

---

## 1. Project Overview

### Summary

Shippeasy SaaS is a full-stack logistics and shipping management platform built as a monorepo. The platform enables freight forwarders, shipping agents, and logistics companies to manage quotations, jobs, EDI processing, e-invoicing, load planning, and real-time collaboration through a unified web interface.

### Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Angular SPA | 13.3.11 |
| **UI Libraries** | Angular Material, NG-Zorro, Bootstrap | 13.3.9 / 13.x / 5.1.3 |
| **Backend** | Node.js + Express | Node 22 / Express 4.18.2 |
| **Database** | MongoDB with Mongoose ODM | MongoDB 6 / Mongoose 8.0.3 |
| **Real-time** | Socket.io | 4.7.4 |
| **Queue** | BullMQ with Redis | BullMQ via worker processes |
| **Authentication** | JWT, Google OAuth, AWS Cognito, Azure MSAL | jsonwebtoken 9.0.2 |
| **Cloud Storage** | Azure Blob Storage | @azure/storage-blob |
| **Monitoring** | Elastic APM (Node + RUM Angular) | elastic-apm-node / @elastic/apm-rum-angular |
| **Logging** | Winston + Pino | Custom logger service |
| **AI Services** | OpenAI, Google Gemini | openai / @google/generative-ai |
| **CI/CD** | Azure Pipelines → ACR → AWS EC2 | YAML multi-stage pipeline |
| **Containerization** | Docker Compose | 3 services (mongo, backend, frontend) |

### Repository Structure

```
Shippeasy-saas/
├── shipeasy/                  # Angular 13 frontend (served by nginx)
├── shipeasy-api/              # Node.js Express backend
├── docs/                      # Documentation and compliance artifacts
├── docker-compose.yml         # Production container orchestration
├── docker-compose.dev.yml     # Development overrides with hot-reload
├── azure-pipelines.yml        # CI/CD pipeline definition
├── deploy.sh                  # Production deployment script
├── .env.example               # Environment variables template
└── README.md                  # Project documentation
```

### External Integrations

The platform integrates with a variety of third-party services to deliver end-to-end logistics functionality:

| Integration | Purpose |
|---|---|
| **Freightos** | Freight rate lookup and comparison |
| **OceanIO** | Ocean freight tracking via webhooks |
| **ULIP** | Unified Logistics Interface Platform (India) |
| **WhatsApp Business** | Customer notifications and messaging |
| **Jasper Reports** | PDF report generation |
| **SendInBlue (Brevo)** | Transactional and batch email delivery |
| **Tally** | Accounting and financial entry export |
| **Zircon** | E-Invoicing compliance (GST India) |
| **Mapbox** | Map visualization and geocoding |
| **Bold BI** | Embedded analytics and reporting |
| **Firebase** | Push notifications |

---

## 2. Architecture Breakdown

### High-Level Architecture

Shippeasy follows a classic three-tier web architecture deployed as Docker containers on AWS EC2 infrastructure. The frontend is a single-page application that communicates with the backend REST API over HTTP and WebSocket connections.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│              Angular 13 SPA + Socket.io Client           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP / WebSocket
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Nginx (Port 80)                          │
│            Static file serving + SPA routing             │
│            try_files $uri /index.html                    │
│            Gzip compression (level 6)                    │
└────────────────────┬────────────────────────────────────┘
                     │ Reverse Proxy (/api/)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Express API (Port 3000)                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Routers │→│Middleware │→│Controllers│→│  Services   │  │
│  └─────────┘ └──────────┘ └──────────┘ └────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │Socket.io │ │ BullMQ   │ │Elastic APM│                │
│  └──────────┘ └──────────┘ └──────────┘                │
└────────┬──────────────┬──────────────┬──────────────────┘
         │              │              │
         ▼              ▼              ▼
┌──────────────┐ ┌───────────┐ ┌──────────────────┐
│ MongoDB 6    │ │   Redis   │ │ Azure Blob       │
│ (Port 27017) │ │  (Queue)  │ │ Storage          │
└──────────────┘ └───────────┘ └──────────────────┘
```

### Frontend Architecture

The Angular 13 frontend is a large SPA with 200+ components organized into feature modules:

```
shipeasy/src/app/
├── admin/                # Admin panel (user management, configuration)
├── auth/                 # Login, registration, SSO flows
├── self-dashboard/       # Self-service dashboard for agents
├── release-manager/      # Release and version management
├── ticketadmin/          # Support ticket administration
├── layout/               # App shell, headers, footers, navigation
├── Guard/                # Route guards (auth, role-based)
├── models/               # TypeScript interfaces and data models
├── shared/               # Shared components, directives, pipes
│   └── services/         # Common, shared, and event bus services
├── services/             # App-level services
└── side-sticky-menu/     # Global navigation component
```

**Key Frontend Patterns:**
- Lazy-loaded feature modules for code splitting
- Angular Material + NG-Zorro for UI components
- Bootstrap 5 for responsive grid and utilities
- CKEditor 5 for rich text editing
- Mapbox GL for geospatial visualization
- Socket.io client for real-time updates
- Azure MSAL for Azure AD SSO integration
- Elastic APM RUM for frontend performance monitoring

**Build and Deployment:**
The frontend uses a multi-stage Docker build. Stage 1 compiles the Angular app with `yarn stat-build` on Node 20-alpine. Stage 2 copies the dist output to nginx stable-alpine and serves it on port 80. Build-time arguments (ENVIRONMENT, API_URL, SOCKET_URL) are injected for environment-specific configuration.

### Backend Architecture

The Express 4 backend follows an MVC-inspired pattern with controllers, services, middleware, and Mongoose schemas:

```
shipeasy-api/
├── index.js              # Application entry point and server bootstrap
├── controller/           # 24 controller files (route handlers)
│   ├── auth.controller.js
│   ├── insert.commonController.js
│   ├── update.commonController.js
│   ├── delete.commonController.js
│   ├── search.controller.js
│   ├── azureStorageContoller.js
│   ├── edi.controller.js
│   ├── eInvoicing.controller.js
│   ├── loadPlan.controller.js
│   ├── tally.controller.js
│   ├── email.controller.js
│   ├── webhooks.controller.js
│   ├── whatsapp.controller.js
│   ├── creditReport.controller.js
│   ├── dashboard.controller.js
│   ├── jasperController.js
│   ├── qr.controller.js
│   ├── reports.controller.js
│   ├── helper.controller.js
│   ├── non-auth.controller.js
│   ├── storage.controller.js
│   ├── emailReplyScheduler.js
│   └── automations/
│       └── jobautomation.controller.js
├── router/
│   └── route.js          # Centralized route definitions
├── schema/
│   ├── schema.js          # Dynamic schema registry (20+ collections)
│   └── invoiceSchema.js   # Invoice-specific schema
├── middleware/
│   ├── auth.js            # JWT verification middleware
│   ├── checkIndex.js      # Collection name validation
│   └── requestTracer.js   # Request logging and tracing
├── service/
│   ├── mongooseConnection.js  # Database connection management
│   ├── socketHelper.js        # Socket.io event handling
│   ├── queue.js               # BullMQ job queue
│   ├── logger.js              # Winston logging configuration
│   ├── requestContext.js      # Async local storage context
│   ├── schedulers.js          # Cron job scheduling
│   ├── inAppNotification.js   # In-app notification service
│   └── messageHelper.js       # Message formatting utilities
├── services/
│   ├── notification.service.js  # Notification dispatch
│   └── trigger.service.js       # Event trigger handling
├── worker/
│   ├── cron.worker.js     # Background cron jobs
│   └── email.js           # Email processing worker
├── utils/
│   ├── fyHelper.js        # Financial year utilities
│   └── logger.js          # Additional logging utilities
└── tests/
    └── retrieval.test.js  # Integration test suite
```

### Database Architecture

MongoDB is used with Mongoose 8 as the ODM layer. The `schema/schema.js` file implements a **dynamic schema registry** pattern where collection names are mapped to Mongoose models at runtime. This enables the generic CRUD controllers to operate on any registered collection.

**Key Collections:**

| Collection | Purpose |
|---|---|
| `users` | User accounts and authentication data |
| `agents` | Shipping agent profiles and onboarding |
| `quotations` | Freight quotations and pricing |
| `jobs` | Shipping job lifecycle management |
| `roles` | Role-based access control definitions |
| `emailtemplates` | Configurable email templates |
| `auditlog` | System audit trail |
| `filelog` | File upload and download tracking |
| `messages` | Chat and notification messages |
| `automations` | Workflow automation configurations |
| `exchangerates` | Currency exchange rate cache |
| `einvoice` | E-invoicing records |
| `creditreports` | Credit assessment reports |

### Infrastructure

**Docker Compose (Production)** defines three services on a shared bridge network (`shipeasy_net`):

1. **mongo** — MongoDB 6 with health check and persistent volume (`mongo_data`)
2. **backend** — Express API on port 3000, depends on mongo
3. **frontend** — Nginx serving Angular SPA on port 80

**Docker Compose (Development)** extends the production configuration with:
- Source code volume mounts for hot-reload
- Nodemon for backend auto-restart
- Angular dev server on port 4200
- Exposed MongoDB port for local tooling

---

## 3. Feature Map

### Core Features

| Feature | Module | Description |
|---|---|---|
| **Authentication** | `auth/`, `auth.controller.js` | Multi-provider auth: JWT login, Google OAuth, AWS Cognito, Azure AD SSO via MSAL. Trial period management with automatic expiry enforcement. |
| **Admin Panel** | `admin/` | User management, role configuration, system settings, organization management, and tenant administration. |
| **Self-service Dashboard** | `self-dashboard/` | Agent-facing dashboard for managing quotations, jobs, shipments, and operational metrics. |
| **Release Manager** | `release-manager/` | Application version tracking and release note management. |
| **Ticket Admin** | `ticketadmin/` | Internal support ticket system for issue tracking and resolution. |

### Logistics Features

| Feature | Controller | Description |
|---|---|---|
| **EDI Processing** | `edi.controller.js`, `ediController.js` | Electronic Data Interchange message generation for shipping manifests (EGM, IGM formats). |
| **E-Invoicing** | `eInvoicing.controller.js` | Zircon integration for GST-compliant e-invoicing in India. Push invoices for IRN generation. |
| **Load Planning** | `loadPlan.controller.js` | Container load optimization and planning algorithms. |
| **Tally Integration** | `tally.controller.js` | Export financial entries to Tally accounting software in XML format. |
| **Credit Reports** | `creditReport.controller.js` | Agent credit assessment and reporting. |
| **Freight Rates** | `helper.controller.js` | Freightos API integration for real-time freight rate lookup and comparison. |
| **Quotation Management** | Generic CRUD + custom logic | Create, manage, and track freight quotations with rate calculations. |

### Communication Features

| Feature | Implementation | Description |
|---|---|---|
| **Real-time Chat** | `socketHelper.js` + Socket.io | WebSocket-based real-time messaging between platform users. |
| **In-app Notifications** | `inAppNotification.js` | Push notifications within the application interface. |
| **Email (Outbound)** | `email.controller.js` | SendInBlue/Brevo integration for transactional and batch email. |
| **Email (Inbound)** | `emailReplyScheduler.js` | IMAP-based email reply monitoring and processing. |
| **WhatsApp Business** | `whatsapp.controller.js` | WhatsApp Business API for customer notifications and webhook handling. |

### Operational Features

| Feature | Implementation | Description |
|---|---|---|
| **QR Code Generation** | `qr.controller.js` | Generate QR codes for shipment tracking and document linking. |
| **Jasper Reports** | `jasperController.js` | PDF report generation via Jasper Reports server integration. |
| **Global Search** | `search.controller.js` | Unified search across multiple collections with aggregation. |
| **Exchange Rates** | `helper.controller.js` | Currency conversion via FreeCurrencyAPI integration. |
| **File Storage** | `azureStorageContoller.js` | Azure Blob Storage for document upload, download, and management. |
| **Automations** | `jobautomation.controller.js` | Configurable workflow automations triggered by job lifecycle events. |
| **Webhooks** | `webhooks.controller.js` | OceanIO tracking webhooks for real-time shipment status updates. |
| **AI Scanning** | OpenAI + Gemini integration | AI-powered document scanning and data extraction from shipping documents. |

---

## 4. API Inventory

### Authentication Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/user/login` | None | JWT authentication with email/password |
| `POST` | `/api/user/reset` | None | Password reset via email |
| `POST` | `/api/user/change-password` | JWT | Authenticated password change |
| `POST` | `/api/auth` | JWT | Retrieve user roles and permissions |
| `POST` | `/api/agentOnBoarding` | None | New agent self-registration (public endpoint) |

### Generic CRUD Endpoints

These endpoints use a dynamic `:indexName` parameter to operate on any registered Mongoose collection. The `checkIndex` middleware validates the collection name against the schema registry.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/:indexName` | JWT | Insert a new document into the specified collection |
| `POST` | `/api/:indexName/batchinsert` | JWT | Batch insert multiple documents |
| `PUT` | `/api/:indexName/:id` | JWT | Update a single document by ID |
| `PUT` | `/api/:indexName/batchupdate` | JWT | Batch update multiple documents |
| `DELETE` | `/api/:indexName/:id` | JWT | Delete a document by ID |
| `POST` | `/api/search/:indexName/:id` | JWT | Retrieve a document by ID with optional population |

### Business Logic Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/findRate` | JWT | Freightos freight rate lookup |
| `POST` | `/api/quotationRate` | JWT | Quotation rate calculation |
| `POST` | `/api/globalSearch` | JWT | Unified search across collections |
| `POST` | `/api/exchangeRate` | JWT | Currency conversion rates |
| `POST` | `/api/generateTALLYEntry` | JWT | Generate and export Tally accounting entries |
| `POST` | `/api/edi/:ediName/:documentId` | JWT | EDI document generation |
| `POST` | `/api/sendBatchEmail` | JWT | Batch email dispatch via SendInBlue |
| `POST` | `/api/report/:reportName` | JWT | Jasper report generation |
| `GET` | `/api/sent-to-einvoicing/:invoiceId` | JWT | Push invoice to Zircon e-invoicing |
| `POST` | `/api/load-plan` | JWT | Container load planning calculation |

### File Operations

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/uploadfile` | JWT | Upload file to Azure Blob Storage |
| `POST` | `/api/downloadfile/:fileName` | JWT | Download file from Azure Blob Storage |

### Webhook Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/oceanIOWebhook` | None | OceanIO shipment tracking webhook receiver |
| `GET` | `/webhook` | None | WhatsApp webhook verification (challenge-response) |
| `POST` | `/webhook` | None | WhatsApp incoming message webhook |

### Infrastructure Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Health check endpoint (returns 200 OK) |
| `GET` | `/version` | None | Application version information |
| `GET` | `/api-docs` | None | Swagger UI API documentation |

---

## 5. Code Quality Report

### Overall Score: 4/10

The codebase demonstrates a functional product with a wide feature set, but suffers from significant code quality issues that impact maintainability, security, and scalability.

### Issues Identified and Fixed

| Issue | Severity | Status | Details |
|---|---|---|---|
| **Hardcoded encryption key fallback** | Critical | ✅ FIXED | `requestTracer.js` contained a hardcoded AES encryption key used as a fallback when the environment variable was not set. The fallback has been removed; the application now requires the `ENCRYPTION_KEY` environment variable. |
| **Plaintext password storage** | Critical | ✅ FIXED | `auth.controller.js` stored and compared passwords in plaintext. Migrated to bcrypt hashing with a backward-compatible migration path that rehashes plaintext passwords on successful login. |
| **CORS wildcard configuration** | High | ✅ FIXED | Both `index.js` (Express CORS) and `socketHelper.js` (Socket.io CORS) used `origin: '*'`, allowing any domain to make authenticated requests. Changed to configurable `ALLOWED_ORIGINS` environment variable. |
| **Hardcoded test credentials** | High | ✅ FIXED | `retrieval.test.js` contained hardcoded email/password pairs. Migrated to environment variable references (`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`). |
| **Hardcoded credentials in frontend** | High | ✅ FIXED | Five environment files (`environment.ts`, `environment.prod.ts`, `environment.dev.ts`, `environment.demo.ts`, `environment.indianproduction.ts`) contained AWS access keys, Cognito pool IDs, Azure client IDs, and Mapbox tokens. Replaced with `process.env` references for build-time injection. |
| **No global error handler** | Medium | ✅ FIXED | Express app lacked a centralized error handling middleware. Unhandled errors would crash the process or leak stack traces. Added error middleware that logs errors and returns sanitized responses. |
| **Test dependencies in production** | Low | ✅ FIXED | `jest`, `supertest`, `faker`, and `nyc` were listed in `dependencies` instead of `devDependencies`. Moved to correct section to reduce production image size. |
| **Sensitive data in request logs** | Medium | ✅ FIXED | `requestTracer.js` logged full request bodies including passwords, tokens, and API keys. Added field redaction for sensitive fields (`password`, `token`, `apiKey`, `secret`, `authorization`). |
| **Duplicate deployment script** | Low | ✅ FIXED | Repository contained a duplicate `deploy.sh` variant. Removed the duplicate to prevent confusion. |

### Remaining Issues (Not Fixed in This PR)

| Issue | Severity | Description |
|---|---|---|
| **Generic CRUD with dynamic schema lookup** | High | The `:indexName` parameter allows clients to specify which MongoDB collection to operate on. While `checkIndex` middleware validates the name, the pattern enables mass assignment risks where clients can write arbitrary fields to any collection. **Mitigated** by tenant isolation middleware that enforces orgId scoping. |
| ~~**N+1 queries in role fetching**~~ | ~~Medium~~ | ~~✅ FIXED — Replaced sequential loop with `$in` query for bulk role fetching.~~ |
| ~~**No input validation middleware**~~ | ~~High~~ | ~~✅ FIXED — Added express-validator for auth endpoints (login, reset, change-password, onboarding).~~ |
| ~~**No rate limiting**~~ | ~~High~~ | ~~✅ FIXED — Added express-rate-limit: 100 req/15min general, 10 req/15min for auth endpoints.~~ |
| **Large function sizes** | Medium | Several controller functions exceed 200 lines, mixing business logic, data access, and response formatting. |
| **Dead code and commented-out blocks** | Low | Multiple files contain commented-out code blocks, unused imports, and dead code paths that obscure the active codebase. |
| **Inconsistent error handling** | Medium | Mix of `.catch()` chains, `try/catch` blocks, unhandled promise rejections, and callback-style error handling across controllers. |
| **No TypeScript on backend** | Medium | The backend is entirely JavaScript with no type checking, increasing the risk of runtime type errors and reducing IDE support. |

---

## 6. Security Audit

### Risk Level: HIGH (reduced from CRITICAL after fixes)

The security audit identified several critical vulnerabilities that have been addressed, along with remaining risks that require ongoing remediation.

### Fixed Vulnerabilities

#### 6.1 Hardcoded Encryption Key (CRITICAL → FIXED)
**File:** `middleware/requestTracer.js`
**Issue:** A hardcoded AES-256 encryption key was used as a fallback when the `ENCRYPTION_KEY` environment variable was absent. This meant that in any deployment where the environment variable was not configured, all encrypted data used a publicly visible key.
**Fix:** Removed the hardcoded fallback. The application now throws a startup error if `ENCRYPTION_KEY` is not set, ensuring encryption keys are always externally managed.

#### 6.2 Plaintext Password Storage (CRITICAL → FIXED)
**File:** `controller/auth.controller.js`
**Issue:** User passwords were stored in MongoDB as plaintext strings and compared using direct string equality (`===`). This meant a database breach would expose all user credentials.
**Fix:** Implemented bcrypt hashing (cost factor 12) for all new passwords. Added a backward-compatible migration that detects plaintext passwords on login, verifies them, and transparently rehashes them with bcrypt.

#### 6.3 CORS Wildcard Configuration (HIGH → FIXED)
**Files:** `index.js`, `service/socketHelper.js`
**Issue:** Both the Express CORS middleware and Socket.io server were configured with `origin: '*'`, allowing any website to make authenticated cross-origin requests. Combined with cookie or token-based auth, this enabled cross-site request attacks.
**Fix:** Replaced wildcard with a configurable `ALLOWED_ORIGINS` environment variable that accepts a comma-separated list of allowed domains.

#### 6.4 Hardcoded Credentials in Source Code (HIGH → FIXED)
**Files:** 5 environment files in `shipeasy/src/environments/`, `auth.service.ts`, constants files
**Issue:** AWS access keys, secret keys, Cognito pool IDs, Azure AD client IDs, Mapbox tokens, and Firebase credentials were committed to source control in plaintext.
**Fix:** Replaced all hardcoded values with build-time environment variable injection using `process.env` references and Docker build arguments.

#### 6.5 Hardcoded Test Credentials (HIGH → FIXED)
**File:** `tests/retrieval.test.js`
**Issue:** Test files contained real user credentials (email and password) in plaintext.
**Fix:** Replaced with environment variable references (`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`) loaded from the test environment.

#### 6.6 Timing Attack on Token Comparison (MEDIUM → FIXED)
**File:** `router/route.js`
**Issue:** WordPress integration token was compared using `===`, which is vulnerable to timing attacks that can progressively reveal the token value.
**Fix:** Replaced with `crypto.timingSafeEqual()` for constant-time comparison.

#### 6.7 Sensitive Data in Request Logs (MEDIUM → FIXED)
**File:** `middleware/requestTracer.js`
**Issue:** Request bodies were logged in full, including passwords, tokens, and API keys. Log aggregation systems would store these sensitive values in plaintext.
**Fix:** Added a field redaction function that replaces sensitive field values with `[REDACTED]` before logging.

### Remaining Security Risks

| Risk | Severity | Description | Recommendation |
|---|---|---|---|
| ~~**No rate limiting on auth endpoints**~~ | ~~High~~ | ~~✅ FIXED — Added `express-rate-limit` with 10 attempts per 15 minutes for auth routes and 100 per 15 minutes for general API.~~ | ~~Implemented.~~ |
| ~~**No helmet.js security headers**~~ | ~~High~~ | ~~✅ FIXED — Added `helmet` middleware to Express app with `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, and other headers.~~ | ~~Implemented.~~ |
| **No CSRF protection** | Medium | No CSRF tokens are generated or validated. While JWT-based auth is inherently less susceptible, cookie-based sessions (if used) would be vulnerable. | Implement CSRF token middleware or ensure all auth is strictly header-based. |
| ~~**No input validation middleware**~~ | ~~High~~ | ~~✅ FIXED — Added `express-validator` validation schemas for login, reset, change-password, and agent onboarding endpoints.~~ | ~~Implemented.~~ |
| **Mass assignment via generic CRUD** | High | The generic `/:indexName` endpoints accept any JSON body and pass it to Mongoose `create()` or `findByIdAndUpdate()`. Clients can inject any field, including administrative flags or role escalations. **Mitigated** by NoSQL injection prevention middleware and tenant isolation. | Implement per-collection field whitelists or replace generic CRUD with collection-specific controllers. |
| **JWT with no refresh token** | Medium | JWT tokens expire in 24 hours with no refresh token mechanism. Users must re-authenticate after expiry, and there is no way to revoke tokens before expiry. | Implement a refresh token flow with short-lived access tokens (15 min) and long-lived refresh tokens. |
| ~~**Unauthenticated webhook endpoints**~~ | ~~Medium~~ | ~~✅ FIXED — Added HMAC-SHA256 signature verification middleware for WhatsApp and OceanIO webhooks. Hardcoded WhatsApp verification token moved to environment variable.~~ | ~~Implemented.~~ |
| ~~**File upload lacks content-type validation**~~ | ~~Medium~~ | ~~✅ FIXED — Added file upload validation middleware with MIME type whitelist, extension blocklist, and size limit enforcement.~~ | ~~Implemented.~~ |
| ~~**APM captures full request bodies**~~ | ~~Low~~ | ~~✅ FIXED — Changed `captureBody` to `errors` in production; reduced `transactionSampleRate` to `0.1`.~~ | ~~Implemented.~~ |

---

## 7. Performance Report

### Overall Score: 5/10

The application functions correctly under moderate load but contains several performance anti-patterns that will cause degradation at scale.

### Identified Performance Issues

#### 7.1 N+1 Query Pattern in Authentication

**File:** `controller/auth.controller.js`
**Impact:** High
**Description:** When fetching user roles after authentication, the controller iterates over the user's role IDs and makes individual MongoDB queries for each role. For a user with 5 roles, this results in 6 database round-trips (1 for the user + 5 for roles) instead of a single query with `$in`.

**Recommendation:**
```javascript
// Current (N+1)
for (const roleId of user.roles) {
  const role = await Role.findById(roleId);
  // ...
}

// Recommended (single query)
const roles = await Role.find({ _id: { $in: user.roles } });
```

#### 7.2 Missing Database Indexes

**Files:** `schema/schema.js`, `schema/invoiceSchema.js`
**Impact:** High
**Description:** Mongoose schemas do not define indexes for commonly queried fields. As collections grow, queries on `orgId`, `createdAt`, `status`, `email`, and other frequently filtered fields will degrade to full collection scans.

**Recommendation:** Add compound indexes for common query patterns:
```javascript
schema.index({ orgId: 1, createdAt: -1 });
schema.index({ orgId: 1, status: 1 });
schema.index({ email: 1 }, { unique: true });
```

#### 7.3 No Pagination Defaults

**Impact:** Medium
**Description:** Many search and list endpoints default to returning up to 1000 results when no pagination parameters are provided. Large result sets consume significant memory and bandwidth.

**Recommendation:** Enforce a maximum page size of 100 and default to 20 results per page. Implement cursor-based pagination for collections exceeding 10,000 documents.

#### 7.4 Excessive Request Body Limit

**File:** `index.js`
**Impact:** Medium
**Description:** The Express body parser is configured with a 50MB limit (`express.json({ limit: '50mb' })`). This allows clients to send extremely large payloads that consume server memory and processing time.

**Recommendation:** Reduce the default limit to 1MB and configure higher limits only on specific file-upload routes that require them.

#### 7.5 100% APM Sampling Rate

**File:** `index.js` (Elastic APM configuration)
**Impact:** Medium
**Description:** `transactionSampleRate` is set to `1.0`, meaning every single request is traced and sent to the APM server. This adds latency to each request and generates enormous volumes of APM data in production.

**Recommendation:** Reduce to `0.1` (10%) or lower in production. Use `1.0` only in development and staging environments.

#### 7.6 No Response Compression

**File:** `index.js`
**Impact:** Medium
**Description:** The Express API does not use `compression` middleware. All JSON responses are sent uncompressed, increasing bandwidth usage and response times, especially for large search results.

**Recommendation:** Add `compression()` middleware to the Express pipeline.

#### 7.7 Full Request/Response Body Logging

**File:** `middleware/requestTracer.js`
**Impact:** Low-Medium
**Description:** Every request and response body is logged in full (after redaction of sensitive fields). For endpoints that handle large payloads (file uploads, batch operations, reports), this generates massive log volumes.

**Recommendation:** Log only request metadata (method, path, status, duration) by default. Enable body logging conditionally via a debug flag.

#### 7.8 No Caching Layer

**Impact:** Medium
**Description:** No caching is implemented for any data. Frequently accessed data like exchange rates, role definitions, configuration settings, and email templates are fetched from MongoDB on every request.

**Recommendation:** Implement Redis-based caching for read-heavy, slowly-changing data with appropriate TTLs.

#### 7.9 Synchronous Password Operations

**File:** `controller/auth.controller.js`
**Impact:** Low
**Description:** While bcrypt operations are CPU-intensive, the implementation uses the async variants correctly. However, the bcrypt cost factor should be tuned based on server hardware to balance security and response time.

**Recommendation:** Benchmark bcrypt cost factor on production hardware. Target ~250ms per hash operation.

### Performance Recommendations Summary

| Priority | Recommendation | Expected Impact | Status |
|---|---|---|---|
| P0 | Fix N+1 queries with `$in` operators | 5x faster auth responses | ✅ FIXED |
| P0 | Add database indexes for common queries | 10-100x faster queries at scale | ✅ FIXED |
| P1 | Enforce pagination limits | Prevent OOM on large collections | ✅ FIXED |
| P1 | Add response compression | 60-80% bandwidth reduction | ✅ FIXED |
| P1 | Reduce APM sample rate | 20-30% latency reduction | ✅ FIXED |
| P1 | Add MongoDB connection pooling | Better connection management | ✅ FIXED |
| P2 | Add Redis caching layer | 90% fewer DB reads for config data | |
| P2 | Reduce body parser limit | Prevent memory exhaustion attacks | ✅ FIXED |
| P2 | Optimize log verbosity | Reduce storage costs | ✅ FIXED |

---

## 8. Test Plan

### Current State

The test suite consists of a single file (`tests/retrieval.test.js`) containing integration tests that verify basic API connectivity and CRUD operations. Tests use Jest as the test runner and Supertest for HTTP assertions.

**Estimated Coverage:** ~15%

The test file validates:
- Server health check endpoint
- Basic document retrieval via the generic search API
- Authentication flow (login with credentials)

### Coverage Gaps

| Area | Current Coverage | Required Coverage |
|---|---|---|
| Authentication flows | ~20% (login only) | 90%+ |
| Generic CRUD operations | ~10% (retrieval only) | 80%+ |
| Business logic controllers | 0% | 70%+ |
| Middleware (auth, checkIndex) | 0% | 90%+ |
| Webhook handlers | 0% | 80%+ |
| File operations | 0% | 70%+ |
| Socket.io events | 0% | 60%+ |
| Error handling paths | 0% | 90%+ |
| Edge cases | 0% | 70%+ |

### Recommended Test Cases

#### Authentication Tests

| Test Case | Type | Priority |
|---|---|---|
| Login with valid credentials returns JWT | Integration | P0 |
| Login with invalid password returns 401 | Integration | P0 |
| Login with non-existent email returns 401 | Integration | P0 |
| Bcrypt migration: plaintext password is rehashed on login | Unit | P0 |
| Trial expired user cannot login | Integration | P0 |
| Token versioning: old token rejected after password change | Integration | P1 |
| JWT expiry is enforced | Integration | P1 |
| Azure AD SSO token exchange | Integration | P1 |
| Cognito token validation | Integration | P1 |
| Agent self-registration creates pending account | Integration | P1 |
| Password reset sends email and creates reset token | Integration | P1 |
| Change password requires valid current password | Integration | P1 |

#### CRUD Operations Tests

| Test Case | Type | Priority |
|---|---|---|
| Insert document with valid data | Integration | P0 |
| Insert with missing required fields returns 400 | Integration | P0 |
| Update existing document by ID | Integration | P0 |
| Update non-existent document returns 404 | Integration | P1 |
| Delete document by ID | Integration | P0 |
| Batch insert multiple documents | Integration | P1 |
| Batch update with filter criteria | Integration | P1 |
| Invalid collection name rejected by checkIndex | Unit | P0 |
| Tenant isolation: cannot access other org's data | Integration | P0 |

#### Security Tests

| Test Case | Type | Priority |
|---|---|---|
| Requests without JWT token return 401 | Integration | P0 |
| Expired JWT token returns 401 | Integration | P0 |
| Malformed JWT token returns 401 | Integration | P0 |
| CORS preflight rejects unauthorized origins | Integration | P0 |
| Request body with `$where` operator is rejected | Integration | P1 |
| File upload with disallowed content type is rejected | Integration | P1 |
| Sensitive fields are redacted in logs | Unit | P1 |

#### Webhook Tests

| Test Case | Type | Priority |
|---|---|---|
| WhatsApp verification challenge returns correct response | Integration | P0 |
| WhatsApp incoming message is processed | Integration | P1 |
| OceanIO webhook updates shipment status | Integration | P1 |
| Malformed webhook payload returns 400 | Integration | P1 |

#### Edge Case Tests

| Test Case | Type | Priority |
|---|---|---|
| Empty request body on POST endpoints | Integration | P1 |
| Malformed JSON body returns 400 | Integration | P1 |
| Extremely large request body is rejected | Integration | P1 |
| Concurrent batch operations maintain consistency | Integration | P2 |
| Unicode/special characters in document fields | Integration | P2 |
| Null and undefined field handling | Unit | P2 |

### Test Infrastructure Recommendations

1. **Test Database:** Use a dedicated MongoDB instance (or in-memory `mongodb-memory-server`) for integration tests to ensure isolation.
2. **Test Fixtures:** Create factory functions for generating test data with reasonable defaults.
3. **CI Integration:** Run tests on every PR with the existing Azure Pipelines configuration.
4. **Coverage Threshold:** Set minimum coverage thresholds (70% line, 60% branch) and fail CI on regression.
5. **Load Testing:** Add k6 or Artillery load tests for critical paths (login, search, CRUD).

---

## 9. SaaS Readiness Report

### Overall Score: 3/10

While Shippeasy has the foundational elements of a multi-tenant SaaS application, it lacks critical capabilities for subscription management, usage enforcement, and tenant isolation at scale.

### Present Capabilities

#### 9.1 Tenant Isolation via `orgId`
All data documents include an `orgId` field that associates records with a specific organization. Queries filter by `orgId` to ensure tenants only see their own data. This provides logical isolation at the application layer.

**Risk:** Isolation is enforced in the application code, not at the database level. A bug in any controller or query that omits the `orgId` filter could expose cross-tenant data.

#### 9.2 Role-Based Access Control
A `roles` collection stores permission definitions that are assigned to users. The auth middleware verifies role assignments before granting access to protected resources. Roles support granular permissions for different features and actions.

#### 9.3 Trial Period Management
User accounts include trial period fields with start and end dates. The authentication flow checks trial expiry and prevents login for expired trial accounts. This enables a basic try-before-you-buy experience.

#### 9.4 Audit Logging
An `auditlog` schema captures user actions including who performed the action, what was changed, and when. This provides basic compliance and debugging capabilities for tenant administrators.

### Missing Capabilities

| Capability | Priority | Description |
|---|---|---|
| **Subscription/Billing System** | P0 | No integration with a payment provider (Stripe, Razorpay, etc.). No concept of plans, pricing tiers, or billing cycles. Revenue collection is entirely manual. |
| **Usage Metering** | P0 | No tracking of API calls, storage usage, active users, or other billable metrics per tenant. Cannot enforce usage-based limits or generate usage reports. |
| **Feature Flags** | P1 | No feature flag system to enable/disable features per tenant or plan. All tenants have access to all features regardless of their subscription level. |
| **API Rate Limiting per Tenant** | P1 | No per-tenant rate limiting. A single tenant can consume all available server resources, affecting other tenants. |
| **Database-Level Tenant Isolation** | P2 | All tenants share the same MongoDB database and collections. No option for dedicated databases for enterprise tenants who require strict data isolation. |
| **Multi-Organization Management** | P2 | Limited support for users belonging to multiple organizations. No organization switching or cross-org visibility features. |
| **Plan Enforcement Middleware** | P0 | No middleware that checks the tenant's current plan before allowing access to premium features. Feature access is binary (active/inactive) rather than plan-based. |
| **Self-Service Plan Management** | P1 | Tenants cannot view their current plan, upgrade, downgrade, or manage billing information through the application. |
| **Onboarding Flow** | P2 | No guided onboarding experience for new tenants. Setup requires manual configuration by administrators. |
| **Usage Dashboard** | P2 | No tenant-facing dashboard showing API usage, storage consumption, user counts, or other operational metrics. |

### SaaS Maturity Roadmap

```
Phase 1 (Foundation):
  ├─ Integrate Stripe/Razorpay for billing
  ├─ Define subscription plans (Free, Pro, Enterprise)
  ├─ Add plan enforcement middleware
  └─ Implement usage metering

Phase 2 (Growth):
  ├─ Add feature flags (LaunchDarkly or custom)
  ├─ Per-tenant rate limiting
  ├─ Self-service plan management UI
  └─ Usage dashboards

Phase 3 (Enterprise):
  ├─ Database-level tenant isolation option
  ├─ SSO/SAML for enterprise tenants
  ├─ Custom branding per tenant
  └─ SLA management and uptime guarantees
```

---

## 10. DevOps Improvements

### Current State

The project has a functional CI/CD pipeline with Docker-based deployments. The existing infrastructure demonstrates competence but lacks production-grade reliability features.

#### Present Infrastructure

| Component | Status | Details |
|---|---|---|
| **Docker Compose** | ✅ Configured | Production and development configurations with 3 services |
| **Azure Pipelines** | ✅ Configured | 4-stage pipeline (DetectChanges → Test → BuildPush → Deploy) |
| **Health Check (MongoDB)** | ✅ Configured | `mongosh --eval 'db.adminCommand("ping")'` health check in Docker Compose |
| **Health Check (Backend)** | ✅ Configured | `/health` endpoint returns 200 OK |
| **Change Detection** | ✅ Configured | Git diff-based selective builds (only rebuild changed services) |
| **Deployment Script** | ✅ Configured | `deploy.sh` with ACR login, image pull, rolling restart, and health verification |
| **Image Tagging** | ✅ Configured | Git short SHA (7 chars) used as immutable image tags |
| **Build Optimization** | ✅ Configured | Docker BuildKit enabled for layer caching |

#### Pipeline Stages

```
┌──────────────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────┐
│  DetectChanges   │───▶│   Test   │───▶│  BuildPush   │───▶│  Deploy  │
│  (git diff)      │    │ (jest +  │    │ (docker build│    │ (ssh +   │
│                  │    │  karma)  │    │  + ACR push) │    │ deploy.sh│
└──────────────────┘    └──────────┘    └──────────────┘    └──────────┘
     Always               Always         Main branch only   Main branch only
```

### Needed Improvements

#### 10.1 Backend Health Check in Docker Compose (P0)

The Docker Compose production configuration includes a health check for MongoDB but not for the backend service. Docker will consider the backend healthy as soon as the container starts, even if the application is still initializing or has crashed.

**Recommendation:**
```yaml
backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

#### 10.2 Secrets Management (P0)

Secrets are currently managed through environment variables in `.env` files on the EC2 instance and Azure DevOps variable groups. There is no centralized secrets management solution, no automatic rotation, and no audit trail for secret access.

**Recommendation:** Implement Azure Key Vault or AWS Secrets Manager with:
- Automatic secret rotation for database credentials and API keys
- IAM-based access control for secret retrieval
- Audit logging for all secret access events
- Integration with Docker Compose via environment variable injection

#### 10.3 Monitoring and Alerting (P0)

While Elastic APM is configured for performance monitoring, there is no alerting setup for error rates, response time degradation, or infrastructure issues. Issues are discovered only when users report them.

**Recommendation:**
- Configure Elastic APM alerts for error rate spikes and latency p99 thresholds
- Add infrastructure monitoring (CPU, memory, disk) via CloudWatch or Prometheus
- Set up PagerDuty/OpsGenie integration for on-call rotation
- Create dashboards for key business metrics (active users, API throughput, error rates)

#### 10.4 Log Aggregation (P1)

Logs are written to local files via Winston and `logs_data` Docker volume. There is no centralized log aggregation, making it difficult to search, correlate, and analyze logs across services.

**Recommendation:**
- Deploy ELK stack (Elasticsearch + Logstash + Kibana) or use a managed service
- Configure Winston to output structured JSON logs
- Add correlation IDs that span frontend, backend, and database operations
- Implement log retention policies (30 days hot, 90 days warm, 1 year cold)

#### 10.5 Horizontal Scaling (P1)

The current deployment runs a single instance of each service on a single EC2 instance. There is no load balancing, auto-scaling, or redundancy.

**Recommendation:**
- Add an Application Load Balancer (ALB) in front of the EC2 instance
- Use Docker Swarm or migrate to ECS/EKS for container orchestration
- Configure auto-scaling based on CPU utilization and request count
- Ensure application is stateless (externalize sessions to Redis)

#### 10.6 Database Backup Strategy (P0)

No automated backup strategy is documented or configured for MongoDB. Data loss from hardware failure, accidental deletion, or corruption would be catastrophic.

**Recommendation:**
- Configure MongoDB `mongodump` on a daily cron schedule
- Store backups in S3 with versioning and lifecycle policies
- Test backup restoration monthly
- Consider MongoDB Atlas for managed backups with point-in-time recovery

#### 10.7 Staging Environment (P1)

There is no staging or pre-production environment. Changes go directly from development to production, increasing the risk of deploying broken code.

**Recommendation:**
- Create a staging environment that mirrors production
- Deploy all changes to staging first with automated smoke tests
- Add a manual approval gate between staging and production in the pipeline

---

## 11. Refactoring Plan

### Priority Matrix

| Priority | Recommendation | Effort | Impact | Risk | Status |
|---|---|---|---|---|---|
| **P0** | Add input validation middleware | Medium | High | Low | ✅ FIXED |
| **P0** | Add rate limiting | Low | High | Low | ✅ FIXED |
| **P0** | Add security headers (helmet) | Low | High | Low | ✅ FIXED |
| **P1** | Implement proper service layer separation | High | High | Medium | |
| **P1** | Add TypeScript to backend | High | High | Medium | |
| **P1** | Implement proper error codes/types | Medium | Medium | Low | |
| **P2** | Add database indexes for common queries | Medium | High | Low | ✅ FIXED |
| **P2** | Implement refresh token flow | Medium | Medium | Low | |
| **P2** | Add request/response schema validation | High | High | Low | |
| **P3** | Migrate to proper dependency injection pattern | High | Medium | Medium | |

### Detailed Recommendations

#### 11.1 Input Validation Middleware (P0)

**Current State:** Request bodies are passed directly to Mongoose without validation.
**Target State:** Every endpoint has a validation schema that defines required fields, types, and constraints.

```javascript
// Example with express-validator
const { body, validationResult } = require('express-validator');

router.post('/api/user/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
});
```

#### 11.2 Rate Limiting (P0)

**Current State:** No request throttling on any endpoint.
**Target State:** Tiered rate limiting with stricter limits on authentication endpoints.

```javascript
const rateLimit = require('express-rate-limit');

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
});

// Strict auth limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
});

app.use('/api/', apiLimiter);
app.use('/api/user/login', authLimiter);
```

#### 11.3 Security Headers (P0)

**Current State:** No security headers configured.
**Target State:** Comprehensive security headers via helmet.

```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### 11.4 Service Layer Separation (P1)

**Current State:** Controllers contain mixed business logic, database queries, and response formatting. Some functions exceed 200+ lines.
**Target State:** Clear separation between controllers (HTTP handling), services (business logic), and repositories (data access).

```
// Target architecture
controller/  → HTTP request/response handling only
service/     → Business logic and orchestration
repository/  → Database queries and data access
middleware/  → Cross-cutting concerns
```

#### 11.5 TypeScript Migration (P1)

**Current State:** Entire backend in JavaScript with no type safety.
**Target State:** Gradual TypeScript migration starting with new code.

**Migration Strategy:**
1. Add `tsconfig.json` with `allowJs: true` for incremental migration
2. Write all new files in TypeScript
3. Convert existing files starting with models/schemas, then services, then controllers
4. Add strict mode after 80%+ migration

#### 11.6 Error Codes and Types (P1)

**Current State:** Errors return inconsistent shapes. Some use `{ message }`, others use `{ error }`, and some return raw stack traces.
**Target State:** Standardized error response format with error codes.

```javascript
// Standardized error response
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "status": 401,
    "requestId": "req-abc123"
  }
}
```

#### 11.7 Database Indexes (P2)

Add indexes for all commonly queried fields across collections. Prioritize based on query frequency and collection size.

#### 11.8 Refresh Token Flow (P2)

Replace single long-lived JWT with a short-lived access token (15 minutes) and a long-lived refresh token (7 days) stored in the database with revocation support.

#### 11.9 Request/Response Schema Validation (P2)

Add OpenAPI 3.0 schemas for all endpoints and use `express-openapi-validator` to automatically validate requests and responses against the schema.

#### 11.10 Dependency Injection (P3)

Replace direct `require()` imports with a DI container (e.g., `awilix` or `tsyringe`) to improve testability and reduce coupling between modules.

---

## 12. Production Hardening Checklist

### Security

- [x] Remove hardcoded secrets from source code
- [x] Implement bcrypt password hashing
- [x] Configure CORS properly (allowed origins)
- [x] Add timing-safe token comparison
- [x] Sanitize sensitive data from request logs
- [x] Remove hardcoded encryption key fallback
- [x] Move test credentials to environment variables
- [x] Add global error handling middleware
- [x] Add helmet.js security headers
- [x] Add rate limiting (general + auth-specific)
- [ ] Add CSRF protection
- [x] Add input validation middleware (express-validator)
- [ ] Implement refresh token flow with revocation
- [x] Add content security policy headers (via helmet)
- [x] Add webhook signature verification (OceanIO, WhatsApp)
- [x] Add file upload content-type validation
- [x] Implement NoSQL injection prevention
- [x] Add API key authentication for service-to-service calls

### Performance

- [x] Add database indexes for common query patterns
- [x] Fix N+1 queries in auth controller (use `$in` operator)
- [x] Add response compression middleware
- [x] Reduce APM sample rate to 10% in production
- [ ] Add Redis caching layer for configuration and rates
- [x] Implement proper pagination with enforced limits
- [x] Reduce default request body limit to 1MB
- [x] Add connection pooling configuration for MongoDB
- [x] Optimize log verbosity (metadata only by default)

### Infrastructure

- [x] Add backend health check to Docker Compose
- [ ] Implement secrets management (Key Vault / Secrets Manager)
- [ ] Add monitoring and alerting (APM alerts, CloudWatch)
- [ ] Add log aggregation (ELK stack or managed service)
- [ ] Configure horizontal scaling (ALB + auto-scaling)
- [ ] Add automated database backups (daily mongodump to S3)
- [ ] Create staging environment with pipeline integration
- [ ] Add SSL/TLS termination at load balancer
- [x] Configure container resource limits (CPU/memory)
- [ ] Add Docker image vulnerability scanning in CI
- [x] Add graceful shutdown with signal handling

### SaaS Architecture

- [x] Add tenant isolation middleware (orgId enforcement)
- [x] Add subscription plan enforcement middleware (soft/hard mode)
- [x] Define plan tiers (free/pro/enterprise)
- [ ] Integrate billing provider (Stripe/Razorpay)
- [x] Add usage metering per tenant
- [x] Add feature flag system
- [x] Add per-tenant rate limiting
- [ ] Add self-service plan management UI

### Testing

- [ ] Increase test coverage to >70% line coverage
- [ ] Add unit tests for all controller functions
- [ ] Add integration tests for auth flows
- [x] Add security tests (NoSQL injection prevention, webhook auth, file validation)
- [ ] Add load tests for critical endpoints (k6/Artillery)
- [ ] Add contract tests for external API integrations
- [ ] Add database migration tests
- [ ] Set up coverage gates in CI pipeline
- [x] Add unit tests for middleware (security, API key, plan enforcement, tenant isolation, usage tracking, validation)

### Documentation

- [x] Architecture diagram and documentation
- [x] CI/CD setup guide
- [x] Compliance documentation suite
- [x] Engineering audit report
- [ ] API documentation (Swagger/OpenAPI completeness)
- [x] Runbook for common operational procedures
- [ ] Incident response playbooks per service
- [x] Onboarding guide for new developers

---

## Appendix A: File Inventory

### Backend Controllers (24 files)

| File | Purpose |
|---|---|
| `auth.controller.js` | User authentication, login, password management |
| `insert.commonController.js` | Generic document insertion |
| `update.commonController.js` | Generic document updates |
| `delete.commonController.js` | Generic document deletion |
| `search.controller.js` | Document retrieval and global search |
| `azureStorageContoller.js` | Azure Blob Storage file operations |
| `edi.controller.js` | EDI document generation |
| `ediController.js` | Legacy EDI controller |
| `eInvoicing.controller.js` | Zircon e-invoicing integration |
| `email.controller.js` | Email sending (SendInBlue) |
| `emailReplyScheduler.js` | Inbound email processing |
| `loadPlan.controller.js` | Container load planning |
| `tally.controller.js` | Tally accounting export |
| `creditReport.controller.js` | Credit report generation |
| `dashboard.controller.js` | Dashboard data aggregation |
| `helper.controller.js` | Freight rates, exchange rates, utilities |
| `jasperController.js` | Jasper report generation |
| `non-auth.controller.js` | Public endpoint handlers |
| `qr.controller.js` | QR code generation |
| `reports.controller.js` | Report generation and export |
| `storage.controller.js` | Additional storage operations |
| `webhooks.controller.js` | OceanIO webhook handler |
| `whatsapp.controller.js` | WhatsApp Business API integration |
| `automations/jobautomation.controller.js` | Job automation workflows |

### Backend Services (10 files)

| File | Purpose |
|---|---|
| `service/mongooseConnection.js` | MongoDB connection management |
| `service/socketHelper.js` | Socket.io event handling and broadcasting |
| `service/queue.js` | BullMQ job queue management |
| `service/logger.js` | Winston logging configuration |
| `service/requestContext.js` | AsyncLocalStorage request context |
| `service/schedulers.js` | Cron job scheduling |
| `service/inAppNotification.js` | In-app notification dispatch |
| `service/messageHelper.js` | Message formatting utilities |
| `services/notification.service.js` | Multi-channel notification service |
| `services/trigger.service.js` | Event trigger handler |

### Frontend Modules (11 directories)

| Module | Purpose |
|---|---|
| `admin/` | Admin panel (users, roles, settings) |
| `auth/` | Login, registration, SSO |
| `self-dashboard/` | Agent self-service dashboard |
| `release-manager/` | Release management |
| `ticketadmin/` | Support ticket administration |
| `layout/` | App shell and navigation |
| `Guard/` | Route guards (auth, role) |
| `models/` | TypeScript interfaces |
| `shared/` | Shared components and services |
| `services/` | App-level services |
| `side-sticky-menu/` | Navigation menu component |

---

## Appendix B: Environment Configuration

### Required Environment Variables (Backend)

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ENCRYPTION_KEY` | AES encryption key for sensitive data | Yes |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Yes |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection | Yes |
| `AZURE_STORAGE_CONTAINER` | Azure Blob container name | Yes |
| `SENDINBLUE_API_KEY` | SendInBlue/Brevo API key | Yes |
| `WHATSAPP_TOKEN` | WhatsApp Business API token | Conditional |
| `WHATSAPP_VERIFY_TOKEN` | WhatsApp webhook verification token | Conditional |
| `OPENAI_API_KEY` | OpenAI API key | Conditional |
| `GEMINI_API_KEY` | Google Gemini API key | Conditional |
| `ELASTIC_APM_SERVER_URL` | Elastic APM server URL | Optional |
| `REDIS_URL` | Redis connection URL (for BullMQ) | Optional |
| `FREIGHTOS_API_KEY` | Freightos API key | Conditional |
| `ZIRCON_API_KEY` | Zircon e-invoicing API key | Conditional |
| `NODE_ENV` | Environment (development/production) | Yes |

### Required Environment Variables (Frontend Build)

| Variable | Description | Required |
|---|---|---|
| `ENVIRONMENT` | Build environment target | Yes |
| `API_URL` | Backend API base URL | Yes |
| `SOCKET_URL` | Socket.io server URL | Yes |
| `API_URL_MASTER` | Master API URL | Yes |

---

*Report generated as part of the Shippeasy SaaS engineering audit initiative. This document should be reviewed and updated quarterly as the platform evolves.*
