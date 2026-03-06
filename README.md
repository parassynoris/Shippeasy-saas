# Shippeasy SaaS

A full-stack, multi-tenant SaaS platform for **logistics, freight forwarding, and shipping management**. Built with **Angular 13** on the frontend and **Node.js / Express** on the backend, backed by **MongoDB 6**, with real-time operations via **Socket.io**.

> **Quick start** — clone, copy the env file, and run one command:
>
> ```bash
> cp .env.example .env
> docker compose up --build
> ```
>
> Frontend: [http://localhost](http://localhost) · Backend API: [http://localhost:3000](http://localhost:3000)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Modules & Features](#modules--features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start with Docker Compose](#quick-start-with-docker-compose)
  - [Local Development (without Docker)](#local-development-without-docker)
  - [Development Mode with Hot Reload](#development-mode-with-hot-reload)
  - [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment](#deployment)
  - [Production (Docker Compose)](#production-docker-compose)
  - [TLS / HTTPS](#tls--https)
  - [Staging Environment](#staging-environment)
  - [AWS Marketplace](#aws-marketplace)
- [Infrastructure as Code](#infrastructure-as-code)
- [Documentation](#documentation)
- [License](#license)

---

## Architecture Overview

```
Shippeasy-saas/
├── shipeasy/              # Angular 13 frontend (PWA, served by nginx)
├── shipeasy-api/          # Node.js / Express REST API + Socket.io
├── docs/                  # SDLC report, CI/CD guide, compliance docs
├── infra/                 # Terraform (AWS VPC, ALB, EC2, ACM)
├── scripts/               # Backup & migration scripts
├── docker-compose.yml     # Production compose (single-command start)
├── docker-compose.dev.yml # Development overrides (hot reload)
├── docker-compose.staging.yml
├── docker-compose.tls.yml # HTTPS / Certbot overrides
├── azure-pipelines.yml    # CI/CD pipeline
└── deploy.sh              # EC2 deployment script
```

### How it works

```
  ┌──────────────────────────────────────────────────────────────┐
  │                   Docker Compose Network                      │
  │                                                              │
  │  ┌────────────────┐   ┌─────────────────┐   ┌────────────┐  │
  │  │  nginx (:80)   │──▶│  Express API    │──▶│ MongoDB 6  │  │
  │  │  Angular SPA   │   │  (:3000)        │   │            │  │
  │  │  /api/ proxy   │   │  Socket.io      │   └────────────┘  │
  │  │  /socket.io/   │   │  Cron workers   │                   │
  │  └────────────────┘   └─────────────────┘                   │
  └──────────────────────────────────────────────────────────────┘
           │                      │
           │                      ├──▶ Azure Blob Storage (documents)
           │                      ├──▶ Redis (BullMQ email queue)
           │                      ├──▶ Elastic APM (observability)
           │                      ├──▶ OpenAI / Gemini (AI features)
           │                      └──▶ WhatsApp, SMTP, ULIP, etc.
```

1. **Browser** loads the Angular SPA from nginx (port 80).
2. **API calls** (`/api/*`) are reverse-proxied by nginx to Express (port 3000).
3. **WebSocket** connections (`/socket.io/`) are proxied with upgrade support.
4. **Express** middleware chain: Helmet → CORS → rate limiter → body parser → NoSQL sanitization → auth → controller.
5. **MongoDB** queries are scoped by `orgId` for multi-tenant data isolation.
6. **Background jobs** run via 16 node-cron schedulers (email, tracking, expiry, reports).

---

## Tech Stack

### Frontend — `shipeasy/`

| Layer | Technology |
|---|---|
| Framework | Angular 13.3.11 |
| UI Library | Angular Material 13, Bootstrap 5, NG-Zorro |
| Charts | ECharts, Chart.js, ngx-charts |
| Maps | Mapbox GL |
| Auth | JWT, Azure MSAL, Google Identity Services |
| Rich Text | CKEditor 5 |
| PDF | jsPDF, ng2-pdf-viewer |
| i18n | @ngx-translate (EN, FR, Mandarin) |
| Real-time | Socket.io client |
| PWA | Firebase Cloud Messaging |
| Observability | @elastic/apm-rum-angular |
| Build | Angular CLI, Yarn |
| Serving | nginx:stable-alpine (production) |

### Backend — `shipeasy-api/`

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express 4.18 |
| Database | MongoDB 6+ (Mongoose 8) |
| Real-time | Socket.io 4.7 |
| Auth | JWT (jsonwebtoken), bcrypt, Google OAuth |
| Storage | Azure Blob Storage (@azure/storage-blob) |
| Email | Nodemailer, SendInBlue, IMAP |
| Queue | BullMQ (Redis) |
| Scheduling | node-cron (16 cron jobs) |
| AI | OpenAI (BL scanning), Google Gemini (invoice scanning) |
| Reports | Jasper Reports, ExcelJS |
| Observability | Elastic APM, Winston + Pino logging |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, express-validator |

### Infrastructure

| Layer | Technology |
|---|---|
| Containers | Docker (multi-stage builds) |
| Orchestration | Docker Compose |
| CI/CD | Azure Pipelines |
| Registry | Azure Container Registry (ACR) |
| Hosting | AWS EC2 |
| IaC | Terraform (VPC, ALB, EC2, ACM) |
| Reverse Proxy | nginx (gzip, SPA routing, WebSocket proxy) |

---

## Modules & Features

| Module | Description |
|---|---|
| **Enquiry & Quotation** | Create/track freight enquiries, generate quotations with auto-expiry |
| **Batch / Job Management** | Central job execution linking containers, documents, invoices, milestones |
| **Container Tracking** | Real-time container location via ULIP government API |
| **Booking Management** | Carrier bookings, consolidation, shipping instructions (SI) |
| **Document Management** | Upload/download via Azure Blob; BL generation, AI-powered BL scanning |
| **Invoice & Finance** | Invoices, payments, credit/debit notes, TDS, Tally integration |
| **E-Invoicing** | GST e-invoicing compliance via Zircon API (India market) |
| **EDI** | Electronic Data Interchange file generation |
| **IGM / EGM** | Import/Export General Manifest processing |
| **Warehouse** | Inward, outward, gate entries, packing, dispatch, surveyor reports |
| **Load Planning** | Container load calculation and planning tools |
| **Rate Management** | Rate masters, Freightos API integration |
| **Transport RFQ** | Transport inquiry management with auto-expiry |
| **Notifications** | In-app (Socket.io), Email (SMTP/SendInBlue), WhatsApp Business API |
| **Chat** | Real-time messaging via Socket.io |
| **Dashboard** | Charts (ECharts), KPIs, Mapbox container maps |
| **Reports** | Jasper Reports (PDF), scheduled report emails, Bold/Stimulsoft |
| **Customer Portal** | Self-service quotation requests, shipment tracking |
| **Automations** | Rule-based workflow triggers (email, reports, notifications) |
| **AI** | BL scanning (OpenAI), invoice scanning (Gemini), smart documents |
| **User & Org Management** | Multi-tenant orgs, roles, features/permissions, SSO |
| **Audit Logging** | Change tracking per resource |
| **QR Codes** | Dynamic QR generation for batches and warehouses |

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Docker & Docker Compose | Docker 20+ / Compose v2 |
| Node.js (for local dev only) | 22.x (backend), 20.x (frontend) |
| Yarn (for local dev only) | 1.22+ |
| MongoDB (for local dev only) | 6+ |

### Quick Start with Docker Compose

This is the recommended way to run the full stack. Everything (frontend, backend, database) starts from a single command:

```bash
# 1. Clone the repository
git clone https://github.com/parassynoris/Shippeasy-saas.git
cd Shippeasy-saas

# 2. Copy the environment file (works out of the box with defaults)
cp .env.example .env

# 3. Build and start all services
docker compose up --build
```

Once started:

| Service | URL |
|---|---|
| **Frontend** (Angular SPA) | [http://localhost](http://localhost) |
| **Backend API** | [http://localhost:3000](http://localhost:3000) |
| **Health check** | [http://localhost:3000/health](http://localhost:3000/health) |
| **Swagger UI** (when enabled) | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) |

To stop: `docker compose down` · To stop and remove data: `docker compose down -v`

### Local Development (without Docker)

#### Backend

```bash
cd shipeasy-api
cp .env.example .env          # configure MONGO_CONNECTION, SECRET_KEY_JWT, etc.
npm install
npm start                     # runs on http://localhost:3000
```

#### Frontend

```bash
cd shipeasy
yarn install
yarn start                    # runs on http://localhost:4200
```

The Angular dev server proxies `/api/*` requests to `localhost:3000` via `src/proxy.conf.json`.

### Development Mode with Hot Reload

For development with live code reloading (both frontend and backend):

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

| Service | URL | Features |
|---|---|---|
| Frontend | [http://localhost:4200](http://localhost:4200) | Angular dev server, hot reload |
| Backend | [http://localhost:3000](http://localhost:3000) | nodemon, auto-restart on changes |
| MongoDB | `localhost:27017` | Exposed for DB tools (Compass, mongosh) |

### Environment Variables

#### Root `.env` (Docker Compose)

The root `.env` file controls Docker Compose. Copy `.env.example` to `.env` — it works with defaults.

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `production` | Environment name |
| `FRONTEND_PORT` | `80` | Host port for frontend |
| `BACKEND_PORT` | `3000` | Host port for backend API |
| `MONGO_DB_NAME` | `shipeasy` | MongoDB database name |
| `SECRET_KEY_JWT` | `change-me-in-production` | JWT signing secret (**change in production**) |
| `CORS_ORIGINS` | `http://localhost,...` | Comma-separated allowed CORS origins |
| `ENABLE_SWAGGER` | `false` | Enable Swagger UI at `/api-docs` |
| `BACKEND_URL` | `http://backend:3000` | Internal backend URL (used by nginx) |

#### Backend `.env` (`shipeasy-api/.env`)

For local (non-Docker) development, see `shipeasy-api/.env.example` for all available variables including:
database connection, JWT auth, CORS, email (SMTP), Azure Storage, Redis, APM, external APIs (Freightos, ULIP, WhatsApp, OpenAI, Gemini), Jasper Reports, encryption, and more.

---

## API Overview

### Generic CRUD Endpoints

All 87+ Mongoose models are accessible via generic CRUD routes, validated by `checkIndex` middleware:

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/search/:indexName/:id?` | Read / search records |
| `POST` | `/api/:indexName` | Insert a record |
| `PUT` | `/api/:indexName/:id` | Update a record |
| `DELETE` | `/api/:indexName/:id` | Delete a record |

### Named Endpoints

| Group | Path | Description |
|---|---|---|
| Auth | `/api/loginUser`, `/api/resetPassword` | Authentication |
| Dashboard | `/api/dashboard` | Metrics and KPIs |
| Search | `/api/globalSearch` | Cross-entity search |
| EDI | `/api/edi/:ediName/:documentId` | EDI file generation |
| E-Invoicing | `/api/sent-to-einvoicing/:invoiceId` | GST e-invoicing (Zircon) |
| BL Scanning | `/api/scan-bl` | AI-powered BL extraction (OpenAI) |
| Reports | `/api/createOrderReport` | PDF report generation |
| Load Plan | `/api/load-plan`, `/api/load-calculate` | Container load planning |
| Storage | `/api/uploadFile`, `/api/downloadFile` | Azure Blob operations |
| WhatsApp | `/webhook` | WhatsApp Business API callbacks |
| Health | `/health`, `/version` | Service health and version |

**Swagger UI** available at `/api-docs` (disabled in production unless `ENABLE_SWAGGER=true`).

---

## Testing

```bash
# Backend unit tests (Jest)
cd shipeasy-api
npm test

# Frontend unit tests (Karma + Jasmine)
cd shipeasy
yarn test

# Frontend headless (CI mode)
yarn test --watch=false --browsers=ChromeHeadless

# Frontend lint
yarn lint

# Frontend e2e (Protractor)
yarn e2e
```

---

## CI/CD Pipeline

The project uses **Azure Pipelines** (`azure-pipelines.yml`) with the following stages:

```
Push to main
     │
     ▼
┌─────────────────┐
│ DetectChanges    │  git diff → set backendChanged / frontendChanged
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Test             │  Jest (backend) + Karma headless (frontend)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build & Push     │  Docker build → push to Azure Container Registry
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy Staging   │  SSH → staging EC2 → deploy.sh
└────────┬────────┘
         │ (manual approval gate)
         ▼
┌─────────────────┐
│ Deploy Prod      │  SSH → production EC2 → deploy.sh
└─────────────────┘
```

### Setup Requirements

1. **Azure Container Registry (ACR)** — Docker image storage
2. **Azure DevOps Variable Group** (`shipeasy-secrets`) — all secrets
3. **ADO Service Connections** — `acr-connection` (Docker Registry), `aws-ec2-ssh` / `aws-ec2-staging-ssh` (SSH)
4. **ADO Environments** — `staging` and `production` (with approval gates)

See [`docs/CICD_SETUP_GUIDE.md`](docs/CICD_SETUP_GUIDE.md) for detailed setup instructions.

---

## Deployment

### Production (Docker Compose)

```bash
# On EC2 (or any server with Docker):
cp .env.example .env
# Edit .env with production values (JWT secret, CORS origins, etc.)
docker compose up --build -d
```

### TLS / HTTPS

```bash
# 1. Obtain certificates with Certbot
certbot certonly --standalone -d app.shippeasy.com

# 2. Set SERVER_NAME in .env
echo "SERVER_NAME=app.shippeasy.com" >> .env

# 3. Start with TLS overlay
docker compose -f docker-compose.yml -f docker-compose.tls.yml up -d
```

### Staging Environment

```bash
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

Uses a separate database (`shipeasy_staging`), enables Swagger UI, and sets debug logging.

### AWS Marketplace

This project is designed for deployment on **AWS Marketplace** as an AMI-based listing.

See [`docs/AWS_MARKETPLACE_GUIDE.md`](docs/AWS_MARKETPLACE_GUIDE.md) for the complete guide covering:
- AMI packaging with Packer
- Azure Pipelines integration for automated AMI builds
- AWS Marketplace listing configuration
- CloudFormation template for buyer deployment

---

## Infrastructure as Code

Terraform configuration in `infra/` provisions the AWS infrastructure:

| Resource | Description |
|---|---|
| VPC + Subnets | Public subnets across 2 AZs |
| ALB | Application Load Balancer with health checks |
| ACM | TLS certificate for the domain |
| EC2 | Instance with Docker + Docker Compose pre-installed |
| Security Groups | HTTP (80), HTTPS (443), SSH (22 — restricted), backend (3000) |

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # edit with your values
terraform init
terraform plan
terraform apply
```

---

## Documentation

| Document | Description |
|---|---|
| [`docs/SDLC_MULTI_AGENT_REPORT.md`](docs/SDLC_MULTI_AGENT_REPORT.md) | Full 14-agent SDLC analysis (product, architecture, security, performance, testing) |
| [`docs/ENGINEERING_BACKLOG.md`](docs/ENGINEERING_BACKLOG.md) | Prioritized backlog (P0–P3) derived from SDLC report |
| [`docs/CICD_SETUP_GUIDE.md`](docs/CICD_SETUP_GUIDE.md) | Azure Pipelines setup (ACR, SSH connections, variable groups) |
| [`docs/AWS_MARKETPLACE_GUIDE.md`](docs/AWS_MARKETPLACE_GUIDE.md) | AWS Marketplace deployment guide |
| [`docs/ANGULAR_UPGRADE_GUIDE.md`](docs/ANGULAR_UPGRADE_GUIDE.md) | Angular 13 → 17+ upgrade plan |
| [`docs/compliance/`](docs/compliance/) | Security whitepaper, DR policy, IAM matrix, incident response, etc. |
| [`scripts/backup-mongo.sh`](scripts/backup-mongo.sh) | MongoDB backup script (with optional S3 upload) |
| [`scripts/migrate-to-managed-mongo.sh`](scripts/migrate-to-managed-mongo.sh) | Migration to MongoDB Atlas / DocumentDB |

---

## License

Proprietary — All rights reserved.
