# AGENTS.md

This file provides guidance for AI coding agents working in the Shippeasy SaaS monorepo.
It is divided into two parts: **Agent Guidelines** (coding conventions, commands, workflow rules)
and **Product & Architecture Analysis** (the output of the PM / Requirements / Architect agent workflow).

---

# Part 1 — Agent Guidelines

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

# Part 2 — Product & Architecture Analysis

*Generated by the Product Manager, Requirements Analyst, and System Architect agent workflow.*

---

## 1. Project Overview

**Shippeasy** is a full-stack, multi-tenant SaaS platform for logistics, freight forwarding, and shipping management. It serves freight forwarding agents, shipping lines, warehouse operators, and their end-customers (shippers/consignees) through a unified web application.

The platform digitizes the entire freight lifecycle — from enquiry and quotation, through booking and shipment execution, to invoicing, compliance documentation, and warehouse management. It supports ocean, air, rail, and land transport modes with real-time container tracking, automated milestone management, and regulatory compliance (EDI, e-Invoicing, IGM/EGM, shipping bills).

**Business model**: Multi-tenant SaaS with per-organization (`orgId`) data isolation. Includes a trial period with automatic expiration and user disabling. Supports customer self-service portals alongside full agent/admin back-offices.

**Key differentiators**:
- End-to-end freight lifecycle management in a single platform
- Multi-modal transport support (ocean, air, rail, land)
- AI-powered document scanning (BL scanning, invoice scanning via OpenAI/Gemini)
- Real-time container tracking via ULIP government API integration
- Integrated warehouse management system
- WhatsApp Business API integration for customer communication
- Automated workflows and triggers for email, notifications, and report generation

---

## 2. Feature List

### Core Business Modules

| Module | Description |
|--------|-------------|
| **Enquiry Management** | Create, track, and manage freight enquiries with route details, shipper/consignee info |
| **Quotation Management** | Generate quotations from enquiries; auto-expiry; rate calculation; status tracking |
| **Batch/Job Management** | Central job execution unit linking containers, documents, invoices, milestones |
| **Container Management** | Track containers by number; real-time location via ULIP; event logging |
| **Booking Management** | Carrier bookings, consolidation bookings, shipping instructions (SI) |
| **Document Management** | Upload, store (Azure Blob), download documents per batch; BL generation |
| **Invoice & Finance** | Create invoices, payments, credit/debit notes, TDS; Tally integration |
| **E-Invoicing** | Push invoices to Zircon for GST e-invoicing compliance |
| **EDI** | Generate EDI files for electronic data interchange |
| **Shipping Bills** | Generate and manage shipping bills for customs |
| **IGM/EGM** | Import/Export General Manifest processing; CFS operations; IMAP-based mail parsing |
| **Bill of Lading** | BL creation, scanning (AI), telex release tracking |
| **Load Planning** | Container load calculation and planning tools |
| **Warehouse Management** | Inward, outward, gate entries, packing, dispatch, bill of entry, container handover, surveyor reports |
| **Rate Management** | Rate masters, Freightos API integration, exchange rate lookups |

### Communication & Notifications

| Feature | Description |
|---------|-------------|
| **Email** | SMTP/SendInBlue email sending; IMAP email reply processing; batch email; scheduled reports |
| **WhatsApp** | WhatsApp Business API via Facebook Graph; document sharing; webhook processing |
| **In-App Notifications** | Real-time notifications via Socket.io; notification masters per org |
| **Chat** | Real-time messaging via Socket.io; group chats |
| **Reminders** | Scheduled reminders per batch with user targeting |

### User & Organization Management

| Feature | Description |
|---------|-------------|
| **Multi-Tenant Orgs** | Agent (organization) setup with branches, departments, employees |
| **User Management** | Roles, features (permissions), menu configuration per org |
| **Authentication** | JWT, Google OAuth, Azure MSAL SSO |
| **Customer Portal** | Self-service dashboard for shippers with quotation and shipment views |
| **Onboarding** | Agent onboarding flow; trial period management |

### Reporting & Analytics

| Feature | Description |
|---------|-------------|
| **Dashboard** | Metrics, charts (ECharts, ngx-charts), Mapbox container maps |
| **Jasper Reports** | Server-side PDF report generation via Jasper Reports |
| **Scheduled Reports** | Cron-driven report emails with configurable schedules |
| **Custom Reports** | Order reports with Azure Blob storage |
| **Credit Reports** | Customer credit assessment |

### AI & Automation

| Feature | Description |
|---------|-------------|
| **BL Scanning** | AI-powered Bill of Lading document parsing (OpenAI) |
| **Invoice Scanning** | AI-powered invoice data extraction (Gemini) |
| **Job Automation** | Rule-based automations triggered by entity events |
| **Triggers** | Configurable triggers on entity lifecycle (email, report, notification) |
| **Smart Documents** | AI-assisted document processing |

### Infrastructure Features

| Feature | Description |
|---------|-------------|
| **Real-Time Updates** | Socket.io for live data synchronization across clients |
| **QR Codes** | Dynamic QR generation for batches and warehouses |
| **Internationalization** | ngx-translate with EN, FR, Mandarin support |
| **PWA** | Firebase Cloud Messaging support; installable web app |
| **Elastic APM** | Full-stack observability (backend + frontend RUM) |
| **Global Search** | Cross-entity search functionality |

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
4. **Express** authenticates via JWT (or Google OAuth), resolves user/org context
5. **Business logic** in controllers/services reads/writes MongoDB via Mongoose
6. **File operations** go through Azure Blob Storage
7. **Real-time events** are broadcast via Socket.io to connected clients
8. **Background jobs** run via node-cron schedulers (email, tracking, expiry, reports)
9. **Email queue** processed by BullMQ workers backed by Redis

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
       ├── ACR login
       ├── Pull new images
       ├── Rolling restart (backend then frontend)
       ├── Health checks (12 retries × 5s)
       └── Image prune
```

### Security Architecture

| Layer | Implementation |
|-------|---------------|
| **Authentication** | JWT (`SECRET_KEY_JWT`) + Google OAuth + Azure MSAL SSO |
| **Authorization** | Role-based with feature flags per org; route guards (Angular); `validateAuth` middleware (Express) |
| **Data isolation** | All queries scoped by `orgId` |
| **Transport** | TLS termination at load balancer; optional AES-CBC request/response encryption |
| **API protection** | `x-api-key` header; auth-exempt routes explicitly listed in `restrictAuth` array |
| **CORS** | Currently permissive (`*`); `CORS_ORIGINS` env var defined but not enforced |
| **File storage** | Azure Blob Storage with connection string auth |

### Observability

| Component | Tool | Details |
|-----------|------|---------|
| **Backend APM** | Elastic APM (`elastic-apm-node`) | Service: `shipeasy-api`, 100% sample rate, captures body/headers/errors |
| **Frontend RUM** | Elastic APM (`@elastic/apm-rum-angular`) | Service: `shipeasy-web`, trace IDs propagated via `frontend-trace-id` header |
| **Logging** | Winston + Pino | `logs/error.log`, `logs/combined.log`, JSON format, console output |
| **Health check** | `/health` endpoint | Used by `deploy.sh` for post-deploy verification |

---

## 4. Module Breakdown

### Backend Modules

#### Schemas (87 Mongoose Models)

The data layer is defined in `shipeasy-api/schema/schema.js` with a single-file, multi-model pattern. All models use `orgId` for tenant isolation. Key domain model groups:

| Domain | Models |
|--------|--------|
| **Shipment core** | `enquiry`, `quotation`, `batch`, `container`, `containerevent`, `instruction`, `milestone`, `carrierbooking`, `consolidationbooking` |
| **Documents** | `document`, `bl`, `shippingbill`, `entrybill`, `igm`, `egm`, `sof`, `freightcertificate`, `smartdocument`, `blscanning`, `invoicescanning` |
| **Finance** | `invoice`, `transaction`, `payment`, `creditdebitnote`, `tds`, `exchangerate`, `invoiceapproval`, `invoiceaction`, `tradefinance` |
| **Parties** | `partymaster`, `agent`, `branch`, `contact`, `employee`, `department`, `driver` |
| **Masters** | `port`, `location`, `vessel`, `voyage`, `product`, `uom`, `currency`, `currrate`, `costhead`, `costitem`, `costtemplate`, `taxtype`, `shippingline`, `containermaster`, `airportmaster`, `commodity` |
| **Warehouse** | `warehouse`, `grn`, `warehousedataentry`, `warehousebillofentry`, `warehousepacking`, `warehousedispatch`, `warehousegateinentry`, `warehousegateoutentry`, `inwardcontainerhandover`, `warehouseinward`, `warehousecontainer`, `surveyor`, `exbondbillentry` |
| **Communication** | `email`, `emailtemplate`, `message`, `groupchat`, `inappnotification`, `notificationmaster`, `batchnotification`, `whatsappshareddocument` |
| **Config/System** | `user`, `role`, `feature`, `menu`, `util`, `systemtype`, `custom`, `trigger`, `ratemaster`, `milestone master`, `holiday`, `reportconfig`, `schedulereport`, `jobautomation` |
| **Transport** | `air`, `rail`, `land`, `lorryreceipt`, `transportinquiry`, `transportmilestone` |
| **Misc** | `event`, `auditlog`, `logaudit`, `qr`, `faq`, `supportmsg`, `ticket`, `reminder`, `lineupactivity`, `igmcfs`, `igmmail`, `jobemail`, `filelog` |

#### API Layer

Single router file (`router/route.js`) mounted at `/api` with ~60 explicit endpoints plus a **dynamic CRUD system**:

- `POST /api/:indexName` — insert
- `POST /api/search/:indexName/:id?` — read/search
- `PUT /api/:indexName/:id` — update
- `DELETE /api/:indexName/:id` — delete
- `POST /api/:indexName/batchinsert` — bulk insert
- `PUT /api/:indexName/batchupdate` — bulk update

The `indexName` maps directly to any Mongoose model name in `schema.js` (except `logaudit`), validated by `checkIndex` middleware.

#### Controllers (`controller/`)

Business logic is organized by domain: `azureStorageContoller.js`, `eInvoicing.controller.js`, `emailReplyScheduler.js`, `helper.controller.js`, `jasperController.js`, `search.controller.js`, `storage.controller.js`, `webhooks.controller.js`, `whatsapp.controller.js`, and `automations/jobautomation.controller.js`.

#### Background Processing

**16 cron jobs** in `service/schedulers.js` handle:
- Quotation/transport inquiry expiry
- Trial period management (expire + alert 2 days before)
- Container tracking via ULIP (every 2 hours)
- Email reply processing via IMAP (every minute)
- Reminder delivery (every minute)
- Scheduled report emails (hourly)
- Daily task reminders, container return alerts, follow-up emails
- ETA/arrival alerts (48h and 5-day windows)
- WhatsApp document cleanup (daily, 15-day retention)

**BullMQ** email queue backed by Redis for async email delivery.

**IMAP listeners** for IGM/CFS/BL Telex mail parsing per agent.

### Frontend Modules

#### App Shell (`layout/`)

The layout module provides the application shell (header, nav, footer) and hosts all authenticated routes. Login, registration, password reset live here alongside lazy-loaded feature modules.

#### Lazy-Loaded Feature Modules (under `/home`)

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
| `/home/customer` | `CustomerModule` | Customer self-service portal (guarded) |
| `/home/release/manager` | `ReleaseManagerModule` | Release management |
| `/home/profile` | `UserPofileModule` | User profile |
| `/home/web-form` | `WebFormModule` | Public web forms |
| `/home/reports/st-reports` | `boldReportsModule` | Bold/Stimulsoft reports |

#### Shared Module (`shared/`)

Contains 50+ reusable components for charges, invoices, payments, enquiries, batches, vendor bills, routes, ports, cost heads, activities, departments, users, roles, system types, shipping lines, vessels, voyages, and warehouse operations. Also provides:

- **Pipes**: sorting, currency formatting, record filtering, label formatting, capitalization
- **Directives**: sorting, access control, feature flags, back button, decimal input, clipboard, capitalize
- **Services**: `CommonService`, `SharedService`, `SharedEventService`, `ApiSharedService`

#### Auth Architecture

| Provider | Status | Flow |
|----------|--------|------|
| **Username/Password** | Active | `POST /api/user/login` → JWT → localStorage |
| **Google OAuth** | Active | Google Identity Services → ID token → backend verification |
| **Azure MSAL** | Active | `@azure/msal-browser` popup login → token → backend verification |
| **AWS Cognito** | Configured, unused | Environment vars set; code commented out |

**Guards**: `AuthGuard` (agent routes), `AuthGuardLoginGuard` (redirect if authenticated), `AuthGuardCustomer` (customer routes).

**Interceptor**: `ApiInterceptor` adds `Authorization`, `x-api-key`, `frontend-trace-id`; handles optional request/response encryption; injects `orgId`; triggers logout modal on 401.

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
| CSS Preprocessor | SCSS | - |
| Charts | ECharts, Chart.js, @swimlane/ngx-charts | - |
| Maps | Mapbox GL | - |
| Rich Text Editor | CKEditor 5 | - |
| PDF | jsPDF, ng2-pdf-viewer | - |
| Internationalization | @ngx-translate | - |
| Auth (SSO) | @azure/msal-browser, Google Identity Services | - |
| Real-Time | Socket.io Client | 4.x |
| APM | @elastic/apm-rum-angular | - |
| PWA | Firebase Cloud Messaging | - |
| Build Tool | Angular CLI, Yarn | - |
| Linting | ESLint (@angular-eslint) | - |
| Testing | Karma + Jasmine, Protractor (E2E) | - |
| Production Server | nginx:stable-alpine | - |

### Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22.x |
| Framework | Express | 4.18 |
| Database ODM | Mongoose | 8.x |
| Database | MongoDB | 6+ |
| Real-Time | Socket.io | 4.7 |
| Queue | BullMQ (Redis) | - |
| Scheduling | node-cron | 3.x |
| Auth | jsonwebtoken, google-auth-library | - |
| File Storage | @azure/storage-blob | 12.x |
| Email (outbound) | Nodemailer, SendInBlue API | - |
| Email (inbound) | imap-simple, imapflow, mailparser | - |
| AI | OpenAI SDK, @google/generative-ai (Gemini) | - |
| Reports | Jasper Reports (remote), ExcelJS, pdf-parse | - |
| API Docs | swagger-jsdoc + swagger-ui-express | - |
| Observability | elastic-apm-node, Winston, Pino | - |
| WhatsApp | Facebook Graph API | - |
| Testing | Jest 29, Supertest | - |

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

### External Service Integrations

| Service | Purpose |
|---------|---------|
| Azure Blob Storage | Document and report file storage |
| Azure Container Registry | Docker image hosting |
| Redis | BullMQ email queue backend |
| Elastic APM | Full-stack performance monitoring |
| Jasper Reports Server | Server-side PDF report generation |
| ULIP Government API | Real-time container tracking (India) |
| Zircon API | GST e-invoicing compliance (India) |
| Freightos API | Freight rate lookups |
| WhatsApp Business API | Customer messaging via Facebook Graph |
| OpenAI API | BL document scanning / extraction |
| Google Gemini API | Invoice scanning, job automation intelligence |
| SMTP / SendInBlue (Brevo) | Outbound transactional email |
| IMAP servers | Inbound email reply processing |
| Google OAuth | SSO authentication |
| Azure Active Directory | MSAL-based SSO authentication |
| Firebase Cloud Messaging | Push notifications (PWA) |
