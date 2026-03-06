# AI Software Engineering Team

## Overview

This repository uses a **Multi-Agent AI Software Engineering System** that simulates a full software development organization.

The AI system collaborates through specialized agents to **analyze, design, build, test, secure, optimize, and deploy production-grade SaaS applications**.

The system is capable of both:

* **Analyzing an existing codebase**
* **Designing and building new SaaS features**

The agents collectively perform a **full Software Development Lifecycle (SDLC)** review and improvement process.

---

# Core Responsibilities of the AI System

The AI system must:

1. Analyze the **entire repository structure and codebase**
2. Identify **all features and business logic**
3. Evaluate **architecture, code quality, security, and performance**
4. Generate **missing documentation, tests, and improvements**
5. Transform the system into a **secure, scalable SaaS architecture**
6. Recommend **refactoring, enhancements, and optimizations**

All agents must **reference real files and modules in the repository whenever possible.**

---

# System Rules

All AI agents must follow these rules:

1. Operate as a **collaborative engineering team**
2. Each agent performs **a specific role in the SDLC**
3. Agents must **review outputs from previous agents**
4. All decisions must be **clearly documented**
5. Recommendations must follow **industry best practices**
6. All designs must assume **production-grade SaaS deployment**
7. Security, scalability, and maintainability are **top priorities**
8. Avoid assumptions when possible — rely on **actual repository analysis**

---

# AI Agents

The system must simulate the following specialized agents.

### 1. Product Manager Agent

Responsibilities:

* Understand the project's purpose
* Identify target users
* Define product vision and feature set
* Create a product roadmap

Outputs:

* Product Vision Document
* Feature Inventory
* User Personas
* Product Roadmap

---

### 2. Requirements Analyst Agent

Responsibilities:

* Translate product vision into technical requirements
* Write structured user stories
* Define acceptance criteria
* Identify edge cases and constraints

Outputs:

* Software Requirements Specification (SRS)
* User Stories
* Acceptance Criteria

---

### 3. System Architect Agent

Responsibilities:

* Analyze repository architecture
* Define system layers and module boundaries
* Design scalable architecture
* Select appropriate technologies

Outputs:

* Architecture Design Document
* Architecture Diagram (text)
* Module Breakdown
* Service Responsibilities

---

### 4. UI/UX Designer Agent

Responsibilities:

* Design application workflows
* Improve usability and user experience
* Define UI structure and design system

Outputs:

* UI Flow Diagrams
* Wireframe Descriptions
* Design System Guidelines

---

### 5. Database Architect Agent

Responsibilities:

* Analyze and design database schema
* Define entity relationships
* Optimize indexing strategies
* Design multi-tenant database architecture

Outputs:

* Database Schema
* Entity Relationship Diagram
* Indexing Strategy
* Migration Plan

---

### 6. Backend Developer Agent

Responsibilities:

* Design backend architecture
* Implement API endpoints
* Implement authentication and authorization
* Implement business logic
* Ensure multi-tenant support

Outputs:

* Backend Folder Structure
* API Specifications
* Example API Implementations

---

### 7. Frontend Developer Agent

Responsibilities:

* Design frontend architecture
* Build UI components
* Integrate APIs
* Ensure responsive and accessible UI

Outputs:

* Frontend Architecture
* Component Structure
* Example UI Components

---

### 8. Security Engineer Agent

Responsibilities:

Perform a comprehensive security audit based on **OWASP Top 10** and SaaS security best practices.

Checks include:

* Authentication vulnerabilities
* Authorization flaws
* Injection attacks
* Sensitive data exposure
* API security
* CORS configuration
* Rate limiting
* Dependency vulnerabilities

Outputs:

* Security Architecture
* Security Audit Report
* Vulnerability Mitigation Plan

---

### 9. Performance Engineer Agent

Responsibilities:

Analyze system performance and scalability.

Focus areas:

* API performance
* database query optimization
* caching strategies
* asynchronous processing
* queue systems
* resource utilization

Outputs:

* Performance Analysis Report
* Optimization Recommendations

---

### 10. QA / Test Automation Agent

Responsibilities:

Create a complete testing strategy.

Testing scope:

* Unit testing
* Integration testing
* API testing
* End-to-End testing
* Edge cases and error handling

Outputs:

* Comprehensive Test Plan
* Test Case Matrix
* Example Automated Tests

---

### 11. DevOps Engineer Agent

Responsibilities:

Design infrastructure and deployment strategy.

Focus areas:

* CI/CD pipelines
* containerization (Docker)
* environment configuration
* logging and monitoring
* scalable deployment

Outputs:

* Deployment Architecture
* CI/CD Pipeline Design
* Infrastructure Recommendations

---

### 12. SaaS Platform Architect Agent

Responsibilities:

Transform the system into a scalable SaaS platform.

Key features:

* Multi-tenancy
* Organization management
* Role-Based Access Control (RBAC)
* Subscription plans
* Billing integration
* Usage tracking
* Feature flags

Outputs:

* SaaS Architecture
* Tenant Isolation Model
* Subscription Architecture

---

### 13. Code Reviewer Agent

Responsibilities:

Perform a deep code quality review.

Focus areas:

* code structure
* maintainability
* performance
* security
* adherence to best practices

Outputs:

* Code Review Report
* Refactoring Recommendations

---

### 14. Documentation Agent

Responsibilities:

Generate and maintain project documentation.

Outputs:

* README
* API documentation
* Developer setup guide
* Architecture documentation

---

# Agent Execution Workflow

Agents must execute in the following order:

1. Product Manager
2. Requirements Analyst
3. System Architect
4. Database Architect
5. UI/UX Designer
6. Backend Developer
7. Frontend Developer
8. Security Engineer
9. Performance Engineer
10. QA/Test Automation
11. DevOps Engineer
12. SaaS Platform Architect
13. Code Reviewer
14. Documentation Agent

Each agent must **review and validate the output of previous agents before continuing.**

---

# Repository Analysis Requirements

When analyzing this repository, agents must:

* Scan **all folders and modules**
* Identify **all APIs and services**
* Identify **all data models**
* Map **features to source files**
* Identify **external integrations**
* Evaluate **configuration and environment setup**

---

# Final Deliverables

The AI system must produce a **complete engineering report** containing:

1. Product Vision
2. System Requirements
3. Architecture Design
4. Database Design
5. Backend Architecture
6. Frontend Architecture
7. Security Architecture
8. Performance Optimization Plan
9. Testing Strategy and Test Cases
10. DevOps / CI-CD Architecture
11. SaaS Platform Design
12. Code Quality Report
13. Refactoring Plan
14. Full Documentation

---

# Engineering Standards

All recommendations must prioritize:

* Scalability
* Security
* High performance
* Clean architecture
* Maintainability
* Cloud readiness
* Production stability

---
---

# Agent Coding Guidelines

*Practical reference for agents making code changes in this monorepo.*

## Repository Structure

```
shipeasy/              # Angular 13 frontend (PWA)
shipeasy-api/          # Node.js / Express backend (REST API)
docs/                  # Compliance and CI/CD documentation
.github/workflows/     # GitHub Actions (manual fallback)
azure-pipelines.yml    # Primary CI/CD pipeline
docker-compose.yml     # Production Docker Compose
docker-compose.dev.yml # Development Docker Compose (hot reload)
deploy.sh              # EC2 deployment script
```

This is a monorepo with two independent apps. There are no npm/yarn workspaces — each app has its own `package.json` and dependency management.

## Build & Run Commands

### Backend (`shipeasy-api/`)

```bash
npm install
npm start           # runs node index.js on port 3000
npm test            # Jest with --testTimeout=5000 --detectOpenHandles
```

### Frontend (`shipeasy/`)

```bash
yarn install
yarn start          # dev server on port 4200 (proxies /api/* to backend)
yarn test           # Karma + Jasmine unit tests
yarn lint           # ESLint via Angular ESLint
yarn e2e            # Protractor E2E tests
```

For CI-style headless testing: `yarn test --watch=false --browsers=ChromeHeadless`

### Docker (repo root)

```bash
docker compose up --build -d                                                    # production
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build       # dev (hot reload)
```

## Code Style & Conventions

### Frontend (Angular / TypeScript)

- **Linter**: ESLint (`.eslintrc.json`). Legacy TSLint config (`tslint.json`) also exists but ESLint is authoritative.
- **Component selectors**: element selectors, prefix `app`, kebab-case (e.g., `app-my-component`).
- **Directive selectors**: attribute selectors, prefix `app`, camelCase (e.g., `appMyDirective`).
- **Quotes**: single quotes.
- **Semicolons**: always.
- **Max line length**: 140 characters.
- **Console usage**: `console.info` and `console.error` only — `console.log`, `console.debug`, `console.warn` are errors.
- **Unused variables**: treated as errors.
- **Indentation**: spaces (not tabs).
- **Member ordering**: static fields, instance fields, static methods, instance methods.
- **Stylesheets**: SCSS.
- **Module structure**: `admin/`, `layout/`, `auth/`, `models/`, `services/`, `shared/` under `src/app/`.
- **Spec files**: colocated with their components as `*.spec.ts`.

### Backend (Node.js)

- **Module system**: CommonJS (`require` / `module.exports`).
- **Entry point**: `index.js`.
- **Directory layout**: `router/`, `service/`, `services/`, `schema/`, `middleware/`, `controller/`, `utils/`, `tests/`.
- No ESLint or Prettier config — follow existing code style.

## Testing

### Backend

- **Framework**: Jest 29 with Supertest for HTTP assertions.
- **Test location**: `shipeasy-api/tests/`.
- **CI command**: `npm test -- --ci --forceExit --reporters=jest-junit`
- **Environment**: set `NODE_ENV=test`.

### Frontend

- **Framework**: Karma + Jasmine.
- **Test location**: `*.spec.ts` files colocated with source files (~384 spec files).
- **Coverage output**: `coverage/baxi/`.
- **CI command**: `yarn test --watch=false --browsers=ChromeHeadless`
- **E2E**: Protractor (`e2e/src/**/*.e2e-spec.ts`), base URL `http://localhost:4200/`.

## CI/CD Pipeline

The primary CI system is **Azure Pipelines** (`azure-pipelines.yml` at the repo root).

Pipeline stages:
1. **DetectChanges** — git diff to determine which app(s) changed.
2. **Test** — runs backend (Jest, Node 22) and frontend (Karma headless, Node 20) tests conditionally.
3. **BuildPush** — builds Docker images, pushes to ACR (only on push to `main`).
4. **Deploy** — SSH to AWS EC2 and runs `deploy.sh` (only on push to `main`).

Triggers: pushes and PRs to `main` that touch `shipeasy/`, `shipeasy-api/`, `docker-compose.yml`, `azure-pipelines.yml`, or `deploy.sh`.

## Important Notes

- The frontend package name is `smartagent` and the Angular project name is `baxi` (in `angular.json`); the build output goes to `dist/smartagent`.
- The frontend dev server proxies `/api/*` requests via `src/proxy.conf.json` — this may point to a remote URL by default; adjust for local backend development.
- Backend environment variables are configured via `.env` (see `.env.example`). Required vars include `MONGO_CONNECTION`, `SECRET_KEY_JWT`, and various service credentials.
- Frontend environment config lives in `shipeasy/src/environments/environment.ts` and variant files (`environment.prod.ts`, `environment.dev.ts`, `environment.demo.ts`, `environment.indianproduction.ts`).
- The frontend uses `--max_old_space_size=6096` for the dev server and `4096` for tests due to Angular 13's memory requirements.
- Frontend CI tests use `continueOnError: true` — the test suite is not yet fully stable.

---
---

# Agent Workflow Output — Agents 1–3

*Analysis produced by the Product Manager, Requirements Analyst, and System Architect agents after a full repository scan.*

---

## 1. Project Overview

**Shippeasy** is a full-stack, multi-tenant SaaS platform for logistics, freight forwarding, and shipping management. It serves freight forwarding agents, shipping lines, warehouse operators, and their end-customers (shippers/consignees) through a unified web application.

The platform digitizes the entire freight lifecycle — from enquiry and quotation, through booking and shipment execution, to invoicing, compliance documentation, and warehouse management. It supports ocean, air, rail, and land transport modes with real-time container tracking, automated milestone management, and regulatory compliance (EDI, e-Invoicing, IGM/EGM, shipping bills).

**Business model**: Multi-tenant SaaS with per-organization (`orgId`) data isolation. Includes a trial period with automatic expiration and user disabling. Supports customer self-service portals alongside full agent/admin back-offices.

**Target users**:
- **Freight forwarding agents** — primary users managing the full shipment lifecycle
- **Shipping line operators** — carrier booking and vessel/voyage management
- **Warehouse operators** — inward/outward operations, gate entries, dispatch, surveyor reports
- **Shippers / Consignees** — self-service quotation requests, shipment tracking, document access
- **Finance teams** — invoicing, payments, credit/debit notes, TDS, Tally sync
- **Operations managers** — dashboards, reports, milestone tracking, automation configuration

**Key differentiators**:
- End-to-end freight lifecycle management in a single platform
- Multi-modal transport support (ocean, air, rail, land)
- AI-powered document scanning (BL scanning via OpenAI, invoice scanning via Gemini)
- Real-time container tracking via ULIP government API integration
- Integrated warehouse management system
- WhatsApp Business API integration for customer communication
- Automated workflows and triggers for email, notifications, and report generation
- GST e-invoicing compliance via Zircon API (India market)

---

## 2. Feature List

### Core Business Modules

| Module | Description | Key Files |
|--------|-------------|-----------|
| **Enquiry Management** | Create, track, and manage freight enquiries with route details, shipper/consignee info | `shipeasy/src/app/admin/enquiry/`, `shipeasy-api/schema/schema.js` (enquiry) |
| **Quotation Management** | Generate quotations from enquiries; auto-expiry; rate calculation; status tracking | `shipeasy-api/service/schedulers.js`, schema: `quotation`, `enquiryitem` |
| **Batch/Job Management** | Central job execution unit linking containers, documents, invoices, milestones | `shipeasy/src/app/admin/batch/`, schema: `batch` |
| **Container Management** | Track containers by number; real-time location via ULIP; event logging | schemas: `container`, `containerevent`, `containermaster` |
| **Booking Management** | Carrier bookings, consolidation bookings, shipping instructions (SI) | `shipeasy/src/app/admin/carrier-booking/`, schemas: `carrierbooking`, `consolidationbooking`, `instruction` |
| **Document Management** | Upload/store (Azure Blob)/download documents per batch; BL generation | `shipeasy-api/controller/azureStorageContoller.js`, schema: `document` |
| **Invoice & Finance** | Create invoices, payments, credit/debit notes, TDS; Tally integration | `shipeasy/src/app/admin/finance/`, schemas: `invoice`, `payment`, `transaction`, `creditdebitnote`, `tds` |
| **E-Invoicing** | Push invoices to Zircon for GST e-invoicing compliance | `shipeasy-api/controller/eInvoicing.controller.js` |
| **EDI** | Generate EDI files for electronic data interchange | `router/route.js` (`/api/edi/:ediName/:documentId`) |
| **Shipping Bills** | Generate and manage shipping bills for customs | schema: `shippingbill` |
| **IGM/EGM** | Import/Export General Manifest processing; CFS operations; IMAP mail parsing | `shipeasy/src/app/admin/igm/`, `shipeasy/src/app/admin/egm/`, schemas: `igm`, `egm`, `igmcfs`, `igmmail` |
| **Bill of Lading** | BL creation, AI scanning, telex release tracking | `shipeasy-api/controller/helper.controller.js` (scan-bl), schema: `bl`, `blscanning` |
| **Load Planning** | Container load calculation and planning tools | `shipeasy/src/app/admin/load-calculator/`, routes: `/api/load-plan`, `/api/load-calculate` |
| **Warehouse Management** | Inward, outward, gate entries, packing, dispatch, bill of entry, container handover, surveyor reports | `shipeasy/src/app/admin/warehouse/`, 12 warehouse schemas |
| **Rate Management** | Rate masters, Freightos API integration, exchange rate lookups | `shipeasy-api/controller/search.controller.js`, schema: `ratemaster` |
| **Transport RFQ** | Transport inquiry management with auto-expiry | `shipeasy/src/app/admin/transport/`, schema: `transportinquiry` |
| **Lorry Receipts** | Land transport receipt management | `shipeasy/src/app/admin/lorry-booking/`, schema: `lorryreceipt` |
| **Trade Finance** | Trade finance document management | schema: `tradefinance` |

### Communication & Notifications

| Feature | Description | Key Files |
|---------|-------------|-----------|
| **Email (outbound)** | SMTP/SendInBlue email; batch email; scheduled reports | `shipeasy-api/service/schedulers.js`, `shipeasy-api/services/notification.service.js` |
| **Email (inbound)** | IMAP reply processing; IGM/CFS/BL Telex mail parsing | `shipeasy-api/controller/emailReplyScheduler.js` |
| **WhatsApp** | WhatsApp Business API via Facebook Graph; document sharing; webhooks | `shipeasy-api/controller/whatsapp.controller.js`, `shipeasy-api/service/messageHelper.js` |
| **In-App Notifications** | Real-time notifications via Socket.io; notification masters per org | `shipeasy-api/service/inAppNotification.js`, schema: `inappnotification` |
| **Chat** | Real-time messaging via Socket.io; group chats | `shipeasy-api/service/socketHelper.js`, schema: `message`, `groupchat` |
| **Reminders** | Scheduled reminders per batch with user targeting | schema: `reminder`, cron in `schedulers.js` |

### User & Organization Management

| Feature | Description | Key Files |
|---------|-------------|-----------|
| **Multi-Tenant Orgs** | Agent (organization) setup with branches, departments, employees | schemas: `agent`, `branch`, `department`, `employee` |
| **User Management** | Roles, features (permissions), menu configuration per org | schemas: `user`, `role`, `feature`, `menu` |
| **Authentication** | JWT + Google OAuth + Azure MSAL SSO | `shipeasy-api/middleware/auth.js`, `shipeasy/src/app/auth/` |
| **Customer Portal** | Self-service dashboard for shippers with quotation and shipment views | `shipeasy/src/app/admin/customer/` (guarded by `AuthGuardCustomer`) |
| **Onboarding** | Agent onboarding flow; trial period management | route: `/api/agentOnBoarding`, cron: trial expiration |
| **FAQ & Support** | FAQ management and support ticket system | schemas: `faq`, `supportmsg`, `ticket` |

### Reporting & Analytics

| Feature | Description | Key Files |
|---------|-------------|-----------|
| **Dashboard** | Metrics, charts (ECharts, ngx-charts), Mapbox container maps | `shipeasy/src/app/admin/dashboard/` |
| **Jasper Reports** | Server-side PDF report generation | `shipeasy-api/controller/jasperController.js` |
| **Scheduled Reports** | Cron-driven report emails with configurable schedules | schema: `schedulereport`, `reportconfig` |
| **Custom Reports** | Order reports with Azure Blob storage | routes: `/api/createOrderReport`, `/api/downloadOrderReport` |
| **Bold/Stimulsoft Reports** | Embedded report viewer | `shipeasy/src/app/admin/reports/` |

### AI & Automation

| Feature | Description | Key Files |
|---------|-------------|-----------|
| **BL Scanning** | AI-powered Bill of Lading document parsing | `shipeasy-api/controller/helper.controller.js` (OpenAI) |
| **Invoice Scanning** | AI-powered invoice data extraction | `shipeasy-api/controller/search.controller.js` (Gemini) |
| **Job Automation** | Rule-based automations triggered by entity events | `shipeasy-api/controller/automations/jobautomation.controller.js`, schema: `jobautomation` |
| **Triggers** | Configurable triggers on entity lifecycle (email, report, notification) | `shipeasy-api/services/trigger.service.js`, schema: `trigger` |
| **Smart Documents** | AI-assisted document processing | `shipeasy/src/app/admin/smart-documents/`, schema: `smartdocument` |

### Infrastructure Features

| Feature | Description | Key Files |
|---------|-------------|-----------|
| **Real-Time Updates** | Socket.io for live data synchronization | `shipeasy-api/service/socketHelper.js` |
| **QR Codes** | Dynamic QR generation for batches and warehouses | route: `/api/downloadQr`, schemas: `qr` |
| **Internationalization** | ngx-translate with EN, FR, Mandarin support | `shipeasy/src/assets/i18n/` |
| **PWA** | Firebase Cloud Messaging; installable web app | `shipeasy/src/firebase-messaging-sw.js`, `shipeasy/src/manifest.json` |
| **Elastic APM** | Full-stack observability (backend + frontend RUM) | `shipeasy-api/index.js`, `shipeasy/src/app/app.module.ts` |
| **Global Search** | Cross-entity search functionality | route: `/api/globalSearch` |
| **Audit Logging** | Change tracking per resource | schema: `auditlog`, `logaudit` |

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS EC2 Instance                            │
│                                                                     │
│  ┌──────────────┐   ┌──────────────────┐   ┌────────────────────┐  │
│  │   nginx:80   │──▶│  Express API     │──▶│  MongoDB 6         │  │
│  │  (frontend)  │   │  :3000           │   │  (mongo_data vol)  │  │
│  │              │   │                  │   │                    │  │
│  │  Angular SPA │   │  Socket.io       │   └────────────────────┘  │
│  │  static files│   │  Cron schedulers │                           │
│  └──────────────┘   │  BullMQ workers  │                           │
│                     └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
         │                    │
         │                    ├──▶ Azure Blob Storage (documents, reports)
         │                    ├──▶ Azure Container Registry (Docker images)
         │                    ├──▶ Redis (BullMQ email queue)
         │                    ├──▶ Elastic APM Server (observability)
         │                    ├──▶ Jasper Reports Server (PDF generation)
         │                    ├──▶ ULIP Government API (container tracking)
         │                    ├──▶ Zircon API (e-invoicing / GST)
         │                    ├──▶ WhatsApp Business API (Facebook Graph)
         │                    ├──▶ Freightos API (freight rates)
         │                    ├──▶ OpenAI API (BL scanning)
         │                    ├──▶ Google Gemini API (invoice scanning, automation)
         │                    ├──▶ SMTP / SendInBlue (outbound email)
         │                    └──▶ IMAP servers (inbound email processing)
```

### Request Flow

1. **Browser** loads Angular SPA from nginx (port 80)
2. **API calls** from Angular hit `/api/*` which nginx reverse-proxies to Express (port 3000)
3. **WebSocket** connections (Socket.io) are proxied through nginx with upgrade support
4. **Express middleware** chain: CORS → JSON parser → request tracer → auth (`validateAuth`) → controller
5. **Authentication**: JWT verification or Google OAuth token validation; user/agent/org context resolved
6. **Business logic** in controllers reads/writes MongoDB via Mongoose; all queries scoped by `orgId`
7. **File operations** go through Azure Blob Storage (`@azure/storage-blob`)
8. **Real-time events** are broadcast via Socket.io to connected clients (`data-change`, `inAppNotification`, `messages`)
9. **Background jobs** run via 16 node-cron schedulers (email, tracking, expiry, reports)
10. **Email queue** processed by BullMQ workers backed by Redis

### API Design

The backend uses a **hybrid API pattern**:

- **Named endpoints** (~60 routes) for complex business operations (e.g., `/api/scan-bl`, `/api/edi/:ediName/:documentId`, `/api/sent-to-einvoicing/:invoiceId`)
- **Generic CRUD endpoints** for standard data operations on any of the 87 Mongoose models:
  - `POST /api/search/:indexName/:id?` — read/search
  - `POST /api/:indexName` — insert
  - `PUT /api/:indexName/:id` — update
  - `DELETE /api/:indexName/:id` — delete
  - Validated by `checkIndex` middleware against the schema registry

### Docker Compose Services

| Service | Image | Ports | Volumes |
|---------|-------|-------|---------|
| **mongo** | `mongo:6` | internal only (dev: 27017) | `mongo_data:/data/db` |
| **backend** | `${BACKEND_IMAGE}:${BACKEND_TAG}` | 3000 | `logs_data:/app/logs`, env from `.env` |
| **frontend** | `${FRONTEND_IMAGE}:${FRONTEND_TAG}` | 80 (dev: 4200) | none (dev: source bind mount) |

Network: `shipeasy_net` (bridge).

### Deployment Pipeline

```
Developer Push → main
       │
       ▼
Azure Pipelines: DetectChanges (git diff)
       │
       ├──▶ Test (Jest / Karma — conditional per app)
       │
       ▼
BuildPush (Docker build → ACR push, tagged by short SHA)
       │
       ▼
Deploy (SSH → EC2 → deploy.sh)
       │
       ├── ACR login with service principal
       ├── Pull new images
       ├── Rolling restart (backend then frontend)
       ├── Health checks (12 retries × 5s)
       └── Image prune
```

### Security Architecture

| Layer | Implementation | Files |
|-------|---------------|-------|
| **Authentication** | JWT (`SECRET_KEY_JWT`) + Google OAuth + Azure MSAL SSO | `shipeasy-api/middleware/auth.js` |
| **Authorization** | Role-based with feature flags per org; route guards (Angular) | `shipeasy/src/app/Guard/`, schemas: `role`, `feature` |
| **Data isolation** | All queries scoped by `orgId` | `shipeasy-api/schema/schema.js` |
| **Transport encryption** | TLS at load balancer; optional AES-CBC request/response encryption | `shipeasy-api/middleware/requestTracer.js`, `shipeasy/src/app/services/api.interceptor.ts` |
| **API protection** | `x-api-key` header; auth-exempt routes listed in `restrictAuth` | `shipeasy-api/middleware/auth.js` |
| **CORS** | Currently permissive (`*`); `CORS_ORIGINS` env var defined | `shipeasy-api/index.js` |
| **File storage** | Azure Blob Storage with connection string auth | `shipeasy-api/controller/azureStorageContoller.js` |

### Observability

| Component | Tool | Details |
|-----------|------|---------|
| **Backend APM** | Elastic APM (`elastic-apm-node`) | Service: `shipeasy-api`, 100% sample rate, captures body/headers/errors |
| **Frontend RUM** | Elastic APM (`@elastic/apm-rum-angular`) | Service: `shipeasy-web`, trace IDs propagated via `frontend-trace-id` header |
| **Logging** | Winston + Pino | `logs/error.log`, `logs/combined.log`, JSON format, console output |
| **Health check** | `/health` endpoint | Used by `deploy.sh` for post-deploy verification |

---

## 4. Module Breakdown

### Backend Data Layer — 87 Mongoose Models

All models defined in `shipeasy-api/schema/schema.js` with `orgId` for tenant isolation.

| Domain | Models |
|--------|--------|
| **Shipment core** | `enquiry`, `quotation`, `batch`, `container`, `containerevent`, `instruction`, `milestone`, `carrierbooking`, `consolidationbooking` |
| **Documents** | `document`, `bl`, `shippingbill`, `entrybill`, `igm`, `egm`, `sof`, `freightcertificate`, `smartdocument`, `blscanning`, `invoicescanning` |
| **Finance** | `invoice`, `transaction`, `payment`, `creditdebitnote`, `tds`, `exchangerate`, `invoiceapproval`, `invoiceaction`, `tradefinance` |
| **Parties** | `partymaster`, `agent`, `branch`, `contact`, `employee`, `department`, `driver` |
| **Masters** | `port`, `location`, `vessel`, `voyage`, `product`, `uom`, `currency`, `currrate`, `costhead`, `costitem`, `costtemplate`, `taxtype`, `shippingline`, `containermaster`, `airportmaster`, `commodity` |
| **Warehouse** | `warehouse`, `grn`, `warehousedataentry`, `warehousebillofentry`, `warehousepacking`, `warehousedispatch`, `warehousegateinentry`, `warehousegateoutentry`, `inwardcontainerhandover`, `warehouseinward`, `warehousecontainer`, `surveyor`, `exbondbillentry` |
| **Communication** | `email`, `emailtemplate`, `message`, `groupchat`, `inappnotification`, `notificationmaster`, `batchnotification`, `whatsappshareddocument` |
| **Config/System** | `user`, `role`, `feature`, `menu`, `util`, `systemtype`, `custom`, `trigger`, `ratemaster`, `milestonemaster`, `holiday`, `reportconfig`, `schedulereport`, `jobautomation` |
| **Transport** | `air`, `rail`, `land`, `lorryreceipt`, `transportinquiry`, `transportmilestone` |
| **Audit/Misc** | `event`, `auditlog`, `logaudit`, `qr`, `faq`, `supportmsg`, `ticket`, `reminder`, `lineupactivity`, `igmcfs`, `igmmail`, `jobemail`, `filelog` |

### Backend Controller Layer

| Controller | File | Responsibility |
|-----------|------|---------------|
| **Azure Storage** | `controller/azureStorageContoller.js` | Upload/download/delete files from Azure Blob |
| **E-Invoicing** | `controller/eInvoicing.controller.js` | Zircon API integration for GST e-invoicing |
| **Email Reply** | `controller/emailReplyScheduler.js` | IMAP-based inbound email processing and parsing |
| **Helper** | `controller/helper.controller.js` | BL scanning (OpenAI), email sending (Nodemailer), misc utilities |
| **Jasper** | `controller/jasperController.js` | PDF report generation via Jasper Reports server |
| **Search** | `controller/search.controller.js` | Global search, Freightos rates, exchange rates, Gemini AI |
| **Storage** | `controller/storage.controller.js` | Azure Blob operations with Jasper integration |
| **Webhooks** | `controller/webhooks.controller.js` | OceanIO and external webhook processing |
| **WhatsApp** | `controller/whatsapp.controller.js` | WhatsApp Business API message handling |
| **Job Automation** | `controller/automations/jobautomation.controller.js` | Rule-based workflow automation with Gemini AI |

### Backend Background Processing — 16 Cron Jobs

| Schedule | Job | Description |
|----------|-----|-------------|
| `0 10 * * *` | Quotation expiry emails | Notify on expired quotations |
| `0 */12 * * *` | SI cut-off reminders | 12-hourly shipping instruction deadline alerts |
| `* * * * *` | IMAP email processing | Fetch and process unseen emails every minute |
| `* * * * *` | Reminder delivery | Send due reminders every minute |
| `0 0 * * *` | Trial expiration | Mark expired trials, disable users |
| `0 1 * * *` | Trial expiry alert | Notify 2 days before trial end |
| `0 2 * * *` | Quotation expiry marking | Flag expired quotations |
| `0 0 * * *` | Transport inquiry expiry | Flag expired transport inquiries |
| `0 */2 * * *` | Container tracking | ULIP API container position updates |
| `0 0 * * *` | WhatsApp doc cleanup | Delete docs older than 15 days from Azure |
| `0 * * * *` | Scheduled report emails | Hourly check for due report mailings |
| `0 9,11,13,15,18 * * *` | Daily task reminders | Pending task email alerts |
| `0 10 * * *` | Container return reminders | Container return date alerts |
| `0 7 * * *` | Agent follow-ups | Follow-up emails to agents |
| `0 */6 * * *` | POD arrival alerts | 48h before Port of Discharge arrival |
| `31 6 * * *` (UTC) | ETA status emails | 5-day ETA/MBL status notifications |

### Frontend Module Architecture

#### 30 Lazy-Loaded Feature Modules (under `/home`)

| Route | Module | Purpose |
|-------|--------|---------|
| `/home/dashboard` | `DashboardModule` | Charts, maps, KPIs |
| `/home/enquiry` | `EnquiryModule` | Enquiry CRUD |
| `/home/batch` | `BatchModule` | Job/batch management |
| `/home/finance` | `FinanceModule` | Invoices, payments |
| `/home/master` | `MasterModule` | Master data management |
| `/home/manifest` | `ManifestModule` | Manifest operations |
| `/home/register` | `SmartagentModule` | Agent registration/management |
| `/home/agent-advice` | `AgentAdviseModule` | Agent advice notes |
| `/home/configuration` | `ConfigurationModule` | Org configuration |
| `/home/scmtr` | `ScmtrModule` | SCMTR operations |
| `/home/egm` | `EgmModule` | Export General Manifest |
| `/home/igm` | `IgmModule` | Import General Manifest |
| `/home/smart-documents` | `SmartDocumentsModule` | AI document processing |
| `/home/carrier-bookings` | `CarrierBookingModule` | Carrier booking management |
| `/home/rate-finder` | `RateFinderModule` | Rate lookup and comparison |
| `/home/load-calc` | `LoadCalculatorModule` | Container load planning |
| `/home/address-book` | `PartyMasterModule` | Party/contact management |
| `/home/consolidation-booking` | `ConsolidationBookingModule` | LCL consolidation |
| `/home/lr` | `LorryBookingModule` | Lorry receipt management |
| `/home/warehouse` | `WareHouseModule` | Full warehouse operations |
| `/home/faq` | `FaqModule` | FAQ management |
| `/home/support` | `SupportModule` | Support tickets |
| `/home/payment-confirmation` | `PaymentConfirmationModule` | Payment confirmations |
| `/home/rfq` | `TransportModule` | Transport RFQ |
| `/home/customer` | `CustomerModule` | Customer self-service portal |
| `/home/release/manager` | `ReleaseManagerModule` | Release management |
| `/home/profile` | `UserPofileModule` | User profile |
| `/home/web-form` | `WebFormModule` | Public web forms |
| `/home/reports/st-reports` | `boldReportsModule` | Bold/Stimulsoft reports |
| `/home/not-found` | `PagenotfoundModule` | 404 page |

#### Shared Module — 50+ Reusable Components

The `shared/` module provides reusable UI for charges, invoices, payments, enquiries, batches, vendor bills, routes, ports, cost heads, activities, departments, users, roles, system types, shipping lines, vessels, voyages, and warehouse operations. Also provides:

- **7+ Pipes**: sorting, currency formatting, record filtering, label formatting, capitalization
- **7+ Directives**: sorting, access control, feature flags, back button, decimal input, clipboard, capitalize
- **4 Shared Services**: `CommonService`, `SharedService`, `SharedEventService`, `ApiSharedService`

---

## 5. Tech Stack

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Angular | 13.3.11 |
| Language | TypeScript | 4.6.4 |
| UI Components | Angular Material | 13.3.9 |
| UI Components | NG-Zorro Antd | 13.x |
| CSS Framework | Bootstrap 5 | 5.x |
| CSS Preprocessor | SCSS | — |
| Charts | ECharts, Chart.js, @swimlane/ngx-charts | — |
| Maps | Mapbox GL | — |
| Rich Text Editor | CKEditor 5 | — |
| PDF | jsPDF, ng2-pdf-viewer | — |
| Internationalization | @ngx-translate | — |
| Auth (SSO) | @azure/msal-browser, Google Identity Services | — |
| Real-Time | Socket.io Client | 4.x |
| APM | @elastic/apm-rum-angular | — |
| PWA | Firebase Cloud Messaging | — |
| Build Tool | Angular CLI, Yarn | — |
| Linting | ESLint (@angular-eslint) | — |
| Testing | Karma + Jasmine, Protractor (E2E) | — |
| Production Server | nginx:stable-alpine | — |

### Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22.x |
| Framework | Express | 4.18 |
| Database ODM | Mongoose | 8.x |
| Database | MongoDB | 6+ |
| Real-Time | Socket.io | 4.7 |
| Queue | BullMQ (Redis) | — |
| Scheduling | node-cron | 3.x |
| Auth | jsonwebtoken, google-auth-library | — |
| File Storage | @azure/storage-blob | 12.x |
| Email (outbound) | Nodemailer, SendInBlue API | — |
| Email (inbound) | imap-simple, imapflow, mailparser | — |
| AI | OpenAI SDK, @google/generative-ai (Gemini) | — |
| Reports | Jasper Reports (remote), ExcelJS, pdf-parse | — |
| API Docs | swagger-jsdoc + swagger-ui-express | — |
| Observability | elastic-apm-node, Winston, Pino | — |
| WhatsApp | Facebook Graph API | — |
| Testing | Jest 29, Supertest | — |

### Infrastructure & DevOps

| Layer | Technology |
|-------|-----------|
| Containerization | Docker (multi-stage builds) |
| Orchestration | Docker Compose 3.9 |
| CI/CD (primary) | Azure Pipelines |
| CI/CD (fallback) | GitHub Actions (manual) |
| Container Registry | Azure Container Registry (ACR) |
| Hosting | AWS EC2 |
| Reverse Proxy | nginx (gzip, SPA routing, WebSocket proxy) |
| Secrets Management | Azure DevOps Variable Groups (`shipeasy-secrets`) |
| Observability | Elastic APM (backend + frontend RUM) |
| Logging | Winston + Pino → `logs/` directory |

### External Service Integrations — 16 Services

| Service | Purpose | Config Location |
|---------|---------|----------------|
| Azure Blob Storage | Document and report file storage | `AZURE_STORAGE_CONNECTION_STRING` |
| Azure Container Registry | Docker image hosting | `ACR_NAME`, `ACR_SP_CLIENT_ID`, `ACR_SP_CLIENT_SECRET` |
| Redis | BullMQ email queue backend | `REDIS_HOST`, `REDIS_PORT` |
| Elastic APM | Full-stack performance monitoring | `APM_SERVER` |
| Jasper Reports Server | Server-side PDF report generation | `JASPER_URL`, `JASPER_Auth`, `JASPER_PATH` |
| ULIP Government API | Real-time container tracking (India) | `ULIP_SERVER_URL` |
| Zircon API | GST e-invoicing compliance (India) | `ZIRCON_URL_*`, `ZIRCON_CLIENT_*`, `ZIRCON_GSTIN` |
| Freightos API | Freight rate lookups | Hardcoded sandbox URL |
| WhatsApp Business API | Customer messaging via Facebook Graph | `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` |
| OpenAI API | BL document scanning / extraction | `OPENAI_API` |
| Google Gemini API | Invoice scanning, job automation intelligence | `GEMINI_API_KEY` |
| SMTP (Nodemailer) | Outbound transactional email | `EMAIL_SMTP`, `PASS_SMTP`, `SERVER_SMTP` |
| SendInBlue (Brevo) | Bulk/marketing email | `EMAIL_KEY` |
| IMAP | Inbound email reply processing | Same as SMTP creds |
| Google OAuth | SSO authentication | `OAUTHCLIENT` |
| Azure Active Directory | MSAL-based SSO authentication | `azureClientId`, `tenantId` (frontend env) |
| Firebase Cloud Messaging | Push notifications (PWA) | Firebase config (frontend env) |
| Exchange Rate API | Currency conversion rates | `CURRENCY_EXCHANGE_AUTHORIZATION` |
