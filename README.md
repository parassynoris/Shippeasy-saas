# Shippeasy SaaS

A full-stack SaaS logistics and shipping management platform. Built with **Angular 13** on the frontend and **Node.js / Express** on the backend, backed by **MongoDB** and supporting real-time operations via **Socket.io**.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Modules & Features](#modules--features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development (without Docker)](#local-development-without-docker)
  - [Running with Docker](#running-with-docker)
- [API Overview](#api-overview)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)

---

## Architecture Overview

```
Shippeasy-saas/
├── shipeasy/          # Angular 13 frontend (PWA)
└── shipeasy-api/      # Node.js / Express REST API
```

```
[ Browser / PWA ]
       │
       ▼
[ nginx (port 80) ]  ──►  [ Angular SPA ]
       │
       │ HTTP / WebSocket
       ▼
[ Express API (port 3000) ]
       │
       ├──► [ MongoDB ]
       ├──► [ Azure Blob Storage ]
       ├──► [ Elastic APM ]
       ├──► [ Socket.io (real-time) ]
       └──► [ Cron Workers / Queue ]
```

---

## Tech Stack

### Frontend — `shipeasy/`

| Layer | Technology |
|---|---|
| Framework | Angular 13 |
| UI Library | Angular Material, Bootstrap 5, NG-Zorro, MDB |
| Charts | ECharts, Chart.js, Swimlane ngx-charts |
| Maps | Mapbox GL |
| Auth | Azure MSAL, Amazon Cognito |
| Rich Text | CKEditor 5 |
| PDF | jsPDF, ng2-pdf-viewer |
| i18n | @ngx-translate |
| PWA | Firebase Cloud Messaging, manifest.json |
| Build | Angular CLI, Yarn |
| Serving | nginx (production) |

### Backend — `shipeasy-api/`

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express 4 |
| Database | MongoDB (Mongoose 8) |
| Real-time | Socket.io 4 |
| Auth | JWT, Amazon Cognito, Google Auth |
| Storage | Azure Blob Storage |
| Email | Nodemailer, IMAP (imap-simple, imapflow) |
| Reports | Jasper Reports, ExcelJS, PDFParse |
| Queue | Built-in queue service |
| Scheduling | node-cron |
| AI | OpenAI, Google Generative AI (Gemini) |
| Observability | Elastic APM, Winston logger |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Messaging | WhatsApp integration, In-app notifications |

---

## Modules & Features

| Module | Description |
|---|---|
| **Auth** | Login, registration, JWT sessions, Cognito/Google/Azure SSO |
| **Admin Panel** | Full administrative controls, user management |
| **Self-service Dashboard** | Shipment tracking, overview metrics |
| **Release Manager** | Manage software / shipment releases |
| **Ticket Admin** | Support ticket management |
| **EDI** | Electronic Data Interchange processing |
| **E-Invoicing** | Digital invoice generation and management |
| **Load Planning** | Cargo / container load planning tools |
| **Tally Integration** | Tally accounting software sync |
| **Credit Reports** | Customer credit assessment |
| **QR Code** | Dynamic QR code generation |
| **Automations** | Rule-based workflow automations |
| **Webhooks** | Inbound/outbound webhook processing |
| **Notifications** | In-app, Email, WhatsApp |
| **Real-time** | Live updates via Socket.io |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Yarn (frontend) / npm (backend)
- MongoDB >= 6
- Docker & Docker Compose (for containerised setup)

### Environment Variables

**Backend — `shipeasy-api/.env`**

```env
PORT=3000
ENVIRONMENT=development

# MongoDB
MONGO_URI=mongodb://mongo:27017/shipeasy

# Auth
JWT_SECRET=your_jwt_secret

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=

# AWS / Cognito
AWS_REGION=
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Elastic APM
APM_SERVER=

# OpenAI
OPENAI_API_KEY=

# WhatsApp / Webhooks
WHATSAPP_API_KEY=
```

**Frontend — `shipeasy/src/environments/environment.ts`**

Configure `apiUrl`, Firebase config, Azure MSAL, and Mapbox token in the environment files.

---

### Local Development (without Docker)

#### Backend

```bash
cd shipeasy-api
cp .env.example .env        # configure variables
npm install
npm start                   # runs on http://localhost:3000
```

API docs available at: `http://localhost:3000/api-docs`

#### Frontend

```bash
cd shipeasy
yarn install
yarn start                  # runs on http://localhost:4200
```

The dev server proxies API calls to `localhost:3000` via `src/proxy.conf.json`.

---

### Running with Docker

#### Production

```bash
# from repo root
docker compose up --build -d
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`

#### Development (with hot-reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

## API Overview

| Group | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Login, register, token refresh |
| Dashboard | `/api/dashboard` | Metrics and summary data |
| Search | `/api/search` | Global search |
| Reports | `/api/reports` | Generate and download reports |
| EDI | `/api/edi` | EDI file processing |
| E-Invoicing | `/api/einvoicing` | Invoice operations |
| Load Plan | `/api/loadplan` | Load planning operations |
| Tally | `/api/tally` | Tally sync |
| Webhooks | `/api/webhooks` | Webhook receiver |
| Storage | `/api/storage` | Azure Blob operations |
| WhatsApp | `/api/whatsapp` | WhatsApp messaging |
| QR | `/api/qr` | QR code generation |

Full interactive docs at: `http://localhost:3000/api-docs` (Swagger UI)

---

## Testing

```bash
# Backend unit tests (Jest)
cd shipeasy-api
npm test

# Frontend unit tests (Karma)
cd shipeasy
yarn test

# Frontend e2e tests (Protractor)
cd shipeasy
yarn e2e
```

---

## CI/CD

Azure Pipelines is configured via [`shipeasy-api/azure-pipelines.yml`](shipeasy-api/azure-pipelines.yml).

Pipeline stages:
1. Install dependencies
2. Run tests
3. Build Docker image
4. Push to container registry
5. Deploy to target environment

---

## Deployment

The application is containerised and deployable via Docker Compose or Kubernetes.

- **Frontend**: Built as a static Angular app served by `nginx:alpine`
- **Backend**: Node.js app running in a minimal `node:alpine` container
- **Database**: MongoDB with a persistent named volume
- **Reverse proxy**: nginx handles SPA routing and gzip compression

For Kubernetes deployment, refer to your cluster manifests (not included in this repo).

---

## License

Proprietary — All rights reserved.
