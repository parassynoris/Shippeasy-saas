# Shippeasy — Multi-Agent SDLC Analysis Report

**Generated**: 2026-03-06
**Repository**: Shippeasy Monorepo
**Analysis Scope**: Full SDLC — 14 Specialized Agents

---

## Table of Contents

1. [Product Vision (Agent 1: Product Manager)](#1-product-vision)
2. [System Requirements (Agent 2: Requirements Analyst)](#2-system-requirements)
3. [Architecture Design (Agent 3: System Architect)](#3-architecture-design)
4. [Database Design (Agent 4: Database Architect)](#4-database-design)
5. [UI/UX Design (Agent 5: UI/UX Designer)](#5-uiux-design)
6. [Backend Architecture (Agent 6: Backend Developer)](#6-backend-architecture)
7. [Frontend Architecture (Agent 7: Frontend Developer)](#7-frontend-architecture)
8. [Security Architecture (Agent 8: Security Engineer)](#8-security-architecture)
9. [Performance Optimization (Agent 9: Performance Engineer)](#9-performance-optimization)
10. [Testing Strategy (Agent 10: QA/Test Automation)](#10-testing-strategy)
11. [DevOps / CI-CD Architecture (Agent 11: DevOps Engineer)](#11-devops--ci-cd-architecture)
12. [SaaS Platform Design (Agent 12: SaaS Platform Architect)](#12-saas-platform-design)
13. [Code Quality Report (Agent 13: Code Reviewer)](#13-code-quality-report)
14. [Documentation & Refactoring Plan (Agent 14: Documentation)](#14-documentation--refactoring-plan)

---

# 1. Product Vision

**Agent**: Product Manager

## 1.1 Purpose

Shippeasy is a full-stack, multi-tenant SaaS platform for logistics, freight forwarding, and shipping management. It digitizes the entire freight lifecycle — from enquiry and quotation, through booking and shipment execution, to invoicing, compliance documentation, and warehouse management.

## 1.2 Target Users & Personas

| Persona | Role | Pain Points Solved |
|---------|------|--------------------|
| **Freight Agent (Primary)** | Manages full shipment lifecycle — enquiries, quotations, bookings, invoices | Replaces manual spreadsheets, emails, and disparate tools with a single platform |
| **Operations Manager** | Oversees milestones, container tracking, team performance | Real-time dashboards, automated milestone alerts, container tracking via ULIP |
| **Finance Controller** | Manages invoicing, payments, credit/debit notes, TDS compliance | GST e-invoicing via Zircon, Tally integration, automated transaction tracking |
| **Warehouse Operator** | Handles inward/outward, gate entries, packing, dispatch | Integrated WMS with QR codes, surveyor reports, container handover workflows |
| **Shipper/Consignee (Customer)** | Requests quotations, tracks shipments, accesses documents | Self-service customer portal with real-time visibility |
| **Super Admin** | Platform administration, tenant management, feature flags | Multi-tenant configuration, trial management, org-level feature control |

## 1.3 Product Differentiators

1. **End-to-end lifecycle**: Enquiry → Quotation → Booking → Shipment → Invoice → Compliance in one platform
2. **Multi-modal**: Ocean, air, rail, and land transport support
3. **AI-powered**: BL scanning (OpenAI), invoice scanning (Gemini), job automation
4. **Real-time tracking**: ULIP government API integration for container geolocation
5. **Integrated WMS**: Full warehouse management with QR-based operations
6. **Communication hub**: WhatsApp Business API, email (SMTP + IMAP), in-app chat (Socket.io)
7. **India compliance**: GST e-invoicing, IGM/EGM, shipping bills, EDI

## 1.4 Product Roadmap

| Phase | Focus | Priority |
|-------|-------|----------|
| **Phase 1 (Current)** | Core stabilization — fix security gaps, test coverage, RBAC enforcement | Critical |
| **Phase 2** | Subscription & billing — Stripe/Razorpay integration, usage metering, plan tiers | High |
| **Phase 3** | Advanced AI — predictive rate optimization, automated document classification | High |
| **Phase 4** | Marketplace — carrier rate marketplace, multi-carrier booking | Medium |
| **Phase 5** | Mobile app — React Native companion app for field operations | Medium |
| **Phase 6** | Analytics platform — business intelligence, custom report builder | Low |

---

# 2. System Requirements

**Agent**: Requirements Analyst

## 2.1 Software Requirements Specification (SRS)

### Functional Requirements

| ID | Requirement | Module | Priority |
|----|-------------|--------|----------|
| FR-001 | System shall allow users to create, edit, and track freight enquiries with multi-modal route details | Enquiry | Critical |
| FR-002 | System shall generate quotations from enquiries with auto-expiry and status tracking | Quotation | Critical |
| FR-003 | System shall manage shipment batches/jobs linking containers, documents, invoices, and milestones | Batch | Critical |
| FR-004 | System shall track containers in real-time via ULIP API with event logging | Container | High |
| FR-005 | System shall support carrier booking and consolidation booking workflows | Booking | High |
| FR-006 | System shall store and serve documents via Azure Blob Storage with access control | Documents | Critical |
| FR-007 | System shall generate invoices with GST e-invoicing compliance via Zircon API | Finance | Critical |
| FR-008 | System shall process payments with credit/debit notes and TDS tracking | Finance | High |
| FR-009 | System shall provide warehouse management (inward, outward, gate entry, packing, dispatch) | Warehouse | High |
| FR-010 | System shall support AI-powered BL scanning and invoice scanning | AI | Medium |
| FR-011 | System shall send notifications via email, WhatsApp, and in-app channels | Communication | High |
| FR-012 | System shall enforce multi-tenant data isolation via orgId | Security | Critical |
| FR-013 | System shall support JWT + Google OAuth + Azure MSAL SSO authentication | Auth | Critical |
| FR-014 | System shall generate EDI files and shipping bills for customs compliance | Compliance | High |
| FR-015 | System shall provide dashboards with charts, maps, and KPIs | Dashboard | Medium |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | API response time < 500ms for 95th percentile | Performance |
| NFR-002 | System uptime > 99.5% | Availability |
| NFR-003 | Support 1000+ concurrent users per tenant | Scalability |
| NFR-004 | All data encrypted at rest and in transit | Security |
| NFR-005 | OWASP Top 10 compliance | Security |
| NFR-006 | Support English, French, and Mandarin | i18n |
| NFR-007 | Mobile-responsive PWA with offline capabilities | UX |
| NFR-008 | Audit trail for all data modifications | Compliance |

## 2.2 User Stories (Selected)

### US-001: Freight Enquiry Creation

**As a** freight agent, **I want to** create an enquiry with shipper, consignee, route, and cargo details, **so that** I can begin the quotation process.

**Acceptance Criteria:**
- Agent can select transport mode (ocean, air, rail, land)
- System captures origin/destination ports, shipping line, vessel/voyage
- Enquiry receives a unique enquiry number
- Enquiry appears in the enquiry list filtered by orgId
- Audit log records the creation event

### US-002: Quotation Generation

**As a** freight agent, **I want to** generate a quotation from an enquiry with buy/sell rates, **so that** I can present pricing to the customer.

**Acceptance Criteria:**
- Quotation links to source enquiry
- Rates can be entered manually or fetched from Freightos API
- Quotation has configurable validity period (validFrom/validTo)
- System auto-marks quotations as expired after validTo date (cron: `0 2 * * *`)
- Customer can accept/reject via unauthenticated link (`/api/quotation/update/:id/:status`)

### US-003: Container Tracking

**As an** operations manager, **I want to** track container locations in real-time, **so that** I can provide accurate ETAs to customers.

**Acceptance Criteria:**
- Containers tracked via ULIP API every 2 hours (cron: `0 */2 * * *`)
- Container events logged with timestamps
- Dashboard shows container locations on Mapbox map
- 48-hour POD arrival alerts sent automatically (cron: `0 */6 * * *`)

### US-004: GST E-Invoicing

**As a** finance controller, **I want to** push invoices to the GST e-invoicing system, **so that** the company remains tax-compliant.

**Acceptance Criteria:**
- Invoice data pushed to Zircon API
- IRN (Invoice Reference Number) stored on success
- Cancellation supported within permitted time window
- E-invoicing errors displayed to the user with retry option

### US-005: Warehouse Inward/Outward

**As a** warehouse operator, **I want to** manage goods receipt, storage, and dispatch, **so that** warehouse operations are tracked digitally.

**Acceptance Criteria:**
- Gate entry records vehicle, driver, container details
- GRN (Goods Receipt Note) links to containers
- Packing and dispatch workflows with QR code support
- Bill of entry and surveyor report generation

---

# 3. Architecture Design

**Agent**: System Architect

## 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AWS EC2 Instance                          │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  nginx:80         │  │  Express API     │  │  MongoDB 6       │  │
│  │  Angular SPA      │──│  :3000           │──│  mongo_data vol  │  │
│  │  Static Files     │  │  Socket.io       │  │                  │  │
│  │  /api → proxy     │  │  16 Cron Jobs    │  └──────────────────┘  │
│  │  WebSocket proxy  │  │  BullMQ Workers  │                        │
│  └──────────────────┘  └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
                │                    │
                │    ┌───────────────┼───────────────────────┐
                │    │               │                       │
                ▼    ▼               ▼                       ▼
         Azure Blob      Redis (BullMQ)        Elastic APM Server
         Storage          Email Queue          (Observability)
                │
    ┌───────────┼───────────────────────────────────────┐
    │           │                                       │
    ▼           ▼              ▼               ▼        ▼
  ULIP API   Zircon API   WhatsApp API   OpenAI API  Gemini API
  (Tracking) (e-Invoice)  (Facebook)     (BL Scan)   (Invoice Scan)
    │           │
    ▼           ▼
  Jasper     Freightos      SMTP/IMAP       Google OAuth
  Reports    (Rates)        (Email)         Azure MSAL
```

## 3.2 Architecture Layers

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| **Presentation** | Angular 13 SPA (nginx) | UI rendering, routing, state management |
| **API Gateway** | nginx reverse proxy | TLS termination, static serving, WebSocket upgrade |
| **Application** | Express.js + Socket.io | Business logic, authentication, real-time events |
| **Data Access** | Mongoose 8 ODM | Schema definitions, audit hooks, query building |
| **Persistence** | MongoDB 6 | Document storage, tenant-isolated collections |
| **Queue** | BullMQ + Redis | Async email processing |
| **Scheduler** | node-cron (16 jobs) | Background tasks (tracking, expiry, notifications) |
| **Storage** | Azure Blob Storage | Document and report file storage |
| **Observability** | Elastic APM + Winston + Pino | APM, structured logging, trace correlation |

## 3.3 Request Flow

1. Browser loads Angular SPA from nginx (port 80)
2. API calls hit `/api/*` → nginx reverse-proxies to Express (port 3000)
3. WebSocket connections (Socket.io) proxied with upgrade support
4. Express middleware chain: Helmet → CORS → Rate Limiter → JSON Parser → Mongo Sanitize → HPP → Request Tracer → Auth → Tenant Isolation → Controller
5. Controllers read/write MongoDB via Mongoose; all queries scoped by `orgId`
6. File operations go through Azure Blob Storage
7. Real-time events broadcast via Socket.io (`data-change`, `inAppNotification`, `messages`)
8. Background jobs run via 16 node-cron schedulers
9. Email queue processed by BullMQ workers backed by Redis

## 3.4 Module Breakdown

### Backend Modules

| Module | Files | Responsibility |
|--------|-------|----------------|
| **Router** | `router/route.js` (~5890 lines) | All API route definitions |
| **Schema** | `schema/schema.js` (~9114 lines) | 87 Mongoose schemas with audit hooks |
| **Middleware** (7 files) | `middleware/*.js` | Auth, security, validation, tenant isolation, error handling |
| **Controllers** (23 files) | `controller/*.js` | Business logic per domain |
| **Services** (9 files) | `service/*.js`, `services/*.js` | Background jobs, Socket.io, notifications, triggers |
| **Workers** (2 files) | `worker/*.js` | Cron workers, email queue workers |

### Frontend Modules

| Module Type | Count | Examples |
|-------------|-------|---------|
| **Lazy-Loaded Features** | 30 | Dashboard, Enquiry, Batch, Finance, Warehouse |
| **Shared Components** | 100+ | Charges, Invoice, Document, Port, Vessel, Milestone |
| **Services** | 15+ | ApiInterceptor, CognitoService, CommonFunctions |
| **Guards** | 4 | AuthGuard, AuthGuardCustomer, AuthGuardLoginGuard, OrgSettingGuard |
| **Pipes** | 15+ | OrderBy, Currency, Filter, Capitalize |
| **Directives** | 8+ | Sort, AccessControl, AccessFeature, DecimalInput |
| **Models** | 51 | TypeScript interfaces for all entities |

## 3.5 Architecture Issues Found

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **Monolithic route file** | High | `route.js` is ~5890 lines; split into domain-specific route files |
| **Monolithic schema file** | High | `schema.js` is ~9114 lines; split into per-domain schema files |
| **No service layer** | High | Controllers contain business logic directly; extract a service layer |
| **Single EC2 deployment** | High | No high availability; single point of failure |
| **Tight coupling** | Medium | `helper.controller.js` exports schemas used by other controllers |
| **No message broker** | Medium | Direct cron jobs instead of event-driven architecture |
| **Mixed UI frameworks** | Medium | Angular Material + NG-Zorro + Bootstrap + ng-bootstrap creates inconsistency |
| **No API versioning** | Medium | All routes at `/api/`; no version prefix for backward compatibility |

---

# 4. Database Design

**Agent**: Database Architect

## 4.1 Schema Overview

The database contains **87 Mongoose models** defined in `shipeasy-api/schema/schema.js`. All tenant-specific collections include `orgId` for data isolation. Common audit fields: `createdOn`, `createdBy`, `updatedOn`, `updatedBy`.

## 4.2 Entity Relationship Diagram (Text)

```
                    ┌─────────┐
                    │  agent  │ (Organization/Tenant)
                    │ agentId │
                    └────┬────┘
                         │ 1:N
        ┌────────────────┼────────────────────┐
        │                │                    │
   ┌────┴────┐     ┌─────┴─────┐       ┌─────┴─────┐
   │  user   │     │  branch   │       │ employee  │
   │ userId  │     │ branchId  │       │employeeId │
   │ orgId   │     │ orgId     │       │ orgId     │
   └────┬────┘     └───────────┘       └───────────┘
        │
        │ creates
        ▼
   ┌──────────┐    1:N    ┌───────────┐    1:N    ┌───────────┐
   │ enquiry  │──────────▶│ quotation │──────────▶│   batch   │
   │enquiryId │           │quotationId│           │  batchId  │
   │ orgId    │           │ orgId     │           │  orgId    │
   └──────────┘           └───────────┘           └─────┬─────┘
                                                        │
                    ┌───────────────┬───────────────┬────┼───────────────┐
                    │               │               │    │               │
              ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴┴────┐  ┌─────────┴────┐
              │ container │  │ document  │  │  invoice  │  │  milestone   │
              │containerId│  │documentId │  │ invoiceId │  │ milestoneId  │
              │  batchId  │  │  batchId  │  │  batchId  │  │   batchId    │
              └─────┬─────┘  └───────────┘  └─────┬─────┘  └──────────────┘
                    │                             │
              ┌─────┴──────┐               ┌──────┴──────┐
              │ container  │               │ transaction │
              │   event    │               │transactionId│
              │  batchId   │               │  invoiceId  │
              └────────────┘               └──────┬──────┘
                                                  │
                                            ┌─────┴─────┐
                                            │  payment  │
                                            │ paymentId │
                                            │ invoiceId │
                                            └───────────┘

   ┌──────────────┐     ┌───────────────┐     ┌─────────────┐
   │    bl        │     │carrier booking│     │  instruction│
   │   blId       │     │carrierbookingId│    │instructionId│
   │  batchId     │     │   batchId     │     │   batchId   │
   └──────────────┘     └───────────────┘     └─────────────┘

   ┌──────────────┐     ┌──────────────┐      ┌─────────────┐
   │  warehouse   │     │    igm       │      │    egm      │
   │ warehouseId  │     │   igmId      │      │   egmId     │
   │   orgId      │     │  batchId     │      │  batchId    │
   └──────────────┘     └──────────────┘      └─────────────┘
```

## 4.3 Domain-Grouped Collections

### Core Shipment (11 models)

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| `enquiry` | enquiryId, orgId, shipperId, consigneeId, transportMode | → quotation, → batch |
| `enquiryitem` | enquiryitemId, enquiryId, orgId | → enquiry |
| `quotation` | quotationId, orgId, enquiryNo, quoteStatus, validFrom, validTo | → enquiry, → batch |
| `batch` | batchId, orgId, statusOfBatch, branchId | → containers, documents, invoices, milestones |
| `container` | containerId, batchId, containerNumber, orgId | → batch, → containerevents |
| `containerevent` | containereventId, batchId, containerNumber | → container |
| `containermaster` | containermasterId, orgId | Reference data |
| `instruction` | instructionId, batchId | → batch (Shipping Instructions) |
| `milestone` | milestoneId, batchId | → batch |
| `carrierbooking` | carrierbookingId, batchId, orgId | → batch |
| `consolidationbooking` | consolidationbookingId, orgId | LCL bookings |

### Finance (9 models)

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| `invoice` | invoiceId, batchId, orgId, createdOn | → batch, → transactions |
| `transaction` | transactionId, orgId, batchId, invoiceId | → invoice |
| `payment` | paymentId, invoiceId, orgId | → invoice |
| `creditdebitnote` | creditdebitnoteId, orgId | Financial adjustments |
| `tds` | tdsId, orgId | Tax Deducted at Source |
| `exchangerate` | exchangerateId | Currency conversion |
| `invoiceapproval` | invoiceapprovalId, orgId | Approval workflows |
| `invoiceaction` | invoiceactionId | Invoice lifecycle actions |
| `tradefinance` | tradefinanceId, orgId | Trade finance documents |

### Warehouse (13 models)

| Model | Key Fields |
|-------|-----------|
| `warehouse` | warehouseId, orgId |
| `grn` | grnId, orgId |
| `warehousedataentry` | warehousedataentryId, orgId |
| `warehousebillofentry` | warehousebillofentryId, orgId |
| `warehousepacking` | warehousepackingId, orgId |
| `warehousedispatch` | warehousedispatchId, orgId |
| `warehousegateinentry` | warehousegateinentryId, orgId |
| `warehousegateoutentry` | warehousegateoutentryId, orgId |
| `inwardcontainerhandover` | inwardcontainerhandoverId, orgId |
| `warehouseinward` | warehouseinwardId, orgId |
| `warehousecontainer` | warehousecontainerId, orgId |
| `surveyor` | surveyorId, orgId |
| `exbondbillentry` | exbondbillentryId, orgId |

### Documents (12 models)

`document`, `bl`, `blscanning`, `invoicescanning`, `shippingbill`, `entrybill`, `igm`, `egm`, `sof`, `freightcertificate`, `smartdocument`, `deliveryorder`

### Masters (15 models)

`port`, `location`, `voyage`, `vessel`, `product`, `uom`, `currency`, `currrate`, `costhead`, `costitem`, `costtemplate`, `taxtype`, `shippingline`, `commodity`, `airportmaster`

### Geography (3 models — tenant-exempt)

`country`, `state`, `city`

### Communication (8 models)

`email`, `emailtemplate`, `message`, `groupchat`, `inappnotification`, `notificationmaster`, `batchnotification`, `whatsappshareddocument`

### User & Config (14 models)

`user`, `role`, `feature`, `menu`, `util`, `systemtype`, `custom`, `agent`, `agentadvice`, `trigger`, `ratemaster`, `milestonemaster`, `holiday`, `reportconfig`, `schedulereport`, `jobautomation`

### Transport (6 models)

`air`, `rail`, `land`, `lorryreceipt`, `transportinquiry`, `transportmilestone`

### Audit & Misc (13 models)

`event`, `auditlog`, `logaudit`, `qr`, `faq`, `supportmsg`, `ticket`, `reminder`, `lineupactivity`, `igmcfs`, `igmmail`, `jobemail`, `filelog`

## 4.4 Indexing Strategy

**File**: `shipeasy-api/schema/indexes.js` — 60+ indexes across 25 collections.

| Collection | Indexes | Rationale |
|-----------|---------|-----------|
| `users` | `userLogin` (unique, sparse), `userEmail` (sparse), `orgId+userStatus`, `orgId+userType`, `tokenVersion` | Auth lookups, tenant-scoped user queries |
| `batchs` | `batchId` (unique), `orgId`, `orgId+statusOfBatch`, `orgId+createdOn` | Core entity; frequent filtering by status and date |
| `invoices` | `invoiceId` (unique), `orgId`, `batchId`, `orgId+createdOn` | Financial queries by batch and date range |
| `containers` | `containerId` (unique), `batchId`, `containerNumber`, `orgId` | Tracking lookups by number and batch |
| `logaudits` | `resource+resourceId`, `recordedOn`, `traceId` | Audit trail queries |
| `triggers` | `triggerId` (unique), `entityType+triggerPoint`, `orgId` | Trigger evaluation per entity lifecycle |

All indexes created with `background: true` to avoid blocking production queries.

## 4.5 Database Issues & Recommendations

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **No schema validation** | High | Mongoose schemas are schema-less (all fields optional except IDs); add field-level validation |
| **Date fields as String** | High | `createdOn`, `validTo`, etc. are `String` type; use `Date` type for proper queries and indexing |
| **No TTL indexes** | Medium | Add TTL indexes for `inappnotifications`, `logaudits`, `whatsappshareddocuments` |
| **Missing compound indexes** | Medium | Add `orgId+batchId` compound index on `containers`, `documents`, `invoices` for tenant-scoped batch queries |
| **No text indexes** | Medium | Add text indexes for `globalSearch` queries on `batch`, `enquiry`, `partymaster` |
| **Plural collection names** | Low | Mongoose auto-pluralizes (`batch` → `batchs` not `batches`); standardize naming |
| **No migration framework** | Medium | No database migration tool; schema changes are implicit; adopt `migrate-mongo` |

---

# 5. UI/UX Design

**Agent**: UI/UX Designer

## 5.1 Application Workflow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Login     │────▶│  Dashboard   │────▶│  Feature     │
│  (JWT/SSO)  │     │  (KPIs,      │     │  Modules     │
│             │     │   Charts,    │     │  (30 routes) │
└─────────────┘     │   Maps)      │     └──────────────┘
                    └──────────────┘
                           │
              ┌────────────┼────────────────────┐
              ▼            ▼                    ▼
    ┌─────────────┐ ┌──────────────┐  ┌────────────────┐
    │  Enquiry    │ │  Batch/Job   │  │  Finance       │
    │  → Quote    │ │  → Container │  │  → Invoice     │
    │  → Booking  │ │  → Document  │  │  → Payment     │
    │             │ │  → Milestone │  │  → Credit/Debit│
    └─────────────┘ └──────────────┘  └────────────────┘
```

## 5.2 Core User Flows

### Freight Lifecycle Flow

```
1. Create Enquiry → 2. Generate Quotation → 3. Customer Accept/Reject
       ↓                                              ↓ (Accept)
4. Create Job/Batch → 5. Add Containers → 6. Carrier Booking
       ↓                      ↓                    ↓
7. Shipping Instructions → 8. BL Generation → 9. Document Upload
       ↓                                           ↓
10. Create Invoice → 11. E-Invoice (GST) → 12. Payment Tracking
       ↓
13. Milestone Tracking → 14. Container Tracking → 15. Job Close
```

### Customer Portal Flow

```
Login (Customer) → Dashboard → View Quotations → Track Shipments → Download Documents
```

### Warehouse Flow

```
Gate In Entry → Inward → GRN → Data Entry → Bill of Entry → Packing → Dispatch → Gate Out
```

## 5.3 UI Framework Analysis

The frontend uses **four different UI component libraries**, creating visual inconsistency:

| Library | Usage | Components |
|---------|-------|------------|
| **Angular Material** | Primary form controls | Input, Select, Autocomplete, Dialog, Date Picker, Toolbar, Sidenav |
| **NG-Zorro Antd** | Secondary UI | Select, Date Picker, Notification, Tabs, Popover, Tooltip, Icon |
| **Bootstrap 5** | Layout and utilities | Grid, spacing, typography, cards |
| **ng-bootstrap** | Modals and dropdowns | Modal, Dropdown |

### Design System Recommendations

| Issue | Recommendation |
|-------|----------------|
| **Mixed component libraries** | Standardize on Angular Material OR NG-Zorro — not both |
| **No design tokens** | Create a centralized theme with CSS custom properties for colors, spacing, typography |
| **Inconsistent form controls** | Audit all forms to use one library's form controls consistently |
| **No component documentation** | Create a Storybook instance for the 100+ shared components |
| **Accessibility gaps** | Audit ARIA attributes; ensure keyboard navigation across all forms |

## 5.4 Internationalization

The app supports 3 languages via `@ngx-translate`:
- English (`en.json`)
- French (`fr.json`)
- Mandarin (`mnd.json`)
- Master keys (`master.json`)

**Gap**: Not all UI strings are externalized; some are hardcoded in templates.

## 5.5 Responsive Design

- The app uses Bootstrap 5 grid for responsive layout
- Angular Material's responsive breakpoints for component adaptation
- PWA support via Firebase Cloud Messaging and service worker
- **Gap**: No dedicated mobile-optimized views; desktop-first design with responsive scaling

---

# 6. Backend Architecture

**Agent**: Backend Developer

## 6.1 Backend Folder Structure

```
shipeasy-api/
├── index.js                          # App entry, middleware pipeline, server startup
├── router/
│   └── route.js                      # All API routes (~5890 lines)
├── schema/
│   ├── schema.js                     # 87 Mongoose schemas (~9114 lines)
│   ├── indexes.js                    # Database index definitions
│   └── invoiceSchema.js              # Invoice-specific schema helpers
├── middleware/
│   ├── auth.js                       # JWT + Google OAuth authentication
│   ├── security.js                   # Helmet, CORS, rate limiting, sanitization
│   ├── errorHandler.js               # AppError, 404, global error handler
│   ├── validateRequest.js            # Input validation rules
│   ├── tenantIsolation.js            # orgId enforcement, RBAC helpers
│   ├── requestTracer.js              # Trace ID, optional AES encryption
│   └── checkIndex.js                 # CRUD collection whitelist
├── controller/
│   ├── auth.controller.js            # Login, reset, change password, onboarding
│   ├── search.controller.js          # Global search, rates, AI scanning
│   ├── insert.commonController.js    # Generic insert, batch insert
│   ├── update.commonController.js    # Generic update, batch update
│   ├── delete.commonController.js    # Generic delete
│   ├── helper.controller.js          # Shared utilities, OpenAI, email, triggers
│   ├── email.controller.js           # Email list, send batch email
│   ├── dashboard.controller.js       # Dashboard data, chat, notifications
│   ├── storage.controller.js         # File upload/download (Azure Blob)
│   ├── azureStorageContoller.js       # Azure Blob operations (alternative)
│   ├── eInvoicing.controller.js      # Zircon GST e-invoicing
│   ├── edi.controller.js             # EDI file generation (router)
│   ├── ediController.js              # EDI format implementations
│   ├── jasperController.js           # Jasper PDF report generation
│   ├── reports.controller.js         # Report generation
│   ├── creditReport.controller.js    # Credit report management
│   ├── qr.controller.js              # QR code generation
│   ├── loadPlan.controller.js        # Container load planning
│   ├── tally.controller.js           # Tally accounting integration
│   ├── webhooks.controller.js        # OceanIO and external webhooks
│   ├── whatsapp.controller.js        # WhatsApp Business API
│   ├── non-auth.controller.js        # Unauthenticated endpoints
│   ├── emailReplyScheduler.js        # IMAP inbound email processing
│   └── automations/
│       └── jobautomation.controller.js  # AI-powered job automation
├── service/
│   ├── schedulers.js                 # 16 cron jobs
│   ├── socketHelper.js               # Socket.io event management
│   ├── mongooseConnection.js         # Database connection
│   ├── inAppNotification.js          # In-app notification dispatch
│   ├── messageHelper.js              # WhatsApp message formatting
│   ├── queue.js                      # BullMQ email queue
│   ├── requestContext.js             # AsyncLocalStorage for request context
│   └── logger.js                     # Logger (duplicate of utils/logger.js)
├── services/
│   ├── notification.service.js       # Notification orchestration
│   └── trigger.service.js            # Event-based trigger execution
├── utils/
│   ├── logger.js                     # Winston logger
│   └── fyHelper.js                   # Financial year helpers
├── worker/
│   ├── cron.worker.js                # Cron worker process
│   └── email.js                      # Email queue worker
└── tests/
    └── retrieval.test.js             # CRUD integration tests
```

## 6.2 API Specifications

### Authentication Endpoints

| Method | Path | Auth | Rate Limit | Purpose |
|--------|------|------|------------|---------|
| POST | `/api/user/login` | None | 20/15min | JWT token generation |
| POST | `/api/user/reset` | None | 20/15min | Password reset |
| POST | `/api/user/change-password` | None | 20/15min | Password change |
| POST | `/api/auth` | JWT | None | Get auth profile |
| POST | `/api/agentOnBoarding` | None | None | Agent registration |

### Generic CRUD Endpoints

| Method | Path | Auth | Validation | Purpose |
|--------|------|------|------------|---------|
| POST | `/api/search/:indexName/:id?` | JWT | validateSearch | Read/search records |
| POST | `/api/:indexName` | JWT | validateCrudInsert | Insert record |
| POST | `/api/:indexName/batchinsert` | JWT | validateCrudInsert | Batch insert |
| PUT | `/api/:indexName/batchupdate` | JWT | validateCrudInsert | Batch update |
| PUT | `/api/:indexName/:id` | JWT | validateCrudUpdate | Update record |
| DELETE | `/api/:indexName/:id` | JWT | validateCrudUpdate | Delete record |

### Named Business Endpoints

| Domain | Method | Path | Auth | Purpose |
|--------|--------|------|------|---------|
| **AI** | POST | `/api/scan-bl` | JWT | BL document scanning (OpenAI) |
| **AI** | POST | `/api/scan-p-invoice` | JWT | Purchase invoice scanning (Gemini) |
| **Tracking** | POST | `/api/containerTrack` | JWT | ULIP container tracking |
| **Tracking** | GET | `/api/containerLocationTrack/:number` | JWT | Container location lookup |
| **Search** | POST | `/api/globalSearch` | JWT | Cross-entity search |
| **Search** | POST | `/api/exchangeRate` | JWT | Currency exchange rates |
| **Search** | POST | `/api/findRate` | JWT | Freightos rate lookup |
| **Finance** | GET | `/api/sent-to-einvoicing/:invoiceId` | JWT | Push invoice to Zircon |
| **Finance** | GET | `/api/cancel-from-einvoicing/:invoiceId` | JWT | Cancel e-invoice |
| **Finance** | POST | `/api/generateTALLYEntry` | JWT | Tally integration |
| **EDI** | POST | `/api/edi/:ediName/:documentId` | JWT | Generate EDI file |
| **Reports** | POST | `/api/pdf/download` | JWT | Jasper PDF download |
| **Email** | POST | `/api/email/send` | JWT | Send email |
| **Email** | POST | `/api/sendBatchEmail` | JWT | Batch email |
| **QR** | POST | `/api/downloadQr` | JWT | QR code generation |
| **Load** | POST | `/api/load-plan` | None | Load plan creation |
| **Storage** | POST | `/api/uploadfile` | JWT + Upload limit | File upload |
| **Storage** | POST | `/api/downloadfile/:fileName` | JWT | File download |
| **Dashboard** | POST | `/api/chartDataDashboard` | JWT | Dashboard data |

### Webhook Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET/POST | `/webhook` | WhatsApp verify token | WhatsApp Business webhook |
| POST | `/api/oceanIOWebhook` | None | OceanIO tracking webhook |

## 6.3 Middleware Pipeline

```
Request
  │
  ▼ helmet (security headers — CSP/COEP disabled)
  ▼ cors (CORS_ORIGINS env var; empty = allow all)
  ▼ globalLimiter (1000 req / 15 min / IP)
  ▼ express.json (10mb limit)
  ▼ express.urlencoded (10mb limit)
  ▼ mongoSanitize (strip $ and . operators)
  ▼ hpp (whitelist: sort, fields, page, limit)
  ▼ requestTracer (trace ID, optional AES encryption)
  │
  ├─▶ /webhook (WhatsApp — no auth)
  ├─▶ /health, /version (no auth)
  │
  ▼ APM context (user ID attachment)
  │
  ▼ /api/* routes
  │  ├─▶ authLimiter (20/15min) → Login, Reset, Change Password
  │  ├─▶ uploadLimiter (50/15min) → File uploads
  │  ├─▶ Input validation (express-validator)
  │  ├─▶ validateAuth (JWT / Google OAuth)
  │  ├─▶ enforceTenantIsolation (orgId injection)
  │  ├─▶ checkIndex (schema whitelist for CRUD)
  │  └─▶ Controller
  │
  ▼ notFoundHandler (404)
  ▼ globalErrorHandler (500)
```

## 6.4 Background Processing — 16 Cron Jobs

| Schedule | Function | Description |
|----------|----------|-------------|
| `0 10 * * *` | quotationExpire | Send expiry emails for expired quotations |
| `0 */12 * * *` | cutOffDate12Hour | SI cut-off deadline reminders |
| `* * * * *` | emailReplyScheduler | Process unseen IMAP emails |
| `* * * * *` | reminderDelivery | Deliver due reminders |
| `0 0 * * *` | trialExpiration | Disable users in expired trial orgs |
| `0 1 * * *` | trialExpiryAlert | Notify 2 days before trial end |
| `0 2 * * *` | quotationExpiryMark | Flag expired quotations |
| `0 0 * * *` | transportInquiryExpiry | Flag expired transport inquiries |
| `0 */2 * * *` | containerScheduler | ULIP API container position updates |
| `0 0 * * *` | deleteOldDocuments | Remove WhatsApp docs older than 15 days |
| `0 * * * *` | scheduledReportEmails | Send due scheduled reports |
| `0 9,11,13,15,18 * * *` | dailyTaskReminders | Pending task email alerts |
| `0 10 * * *` | containerReturnReminders | Container return date alerts |
| `0 7 * * *` | agentFollowUps | Follow-up emails to agents |
| `0 */6 * * *` | podArrivalAlerts | 48h before POD arrival |
| `31 6 * * *` (UTC) | etaStatusEmails | 5-day ETA/MBL status notifications |

## 6.5 Backend Issues & Recommendations

| Issue | Severity | File | Recommendation |
|-------|----------|------|----------------|
| **`route.js` is 5890 lines** | High | `router/route.js` | Split into domain-specific router files |
| **`schema.js` is 9114 lines** | High | `schema/schema.js` | Split into per-domain schema modules |
| **No service layer** | High | All controllers | Extract business logic into services; controllers should be thin |
| **Duplicate storage controllers** | Medium | `storage.controller.js`, `azureStorageContoller.js` | Consolidate into one |
| **Duplicate EDI controllers** | Medium | `edi.controller.js`, `ediController.js` | Merge with consistent naming |
| **Duplicate logger** | Medium | `service/logger.js`, `utils/logger.js` | Remove one; standardize imports |
| **Hardcoded credentials in tests** | High | `tests/retrieval.test.js` | Use test environment variables or fixtures |
| **No API versioning** | Medium | `router/route.js` | Add `/api/v1/` prefix for all routes |
| **Mixed error handling** | Medium | Various controllers | Standardize on `next(error)` pattern for all controllers |

---

# 7. Frontend Architecture

**Agent**: Frontend Developer

## 7.1 Frontend Architecture Overview

```
shipeasy/src/
├── app/
│   ├── app.module.ts               # Root module
│   ├── app-routing.module.ts       # Root routing (→ login, → /home lazy)
│   ├── app.component.ts            # Root component
│   ├── admin/                      # 30 feature modules (lazy-loaded)
│   │   ├── dashboard/
│   │   ├── enquiry/
│   │   ├── batch/
│   │   ├── finance/
│   │   ├── warehouse/
│   │   ├── carrier-booking/
│   │   ├── igm/ egm/
│   │   ├── smart-documents/
│   │   ├── customer/
│   │   └── ... (20+ more)
│   ├── auth/                       # Login, Registration, Forgot/Reset Password
│   ├── layout/                     # Main layout (sidebar, header, footer)
│   ├── Guard/                      # Route guards (4 guards)
│   ├── services/                   # Core services
│   ├── shared/                     # 100+ shared components, pipes, directives
│   └── models/                     # 51 TypeScript interfaces
├── assets/
│   ├── i18n/                       # en.json, fr.json, mnd.json
│   └── images/
├── environments/                   # 5 environment configs
└── styles/                         # Global SCSS
```

## 7.2 Module Structure — 30 Lazy-Loaded Feature Modules

| Route | Module | Guard | Purpose |
|-------|--------|-------|---------|
| `/home/dashboard` | DashboardModule | AuthGuard | Charts, maps, KPIs |
| `/home/enquiry` | EnquiryModule | AuthGuard | Enquiry CRUD |
| `/home/batch` | BatchModule | AuthGuard | Job/batch management |
| `/home/finance` | FinanceModule | AuthGuard | Invoices, payments |
| `/home/master` | MasterModule | AuthGuard | Master data |
| `/home/manifest` | ManifestModule | AuthGuard | Manifest operations |
| `/home/register` | SmartagentModule | AuthGuard | Agent management |
| `/home/configuration` | ConfigurationModule | AuthGuard | Org config |
| `/home/igm` | IgmModule | AuthGuard | Import General Manifest |
| `/home/egm` | EgmModule | AuthGuard | Export General Manifest |
| `/home/smart-documents` | SmartDocumentsModule | AuthGuard | AI document processing |
| `/home/carrier-bookings` | CarrierBookingModule | AuthGuard | Carrier bookings |
| `/home/rate-finder` | RateFinderModule | AuthGuard | Rate lookup |
| `/home/load-calc` | LoadCalculatorModule | AuthGuard | Container load planning |
| `/home/address-book` | PartyMasterModule | AuthGuard | Party management |
| `/home/consolidation-booking` | ConsolidationBookingModule | AuthGuard | LCL bookings |
| `/home/lr` | LorryBookingModule | AuthGuard | Lorry receipts |
| `/home/warehouse` | WareHouseModule | AuthGuard | WMS operations |
| `/home/faq` | FaqModule | AuthGuard | FAQ management |
| `/home/support` | SupportModule | AuthGuard | Support tickets |
| `/home/rfq` | TransportModule | AuthGuard | Transport RFQ |
| `/home/customer` | CustomerModule | AuthGuardCustomer | Customer portal |
| `/home/reports/st-reports` | boldReportsModule | AuthGuard | Report viewer |
| `/home/profile` | UserPofileModule | AuthGuard | User profile |
| `/home/web-form` | WebFormModule | — | Public web forms |
| `/home/release/manager` | ReleaseManagerModule | AuthGuard | Release management |
| `/home/payment-confirmation` | PaymentConfirmationModule | AuthGuard | Payment confirmation |
| `/home/agent-advice` | AgentAdviseModule | AuthGuard | Agent advice notes |
| `/home/scmtr` | ScmtrModule | AuthGuard | SCMTR operations |
| `/home/not-found` | PagenotfoundModule | — | 404 page |

## 7.3 Service Layer

| Service | File | Responsibility |
|---------|------|----------------|
| **ApiInterceptor** | `services/api.interceptor.ts` | JWT injection, x-api-key, trace ID, optional AES encryption, orgId injection, 401 handling, loader management |
| **CognitoService** | `services/cognito.service.ts` | Auth state management, user/agent/role resolution, menu/permission loading, post-login redirect |
| **CommonFunctions** | `services/common-functions.ts` | Auth token management, encryption helpers, `isAuthenticated()`, `getUserType()`, logout, Excel export |
| **ApiService** | `services/api.service.ts` | Generic CRUD operations (`getSTList`, `addToST`, `UpdateToST`, `deleteST`), login |
| **CommonService** | `shared/services/common.service.ts` | HTTP post wrapper, report endpoints, header construction |
| **LoaderService** | `services/loader.service.ts` | Global loading indicator |
| **MessagingService** | `services/messaging.service.ts` | Socket.io messaging integration |

## 7.4 Authentication Flow

```
User → Login Page
  │
  ├── Username/Password → POST /api/user/login → JWT token → localStorage
  ├── Google OAuth → Google Identity Services → Token → POST /api/user/login
  └── Azure MSAL → MSAL Browser → Token → Backend validates
  │
  ▼
ApiInterceptor adds Authorization header to all requests
  │
  ├── 401 response → Show logout modal → Clear localStorage → Redirect /login
  └── Success → Continue
```

### Route Guards

| Guard | Logic |
|-------|-------|
| `AuthGuard` | Returns `true` if `isAuthenticated()` AND NOT customer user type |
| `AuthGuardCustomer` | Returns `true` if `isAuthenticated()` AND IS customer user type |
| `AuthGuardLoginGuard` | Redirects logged-in users away from login page |
| `OrgSettingGuard` | Only allows superAdmin users |

## 7.5 State Management

The application uses **no centralized state management** (no NgRx, Akita, or NGXS). State is managed through:

1. **BehaviorSubjects** in `CognitoService` — user, agent, roles
2. **localStorage** — token, UserDetails, AgentDetails, permissions, features
3. **sessionStorage** — access levels, temporary UI state
4. **Component-level state** — local variables in each component

### Recommendation

Adopt NgRx or NGXS for:
- Authentication state (currently scattered across localStorage + multiple services)
- Entity caching (reduce redundant API calls)
- Cross-component communication (currently done via services with BehaviorSubjects)

## 7.6 Frontend Issues

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **SharedModule is massive** (100+ components) | High | Split into feature-specific shared modules (SharedFinanceModule, SharedWarehouseModule, etc.) |
| **LayoutModule eagerly imports EnquiryModule and DashboardModule** | High | These should remain lazy-loaded |
| **4 UI libraries** (Material + NG-Zorro + Bootstrap + ng-bootstrap) | Medium | Standardize on one primary library |
| **No centralized state management** | Medium | Adopt NgRx for auth, entity caching, and cross-component state |
| **Environment files contain hardcoded secrets** | Critical | Remove `secretkey`, `x-api-key`, `username/password` from environment files |
| **Angular 13 is end-of-life** | High | Upgrade to Angular 17+ for security patches and performance |
| **Mock AuthService still present** | Low | Remove mock login code (`amich`/`test1234`) |
| **`proxy.conf.json` points to external URL** | Medium | Should default to `http://localhost:3000` for local development |

---

# 8. Security Architecture

**Agent**: Security Engineer

## 8.1 Security Middleware Chain

The Express application implements a layered security architecture:

```
Request → Helmet → CORS → Rate Limiter → Body Parser → Mongo Sanitize → HPP → Tracer → Auth → Tenant Isolation → Controller
```

### Implemented Security Controls

| Control | Implementation | File |
|---------|---------------|------|
| **Security Headers** | Helmet (CSP and COEP disabled for SPA compatibility) | `middleware/security.js` |
| **CORS** | Origin whitelist via `CORS_ORIGINS` env var | `middleware/security.js` |
| **Rate Limiting** | Global (1000/15min), Auth (20/15min), Upload (50/15min) | `middleware/security.js` |
| **NoSQL Injection** | `express-mongo-sanitize` strips `$` and `.` operators | `middleware/security.js` |
| **Parameter Pollution** | `hpp` with whitelist (sort, fields, page, limit) | `middleware/security.js` |
| **Authentication** | JWT + Google OAuth fallback | `middleware/auth.js` |
| **Tenant Isolation** | Auto-injects `orgId` into queries and inserts | `middleware/tenantIsolation.js` |
| **Input Validation** | `express-validator` for login, CRUD, file download | `middleware/validateRequest.js` |
| **Error Handling** | Centralized error handler; stack traces hidden in production | `middleware/errorHandler.js` |
| **Request Tracing** | Unique trace ID per request; optional AES-CBC encryption | `middleware/requestTracer.js` |
| **Audit Logging** | Mongoose post-hooks log all changes to `logaudits` | `schema/schema.js` |

## 8.2 OWASP Top 10 Assessment

### A01: Broken Access Control — PARTIAL

| Finding | Severity | Status |
|---------|----------|--------|
| Tenant isolation via `enforceTenantIsolation` middleware | — | Implemented |
| `requireRole()` and `requireFeature()` middleware defined | — | Implemented but UNUSED |
| No route-level RBAC enforcement | **Critical** | No protected routes use `requireRole()` |
| SuperAdmin bypasses all tenant isolation | **High** | By design, but risky if credentials compromised |
| Several endpoints lack authentication entirely | **High** | `load-plan`, `load-calculate`, `agentOnBoarding`, `quotation/update`, `quotation/download` |

**Recommendation**: Apply `requireRole()` to all admin/config routes. Add authentication to `load-plan` and `load-calculate`. Add CSRF tokens for state-changing operations.

### A02: Cryptographic Failures — PARTIAL

| Finding | Severity | Status |
|---------|----------|--------|
| JWT signed with `SECRET_KEY_JWT` env var | — | Implemented |
| Optional AES-CBC encryption for request/response bodies | — | Implemented |
| `secretkey` hardcoded in frontend `environment.ts` | **Critical** | Exposed in client bundle |
| `x-api-key` hardcoded in frontend environment files | **Critical** | Exposed in client bundle |
| Firebase config, Azure Client ID in environment files | **Medium** | Publicly visible |
| Test credentials in `environment.ts` (`username`, `password`) | **Critical** | `vikash.subudhi2211@gmail.com` / `Tead@1` |

**Recommendation**: Remove all secrets from frontend environment files. Use environment variables injected at build time. Rotate all exposed credentials immediately.

### A03: Injection — GOOD

| Finding | Severity | Status |
|---------|----------|--------|
| `express-mongo-sanitize` strips MongoDB operators | — | Implemented |
| Input validation on login, CRUD, file download | — | Implemented |
| No validation on named endpoint params (`ediName`, `documentId`, `invoiceId`) | **Medium** | Gap |
| No validation on request bodies for named endpoints | **Medium** | Gap |

### A04: Insecure Design — PARTIAL

| Finding | Severity | Status |
|---------|----------|--------|
| Quotation accept/reject via unauthenticated GET link | **Medium** | Anyone with the URL can change status |
| `agentOnBoarding` creates organizations without authentication | **Medium** | Abuse risk |
| `contactFormFilled` uses single shared `WORDPRESS_TOKEN` | **Low** | Weak authentication |

### A05: Security Misconfiguration — PARTIAL

| Finding | Severity | Status |
|---------|----------|--------|
| Swagger disabled in production (unless `ENABLE_SWAGGER=true`) | — | Implemented |
| CORS allows all origins when `CORS_ORIGINS` is empty | **High** | Default is permissive |
| Socket.io uses `origin: '*'` | **High** | No origin restriction on WebSocket |
| Body size limit reduced to 10mb | — | Implemented |
| `x-api-key` header sent but never validated by backend | **High** | False security signal |

### A06: Vulnerable and Outdated Components — HIGH RISK

| Component | Version | Status |
|-----------|---------|--------|
| Angular | 13.3.11 | **EOL** — last security patch was April 2023 |
| Node.js | 22.x | Current LTS |
| MongoDB | 6 | Current |
| Express | 4.18 | Current |

**Recommendation**: Upgrade Angular to v17+ immediately. Run `npm audit` and `yarn audit` regularly.

### A07: Identification and Authentication Failures — PARTIAL

| Finding | Severity | Status |
|---------|----------|--------|
| Rate limiting on auth endpoints (20/15min) | — | Implemented |
| JWT token version tracking (`tokenVersion`) | — | Implemented |
| Trial expiry enforcement | — | Implemented |
| No password hashing audit (passwords compared directly in `auth.controller`) | **Critical** | May store/compare plain text |
| `x-api-key` never validated server-side | **High** | Header is decorative |
| No session invalidation on password change | **Medium** | Old JWT tokens remain valid |

### A08: Software and Data Integrity Failures — PARTIAL

| Finding | Severity | Status |
|---------|----------|--------|
| No integrity verification on file uploads | **Medium** | Files accepted without content validation |
| Docker images tagged by Git SHA | — | Traceable |
| No SBOM (Software Bill of Materials) | **Low** | Missing |

### A09: Security Logging and Monitoring Failures — GOOD

| Finding | Status |
|---------|--------|
| Winston structured logging with trace IDs | Implemented |
| Sensitive headers redacted in logs | Implemented |
| Response bodies not logged in production | Implemented |
| Elastic APM for full-stack observability | Implemented |
| Security events (sanitization, auth failures) logged | Implemented |

### A10: Server-Side Request Forgery (SSRF) — PARTIAL

| Finding | Severity | Status |
|---------|----------|--------|
| ULIP API proxy — URLs constructed from user input | **Medium** | No URL validation |
| Freightos API integration | **Low** | Hardcoded sandbox URL |
| Jasper Reports server calls | **Low** | URL from env var |

## 8.3 Critical Security Vulnerabilities

| # | Vulnerability | Severity | File | Remediation |
|---|---------------|----------|------|-------------|
| 1 | **Hardcoded secrets in frontend** (`secretkey`, `x-api-key`, credentials) | Critical | `environment.ts` | Remove immediately; use build-time injection |
| 2 | **RBAC middleware defined but not used** on any route | Critical | `tenantIsolation.js`, `route.js` | Apply `requireRole()` to admin and config routes |
| 3 | **Password handling** — possible plain-text comparison | Critical | `auth.controller.js` | Audit password storage; ensure bcrypt hashing |
| 4 | **CORS allows all origins by default** | High | `security.js` | Require `CORS_ORIGINS` to be set; deny all if empty |
| 5 | **Socket.io CORS**: `origin: '*'` | High | `index.js` | Match Socket.io CORS to Express CORS config |
| 6 | **Angular 13 EOL** — no security patches | High | `package.json` | Upgrade to Angular 17+ |
| 7 | **Unauthenticated endpoints** expose business logic | High | `route.js` | Add authentication to `load-plan`, `load-calculate` |
| 8 | **`x-api-key` never validated** | Medium | `auth.js` | Implement validation or remove the header |
| 9 | **No CSRF protection** | Medium | — | Add CSRF tokens for state-changing operations |
| 10 | **OceanIO webhook has no authentication** | Medium | `route.js` | Add webhook signature verification |

---

# 9. Performance Optimization

**Agent**: Performance Engineer

## 9.1 Current Performance Profile

### API Performance

| Area | Current State | Issue |
|------|---------------|-------|
| **Generic CRUD** | Single MongoDB query per request | Adequate for simple queries |
| **Search endpoint** | Mongoose `find()` with dynamic queries | No pagination limits enforced server-side |
| **Global search** | Queries across multiple collections sequentially | No aggregation pipeline; N+1 problem |
| **Dashboard** | Multiple sequential DB queries per chart | No caching; recalculated on every request |
| **File operations** | Direct Azure Blob stream | Adequate |

### Database Performance

| Area | Current State | Issue |
|------|---------------|-------|
| **Indexes** | 60+ indexes on 25 collections | Good coverage of primary access patterns |
| **Date fields as strings** | `createdOn`, `validTo`, etc. are String type | Prevents efficient date range queries and sorting |
| **No aggregation pipelines** | Queries use `find()` only | No server-side aggregation for reports and dashboards |
| **Audit logging** | Post-hook on every save/update/delete | Adds latency to every write operation |
| **No connection pooling config** | Default Mongoose pool size | May be insufficient under load |

### Cron Job Performance

| Job | Frequency | Concern |
|-----|-----------|---------|
| IMAP email processing | Every minute | Can overlap if processing takes > 1 min |
| Reminder delivery | Every minute | Same overlap risk |
| Container tracking | Every 2 hours | Processes ALL containers sequentially; no batching |
| Scheduled reports | Every hour | Scans all report configs every hour |

### Frontend Performance

| Area | Issue |
|------|-------|
| **Bundle size** | Angular 13 + 4 UI libraries = large initial bundle |
| **SharedModule** | 100+ components loaded eagerly into shared module |
| **No virtual scrolling** | Lists load all records into DOM |
| **No service worker caching** | API responses not cached |
| **Memory** | `--max_old_space_size=6096` for dev; indicates memory pressure |

## 9.2 Optimization Recommendations

### Tier 1 — Critical (Immediate)

| # | Optimization | Impact | Effort |
|---|-------------|--------|--------|
| 1 | **Add server-side pagination** to all search endpoints | High | Medium |
| 2 | **Convert date fields to Date type** in schemas | High | High (migration required) |
| 3 | **Add cron job locking** to prevent overlapping executions | High | Low |
| 4 | **Add MongoDB connection pool size** config (min: 10, max: 100) | Medium | Low |
| 5 | **Lazy-load SharedModule components** via separate sub-modules | High | Medium |

### Tier 2 — High Priority

| # | Optimization | Impact | Effort |
|---|-------------|--------|--------|
| 6 | **Add Redis caching** for dashboard queries (TTL: 5 min) | High | Medium |
| 7 | **Use MongoDB aggregation pipelines** for dashboard and reports | High | Medium |
| 8 | **Batch container tracking** — process in parallel chunks, not sequentially | Medium | Low |
| 9 | **Implement virtual scrolling** for large lists (Angular CDK) | Medium | Medium |
| 10 | **Add response compression** (gzip/brotli at Express level) | Medium | Low |

### Tier 3 — Medium Priority

| # | Optimization | Impact | Effort |
|---|-------------|--------|--------|
| 11 | **Implement read replicas** for MongoDB (read-heavy queries to secondary) | Medium | High |
| 12 | **Add CDN** for static frontend assets | Medium | Low |
| 13 | **Tree-shake unused UI library components** | Medium | Medium |
| 14 | **Implement ETags** for API response caching | Low | Medium |
| 15 | **Move audit logging to async queue** (BullMQ) instead of synchronous post-hooks | Medium | Medium |

## 9.3 APM Configuration

Current configuration in `index.js`:

| Setting | Production | Non-Production |
|---------|-----------|----------------|
| `transactionSampleRate` | 0.5 | 1.0 |
| `captureBody` | `'errors'` | `'all'` |
| `captureHeaders` | true | true |
| `errorOnAbortedRequests` | true | true |

**Recommendation**: Reduce `captureHeaders` to `false` in production to further reduce APM overhead. Consider custom metrics for business KPIs (quotation conversion rate, shipment cycle time).

---

# 10. Testing Strategy

**Agent**: QA / Test Automation

## 10.1 Current Test Inventory

### Backend Tests

| File | Framework | Tests | Coverage |
|------|-----------|-------|----------|
| `tests/retrieval.test.js` | Jest + Supertest | ~260 (3 per schema × 87 schemas) | Login + generic CRUD only |

**What's tested**: Login authentication, insert, search, delete for each of the 87 schemas.

**What's NOT tested**:
- Named business endpoints (scan-bl, e-invoicing, EDI, etc.)
- Security middleware (rate limiting, CORS, sanitization)
- Authentication edge cases (expired tokens, invalid tokens, Google OAuth)
- Tenant isolation enforcement
- Error handling (validation errors, duplicate keys, not found)
- Background jobs (cron schedulers)
- WebSocket events (Socket.io)
- File upload/download
- External API integrations

### Frontend Tests

| Metric | Value |
|--------|-------|
| Spec files | ~384 `.spec.ts` files |
| Framework | Karma + Jasmine |
| CI status | `continueOnError: true` — **failures don't block deployment** |

**What's tested**: Component creation (`should create`), basic service mocking, guard behavior.

**What's NOT tested**:
- `ApiInterceptor` (encryption, header injection, 401 handling)
- Complex component interactions
- Form validation
- E2E user workflows
- Accessibility

## 10.2 Test Strategy (Proposed)

### Testing Pyramid

```
         ┌─────────┐
         │   E2E   │  5-10 critical user journeys
         │ (Cypress)│
         ├─────────┤
         │  Integ  │  API integration tests per domain
         │  Tests  │
         ├─────────┤
         │  Unit   │  Pure function tests, service tests
         │  Tests  │  Component isolation tests
         └─────────┘
```

### Backend Test Plan

| Category | Tool | Priority | Test Count (Target) |
|----------|------|----------|---------------------|
| **Unit: Middleware** | Jest | Critical | 50+ tests |
| **Unit: Validators** | Jest | Critical | 30+ tests |
| **Integration: Auth** | Jest + Supertest | Critical | 20+ tests |
| **Integration: CRUD** | Jest + Supertest | High | Existing (enhance) |
| **Integration: Named endpoints** | Jest + Supertest | High | 40+ tests |
| **Integration: Tenant isolation** | Jest + Supertest | Critical | 15+ tests |
| **Integration: Error handling** | Jest + Supertest | High | 20+ tests |
| **Unit: Cron jobs** | Jest (with mocked DB) | Medium | 16+ tests |
| **Integration: WebSocket** | Socket.io-client | Medium | 10+ tests |

### Frontend Test Plan

| Category | Tool | Priority | Test Count (Target) |
|----------|------|----------|---------------------|
| **Unit: Services** | Karma + Jasmine | Critical | 30+ tests |
| **Unit: Guards** | Karma + Jasmine | Critical | 15+ tests |
| **Unit: Interceptor** | Karma + Jasmine | Critical | 20+ tests |
| **Unit: Pipes/Directives** | Karma + Jasmine | Medium | 20+ tests |
| **Component: Forms** | Karma + Jasmine | High | 50+ tests |
| **E2E: Login flow** | Cypress | Critical | 5+ tests |
| **E2E: Enquiry → Quote → Batch** | Cypress | High | 10+ tests |
| **E2E: Invoice → Payment** | Cypress | High | 5+ tests |
| **E2E: Customer portal** | Cypress | Medium | 5+ tests |

## 10.3 Critical Test Cases

### TC-001: Authentication

| ID | Test Case | Expected |
|----|-----------|----------|
| TC-001-01 | Login with valid credentials | 200 + JWT token |
| TC-001-02 | Login with invalid credentials | 401 |
| TC-001-03 | Login with expired trial account | 401 + trial expired message |
| TC-001-04 | Login with disabled user | 401 + not allowed message |
| TC-001-05 | Access protected endpoint without token | 401 |
| TC-001-06 | Access protected endpoint with expired token | 401 |
| TC-001-07 | Rate limiting: 21st login attempt within 15 min | 429 |
| TC-001-08 | Google OAuth with valid token | 200 + user context |
| TC-001-09 | Google OAuth with invalid token | 401 |

### TC-002: Tenant Isolation

| ID | Test Case | Expected |
|----|-----------|----------|
| TC-002-01 | Search without orgId → system injects it | Results filtered by user's orgId |
| TC-002-02 | Insert record → orgId auto-injected | Record saved with user's orgId |
| TC-002-03 | User A searches → should not see User B's org data | Empty results for other org |
| TC-002-04 | SuperAdmin search → no orgId filtering | All org data visible |
| TC-002-05 | Exempt collection (country) → no tenant filter | All countries visible |

### TC-003: Security

| ID | Test Case | Expected |
|----|-----------|----------|
| TC-003-01 | NoSQL injection: `{"$gt": ""}` in query | Sanitized; no injection |
| TC-003-02 | Path traversal in file download: `../../etc/passwd` | 400 validation error |
| TC-003-03 | Global rate limit: 1001st request in 15 min | 429 |
| TC-003-04 | Invalid `indexName` (special chars) | 400 validation error |
| TC-003-05 | Request to undefined route | 404 with AppError |
| TC-003-06 | Malformed JSON body | 400 |

### TC-004: Business Logic

| ID | Test Case | Expected |
|----|-----------|----------|
| TC-004-01 | Create enquiry → generate quotation | Quotation linked to enquiry |
| TC-004-02 | Quotation past validTo → cron marks expired | quoteStatus = expired |
| TC-004-03 | E-invoicing push → Zircon API success | IRN stored on invoice |
| TC-004-04 | E-invoicing push → Zircon API failure | Error returned to client |
| TC-004-05 | Container tracking → ULIP returns position | Container event created |
| TC-004-06 | File upload → exceeds size limit | 413 or upload limiter |

## 10.4 Testing Recommendations

| # | Recommendation | Priority |
|---|----------------|----------|
| 1 | **Remove `continueOnError: true`** from frontend CI pipeline | Critical |
| 2 | **Add test environment config** — no hardcoded credentials in tests | Critical |
| 3 | **Add security middleware tests** before any production deployment | Critical |
| 4 | **Implement test database seeding** with fixtures instead of real DB calls | High |
| 5 | **Add code coverage thresholds** (target: 60% backend, 40% frontend) | High |
| 6 | **Migrate E2E from Protractor to Cypress** (Protractor is deprecated) | High |
| 7 | **Add API contract tests** for external integrations (ULIP, Zircon, Freightos) | Medium |
| 8 | **Add load testing** with k6 or Artillery for key API endpoints | Medium |

---

# 11. DevOps / CI-CD Architecture

**Agent**: DevOps Engineer

## 11.1 Current Deployment Architecture

```
Developer → git push main → Azure Pipelines
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              DetectChanges   Test      BuildPush
              (git diff)    (Jest/     (Docker →
                            Karma)      ACR)
                                          │
                                          ▼
                                       Deploy
                                    (SSH → EC2)
                                          │
                                    ┌─────┼─────┐
                                    ▼     ▼     ▼
                                  Pull  Restart Health
                                  Images Docker  Check
```

## 11.2 CI/CD Pipeline — Azure Pipelines

### Pipeline Stages

| Stage | Trigger | Purpose |
|-------|---------|---------|
| **DetectChanges** | All pushes/PRs to main | Git diff to determine which apps changed |
| **Test** | Conditional per app | Backend: Jest + Supertest; Frontend: Karma headless |
| **BuildPush** | Push to main only | Build Docker images, push to ACR with SHA tag |
| **Deploy** | Push to main only | SSH to EC2, pull images, rolling restart |

### Change Detection

```
git diff HEAD~1 HEAD → sets backendChanged / frontendChanged flags
```

- `shipeasy-api/` changes → backend pipeline
- `shipeasy/` changes → frontend pipeline
- `docker-compose.yml`, `azure-pipelines.yml`, `deploy.sh` → both pipelines

### Build Configuration

| App | Node | Docker | Tags |
|-----|------|--------|------|
| Backend | 22 | Multi-stage (deps → production alpine) | `$(SHORT_SHA)`, `latest` |
| Frontend | 20 | Multi-stage (build → nginx:stable-alpine) | `$(SHORT_SHA)`, `latest` |

## 11.3 Deployment Process (`deploy.sh`)

1. `docker login` to ACR with service principal
2. `docker pull` backend and frontend images by tag
3. Update `.env` with new `BACKEND_TAG`, `FRONTEND_TAG`, `BACKEND_IMAGE`, `FRONTEND_IMAGE`
4. Rolling restart: `docker compose up -d --no-build --no-deps --pull never` (backend first, then frontend)
5. Health checks: 12 retries × 5s for backend (`/api-docs`) and frontend (`/`)
6. Cleanup: `docker logout`, `docker image prune -f`

## 11.4 Docker Services

| Service | Image | Ports | Volumes |
|---------|-------|-------|---------|
| **mongo** | `mongo:6` | Internal (dev: 27017) | `mongo_data:/data/db` |
| **backend** | `${BACKEND_IMAGE}:${BACKEND_TAG}` | 3000 | `logs_data:/app/logs` |
| **frontend** | `${FRONTEND_IMAGE}:${FRONTEND_TAG}` | 80 (dev: 4200) | None |

**Network**: `shipeasy_net` (bridge)

## 11.5 GitHub Actions (Fallback)

A manual-trigger-only GitHub Actions workflow exists at `.github/workflows/ci-cd.yml` using GHCR instead of ACR. However, `deploy.sh` is written for ACR — the GHCR block (lines 121–194) is unreachable.

## 11.6 Infrastructure Issues & Recommendations

### Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **Single EC2 instance** — no HA; single point of failure | Add load balancer with 2+ instances or migrate to ECS/EKS |
| 2 | **MongoDB on EC2** — no managed DB, no automated backups | Migrate to MongoDB Atlas or AWS DocumentDB |
| 3 | **Frontend tests `continueOnError: true`** — failures don't block deployment | Remove `continueOnError` |
| 4 | **No TLS in nginx config** — HTTP only | Add ALB with ACM certificate or Certbot on EC2 |
| 5 | **Health check uses `/api-docs` (Swagger)** | Use dedicated `/health` endpoint |

### High Priority

| # | Issue | Recommendation |
|---|-------|----------------|
| 6 | **No pipeline caching** — `npm ci` and `yarn install` run every time | Add cache for `node_modules` |
| 7 | **No automated rollback** — manual `.env` edit required | Implement blue/green deployment or keep last-known-good tag |
| 8 | **No staging environment** — changes go directly to production | Add staging pipeline with approval gate |
| 9 | **`deploy.sh` has unreachable GHCR block** | Remove or refactor to support both registries |
| 10 | **No centralized logging** — logs in Docker volumes only | Add CloudWatch, ELK, or Loki for log aggregation |

### Medium Priority

| # | Issue | Recommendation |
|---|-------|----------------|
| 11 | **No IaC** (Terraform/CloudFormation) | Codify EC2, VPC, security groups, ALB |
| 12 | **No secret rotation** | Implement AWS Secrets Manager or Vault |
| 13 | **No backup script in repo** (docs reference it) | Add `scripts/backup-mongo.sh` |
| 14 | **No monitoring alerts** | Configure APM alerts for error rates, latency |
| 15 | **Docker image retention** — no ACR lifecycle policy | Configure to keep last N tags |

## 11.7 Recommended Target Architecture

```
                    ┌─────────────┐
                    │   Route 53  │
                    │   (DNS)     │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │   ALB +     │
                    │   ACM TLS   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  ECS Service     │    │  ECS Service     │
    │  (Frontend)      │    │  (Backend)       │
    │  nginx + Angular │    │  Express + Node  │
    │  2+ tasks        │    │  2+ tasks        │
    └──────────────────┘    └──────────────────┘
                                     │
                    ┌────────────────┼───────────────┐
                    ▼                ▼               ▼
            ┌─────────────┐  ┌───────────┐  ┌────────────┐
            │  DocumentDB │  │ ElastiCache│  │ S3/Azure   │
            │  (MongoDB)  │  │ (Redis)   │  │ Blob       │
            └─────────────┘  └───────────┘  └────────────┘
```

---

# 12. SaaS Platform Design

**Agent**: SaaS Platform Architect

## 12.1 Current Multi-Tenancy Model

### Tenant Isolation

- **Strategy**: Shared database, shared collections, `orgId`-based row filtering
- **Implementation**: `enforceTenantIsolation` middleware in `middleware/tenantIsolation.js`
- **Mechanism**:
  - Search queries: `req.body.query.orgId = orgId` auto-injected
  - Insert operations: `req.body.orgId = orgId` auto-injected
  - SuperAdmin bypasses filtering
  - Global collections exempt: `country`, `state`, `city`, `port`, `currency`, `commodity`, `airportmaster`

### Current Tenant Context

```javascript
req.tenantContext = {
    orgId,      // from agent.agentId or user.orgId
    userId,     // from user.userId
    userType,   // from user.userType
    isSuperAdmin, // user.userType === 'superAdmin'
};
```

## 12.2 Organization Management

| Entity | Schema | Purpose |
|--------|--------|---------|
| `agent` | `agentId`, `isTrial`, `trialValidTill`, features, config | Organization (tenant) record |
| `branch` | `branchId`, `orgId` | Organizational branches |
| `department` | `departmentId`, `orgId` | Departments within org |
| `employee` | `employeeId`, `orgId` | Employee records |
| `user` | `userId`, `orgId`, `userType`, `userStatus`, `tokenVersion` | User accounts |

### Trial Management

- Organizations can be marked as `isTrial` with `trialValidTill` date
- Cron job (`0 0 * * *`) automatically disables users in expired trial organizations
- Cron job (`0 1 * * *`) sends email alerts 2 days before trial expiration

## 12.3 RBAC Architecture

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| `role` schema | Defined | Roles stored per org |
| `feature` schema | Defined | Feature flags per org |
| `requireRole()` middleware | Defined | **Not used on any route** |
| `requireFeature()` middleware | Defined | **Not used on any route** |
| Frontend `AccessControlDirective` | Defined | UI-level role checks |
| Frontend `AccessFeatureDirective` | Defined | UI-level feature checks |

### RBAC Gap Analysis

The RBAC system is **architecturally complete but not enforced**:

1. Roles and features are defined in the database
2. Middleware for role and feature checking is implemented
3. Frontend directives hide/show UI elements based on roles
4. **No backend route actually uses `requireRole()` or `requireFeature()`**

This means any authenticated user can access any API endpoint regardless of their role. The UI hides elements but the API doesn't enforce access control.

### Recommended RBAC Enforcement

```javascript
// Example: Configuration routes should require admin role
router.post('/api/configuration', validateAuth, requireRole('admin', 'superAdmin'), controller);

// Example: E-invoicing requires feature flag
router.get('/api/sent-to-einvoicing/:invoiceId', validateAuth, requireFeature('einvoicing'), controller);

// Example: Report access requires specific role
router.post('/api/dashboardReport', validateAuth, requireRole('admin', 'manager', 'finance'), controller);
```

## 12.4 Subscription & Billing (Missing)

The platform currently has **no subscription or billing system**. The trial management exists but there's no paid tier management.

### Recommended Subscription Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Subscription Layer                       │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │   Plan   │  │ Subscription │  │  Usage Metering    │    │
│  │  Master  │  │   per Org    │  │  (API calls, users,│    │
│  │          │  │              │  │   storage, etc.)   │    │
│  └──────────┘  └──────────────┘  └────────────────────┘    │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Billing      │  │ Invoice     │  │ Payment Gateway  │   │
│  │ Cycle        │  │ Generation  │  │ (Stripe/Razorpay)│   │
│  │ Management   │  │             │  │                  │   │
│  └──────────────┘  └─────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Recommended Plan Structure

| Plan | Users | Shipments/mo | Storage | Features |
|------|-------|-------------|---------|----------|
| **Starter** | 5 | 100 | 5 GB | Core (Enquiry, Quotation, Batch, Invoice) |
| **Professional** | 25 | 500 | 25 GB | + Warehouse, AI Scanning, Container Tracking |
| **Enterprise** | Unlimited | Unlimited | 100 GB | + API Access, SSO, Custom Reports, Priority Support |

## 12.5 Feature Flags

The `feature` schema exists with `slug` and `isActive` fields per organization. `requireFeature()` middleware is implemented to check features.

**Current gaps**:
- No admin UI for managing feature flags
- No runtime feature toggle (requires DB update)
- No feature usage tracking
- No plan-to-feature mapping

**Recommendation**: Implement a feature flag service (e.g., LaunchDarkly integration or custom) with:
- Plan-based feature allocation
- Runtime toggle capability
- Usage tracking and analytics
- Graceful degradation when feature is disabled

## 12.6 SaaS Recommendations

| # | Recommendation | Priority | Effort |
|---|----------------|----------|--------|
| 1 | **Enforce `requireRole()` on all admin/config routes** | Critical | Low |
| 2 | **Enforce `requireFeature()` on premium features** | Critical | Low |
| 3 | **Add subscription management** (plan, billing cycle, payment) | High | High |
| 4 | **Add usage metering** (API calls, users, storage per org) | High | Medium |
| 5 | **Add payment gateway integration** (Stripe or Razorpay) | High | Medium |
| 6 | **Add admin dashboard** for platform-wide tenant management | Medium | Medium |
| 7 | **Add tenant-level rate limiting** (per org, per plan) | Medium | Medium |
| 8 | **Add data export/portability** for GDPR compliance | Medium | Medium |
| 9 | **Add org onboarding wizard** with setup checklist | Low | Medium |
| 10 | **Add white-label support** (custom domains, branding per org) | Low | High |

---

# 13. Code Quality Report

**Agent**: Code Reviewer

## 13.1 Architecture Quality

| Aspect | Grade | Notes |
|--------|-------|-------|
| **Separation of Concerns** | C | Controllers contain business logic; no service layer |
| **Module Cohesion** | D | Monolithic files (route.js: 5890 lines, schema.js: 9114 lines) |
| **Dependency Management** | B | Clean package.json; no unused dependencies audit |
| **Error Handling** | B+ | Centralized error handler; some controllers still use manual try/catch |
| **Logging** | B | Winston structured logging; duplicate logger files |
| **Security** | B- | Good middleware stack; critical gaps in RBAC enforcement and secrets |
| **Testing** | D | Minimal test coverage; no security or integration tests |
| **Documentation** | C+ | AGENTS.md is comprehensive; API documentation is auto-generated only |

## 13.2 Code Smells

### Critical

| # | Smell | Location | Impact |
|---|-------|----------|--------|
| 1 | **God File**: `route.js` at 5890 lines | `router/route.js` | Unmaintainable; merge conflicts; hard to review |
| 2 | **God File**: `schema.js` at 9114 lines | `schema/schema.js` | Same issues; impossible to find specific schema quickly |
| 3 | **Hardcoded credentials** in test file | `tests/retrieval.test.js` | Security risk if repo is public |
| 4 | **Hardcoded secrets** in environment files | `environments/environment.ts` | `secretkey`, `x-api-key`, username/password exposed |
| 5 | **Dead code**: `GHCR block in deploy.sh` (lines 121-194) | `deploy.sh` | Confusing; unreachable code |
| 6 | **Dead code**: Mock `AuthService` with hardcoded credentials | `auth.service.ts` | `amich/test1234` mock login |

### High

| # | Smell | Location | Impact |
|---|-------|----------|--------|
| 7 | **Duplicate code**: Two storage controllers | `storage.controller.js`, `azureStorageContoller.js` | Confusion about which to use |
| 8 | **Duplicate code**: Two EDI controllers | `edi.controller.js`, `ediController.js` | Inconsistent naming |
| 9 | **Duplicate code**: Two logger files | `service/logger.js`, `utils/logger.js` | Import confusion |
| 10 | **Inconsistent naming**: Controller typo | `azureStorageContoller.js` (missing 'r') | Confusion |
| 11 | **Tight coupling**: `helper.controller.js` exports schemas | Multiple controllers import from it | Circular dependency risk |
| 12 | **Console.log usage** in schedulers and some controllers | `service/schedulers.js` | Should use Winston logger |

### Medium

| # | Smell | Location | Impact |
|---|-------|----------|--------|
| 13 | **Magic strings**: Schema names, collection names | Throughout | No centralized constants |
| 14 | **No TypeScript on backend** | All `.js` files | No type safety; harder to refactor |
| 15 | **Mixed async patterns**: Callbacks + Promises + async/await | Various controllers | Inconsistent error handling |
| 16 | **No DTOs/validation schemas** for request/response | Controllers | Brittle API contracts |
| 17 | **SharedModule too large** | 100+ components in one module | Slow initial load; hard to maintain |
| 18 | **4 UI component libraries** | Frontend | Inconsistent UX; large bundle |

## 13.3 Code Metrics

| Metric | Backend | Frontend |
|--------|---------|----------|
| **Total files** | ~50 JS files | ~1000+ TS files |
| **Largest file** | `schema.js` (9114 lines) | SharedModule (100+ components) |
| **Test files** | 1 | ~384 |
| **Test coverage** | <5% (estimated) | Unknown (CI failures ignored) |
| **Duplicate code** | Storage controllers, EDI controllers, loggers | Unused AuthService |
| **ESLint violations** | No ESLint config | `console.log` usage in guards |
| **TypeScript strict** | N/A (JavaScript) | `strict: false` in tsconfig |

## 13.4 Refactoring Plan

### Phase 1: Critical Fixes (1-2 weeks)

| # | Task | Files Affected | Risk |
|---|------|---------------|------|
| 1 | Remove hardcoded secrets from `environment.ts` | 5 env files | Low |
| 2 | Remove hardcoded credentials from test file | 1 file | Low |
| 3 | Apply `requireRole()` to admin routes | `route.js` | Medium |
| 4 | Fix CORS default to deny-all when `CORS_ORIGINS` empty | `security.js` | Low |
| 5 | Fix Socket.io CORS to match Express CORS | `index.js` | Low |
| 6 | Remove dead code (GHCR block, mock AuthService) | `deploy.sh`, `auth.service.ts` | Low |

### Phase 2: Architecture Improvements (2-4 weeks)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 7 | Split `route.js` into domain-specific routers | High | Medium |
| 8 | Split `schema.js` into per-domain schema modules | High | Medium |
| 9 | Extract service layer from controllers | High | High |
| 10 | Consolidate duplicate controllers (storage, EDI) | Medium | Low |
| 11 | Consolidate duplicate loggers | Low | Low |
| 12 | Fix `azureStorageContoller.js` typo | Low | Low |
| 13 | Add backend ESLint configuration | Medium | Low |

### Phase 3: Frontend Modernization (4-8 weeks)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 14 | Upgrade Angular 13 → 17+ | Critical | High |
| 15 | Split SharedModule into feature-specific sub-modules | High | Medium |
| 16 | Standardize on one UI library (Material or NG-Zorro) | Medium | High |
| 17 | Add NgRx for state management | Medium | High |
| 18 | Enable TypeScript strict mode | Medium | High |
| 19 | Fix lazy-loading (remove eager imports in LayoutModule) | Medium | Low |

### Phase 4: Testing & Quality (2-4 weeks)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 20 | Add security middleware tests | Critical | Medium |
| 21 | Add tenant isolation tests | Critical | Medium |
| 22 | Add auth edge case tests | High | Medium |
| 23 | Add named endpoint integration tests | High | Medium |
| 24 | Fix frontend test failures and remove `continueOnError` | High | Medium |
| 25 | Add code coverage thresholds to CI pipeline | Medium | Low |

### Phase 5: Infrastructure (4-8 weeks)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 26 | Add TLS (ALB + ACM or Certbot) | Critical | Medium |
| 27 | Migrate MongoDB to managed service (Atlas/DocumentDB) | High | High |
| 28 | Add staging environment | High | Medium |
| 29 | Add Terraform IaC for infrastructure | Medium | High |
| 30 | Add centralized logging and monitoring | Medium | Medium |

---

# 14. Documentation & Refactoring Plan

**Agent**: Documentation

## 14.1 Current Documentation Inventory

| Document | Location | Status |
|----------|----------|--------|
| **AGENTS.md** | `/workspace/AGENTS.md` | Comprehensive agent instructions; up to date |
| **Backend README** | `shipeasy-api/README.md` | Exists |
| **CI/CD Setup Guide** | `docs/CICD_SETUP_GUIDE.md` | Detailed Azure Pipelines + ACR + EC2 setup |
| **Compliance Docs** | `docs/compliance/` | Architecture, network, security, DR, incident response, IAM |
| **Swagger API Docs** | `/api-docs` (runtime) | Auto-generated from code |
| **Environment Examples** | `.env.example` (root + backend) | Configuration reference |

## 14.2 Documentation Gaps

| Gap | Priority | Recommendation |
|-----|----------|----------------|
| **No developer onboarding guide** | High | Create step-by-step local setup guide |
| **No API documentation beyond Swagger** | High | Add API reference with examples, error codes, auth requirements |
| **No architecture decision records (ADRs)** | Medium | Document key decisions (why MongoDB, why Angular Material + NG-Zorro, etc.) |
| **No runbook for operations** | High | Create runbook for common operational tasks (restart, rollback, DB backup) |
| **No contribution guide** | Medium | Define PR process, code review checklist, branch strategy |
| **No changelog** | Medium | Add CHANGELOG.md with release notes |
| **Frontend component documentation** | Low | Set up Storybook for shared components |

## 14.3 Recommended Documentation Structure

```
docs/
├── README.md                       # Project overview, quick start
├── ARCHITECTURE.md                 # High-level architecture, diagrams
├── API_REFERENCE.md                # Complete API documentation
├── DEVELOPER_GUIDE.md              # Local setup, development workflow
├── DEPLOYMENT_GUIDE.md             # Deployment procedures, runbook
├── SECURITY.md                     # Security architecture, practices
├── CONTRIBUTING.md                 # Contribution guidelines
├── CHANGELOG.md                    # Release notes
├── CICD_SETUP_GUIDE.md             # (existing) CI/CD setup
├── adr/                            # Architecture Decision Records
│   ├── 001-mongodb-choice.md
│   ├── 002-angular-material.md
│   └── 003-tenant-isolation.md
└── compliance/                     # (existing) Compliance docs
```

---

# Summary: Priority Matrix

## Critical (Address Immediately)

| # | Finding | Agent | Action |
|---|---------|-------|--------|
| 1 | Hardcoded secrets in frontend environment files | Security | Remove and rotate credentials |
| 2 | RBAC middleware not enforced on any route | Security, SaaS | Apply `requireRole()` to admin routes |
| 3 | Angular 13 is end-of-life | Frontend, Security | Begin upgrade to Angular 17+ |
| 4 | No TLS in production nginx | DevOps | Add ALB + ACM or Certbot |
| 5 | Frontend test failures don't block deployment | QA | Remove `continueOnError: true` |
| 6 | CORS allows all origins by default | Security | Require `CORS_ORIGINS` to be set |
| 7 | Single EC2 — no high availability | DevOps | Add load balancer + multi-instance |

## High Priority (Address in Next Sprint)

| # | Finding | Agent | Action |
|---|---------|-------|--------|
| 8 | Monolithic `route.js` (5890 lines) | Code Review | Split into domain routers |
| 9 | Monolithic `schema.js` (9114 lines) | Code Review | Split into domain schemas |
| 10 | No service layer in backend | Architecture | Extract business logic from controllers |
| 11 | No subscription/billing system | SaaS | Design and implement |
| 12 | Minimal test coverage (<5% backend) | QA | Add security and integration tests |
| 13 | MongoDB on EC2 — no managed DB | DevOps | Migrate to Atlas/DocumentDB |
| 14 | No staging environment | DevOps | Add staging pipeline |

## Medium Priority (Address in Next Quarter)

| # | Finding | Agent | Action |
|---|---------|-------|--------|
| 15 | Date fields stored as strings | Database | Migrate to Date type |
| 16 | No centralized state management (frontend) | Frontend | Adopt NgRx |
| 17 | 4 UI component libraries | UI/UX | Standardize on one |
| 18 | SharedModule too large (100+ components) | Frontend | Split into sub-modules |
| 19 | No Terraform/IaC | DevOps | Codify infrastructure |
| 20 | No server-side pagination enforcement | Performance | Add mandatory limits |
| 21 | No API versioning | Architecture | Add `/api/v1/` prefix |
| 22 | No centralized logging/monitoring alerts | DevOps | Add ELK/CloudWatch |

---

*Report generated by the Multi-Agent SDLC Analysis System — 14 specialized agents analyzing the Shippeasy repository.*
