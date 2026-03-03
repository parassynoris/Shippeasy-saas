# Shippeasy SaaS — AWS Architecture Diagram

**Document Version:** 1.0  
**Classification:** Internal / Compliance  
**Last Updated:** March 2026

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTERNET / END USERS                               │
│              (Browsers, Mobile PWA, Third-party Webhooks)                   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTPS :443 / HTTP :80
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AWS — ap-south-1 (Mumbai)                           │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Public Subnet (10.0.1.0/24)                       │   │
│  │                                                                      │   │
│  │   ┌──────────────────────────────────────────────────────────────┐   │   │
│  │   │                  EC2 Instance  (t3.medium)                   │   │   │
│  │   │                  Amazon Linux 2 / Ubuntu 22.04               │   │   │
│  │   │                                                              │   │   │
│  │   │   ┌─────────────────────────────────────────────────────┐    │   │   │
│  │   │   │              Docker Engine                          │    │   │   │
│  │   │   │                                                     │    │   │   │
│  │   │   │  ┌─────────────┐  ┌──────────────┐  ┌───────────-┐  │    │   │   │
│  │   │   │  │  nginx      │  │  Node.js API │  │  MongoDB   │  │    │   │   │
│  │   │   │  │  (frontend) │  │  (backend)   │  │  (data)    │  │    │   │   │
│  │   │   │  │  port: 80   │  │  port: 3000  │  │  internal  │  │    │   │   │
│  │   │   │  │  Angular SPA│  │  Express 4   │  │  port 27017│  │    │   │   │
│  │   │   │  └──────┬──────┘  └──────┬───────┘  └─────--┬───-┘  │    │   │   │
│  │   │   │         │  /api proxy    │                  │       │    │   │   │
│  │   │   │         └───────────────►│◄─────────────────┘       │    │   │   │
│  │   │   │                          │   shipeasy_net (bridge)  │    │   │   │
│  │   │   └─────────────────────────┬┴──────────────────────────┘    │   │   │
│  │   │                             │                                │   │   │
│  │   │   Named Volumes:            │                                │   │   │
│  │   │   ├── mongo_data (/data/db) │                                │   │   │
│  │   │   └── logs_data  (/app/logs)│                                │   │   │
│  │   └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │   Security Group: shipeasy-sg                                        │   │
│  │   Inbound:  80/tcp (0.0.0.0/0), 443/tcp (0.0.0.0/0), 22/tcp (CI CIDR)│   │
│  │   Outbound: ALL (0.0.0.0/0)                                          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Private Subnet (10.0.2.0/24)                      │   │
│  │   (Reserved for future: RDS, ElastiCache, additional services)       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │   AWS Services (Managed)                                             │   │
│  │   ├── S3 Bucket:      shipeasy-docs (document storage)               │   │
│  │   ├── S3 Bucket:      shipeasy-backups (MongoDB dumps)               │   │
│  │   ├── CloudWatch:     EC2 metrics, log groups, alarms                │   │
│  │   ├── SNS Topic:      shipeasy-alerts (ops notifications)            │   │
│  │   ├── IAM:            Roles, Policies, Instance Profile              │   │
│  │   └── Route 53:       DNS management (optional)                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

External Integrations:
┌────────────────────────────────────────────────────────────────────────────┐
│  Azure Container Registry  →  Docker image pull (ACR)                      │
│  Azure Blob Storage        →  Document/file storage (shipeasy container)   │
│  AWS Cognito               →  User authentication (ap-south-1)             │
│  Google OAuth              →  SSO login                                    │
│  Elastic APM               →  Application performance monitoring           │
│  Firebase FCM              →  Push notifications (PWA)                     │
│  Mapbox GL                 →  Map rendering                                │
│  WhatsApp Business API     →  Messaging integration                        │
│  ULIP API                  →  Container tracking / logistics data          │
│  OpenAI / Gemini           →  AI-assisted features                         │
│  Bold BI                   →  Embedded reporting                           │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Request Flow (Runtime)

```
User Browser
    │
    │  GET https://app.shippeasy.com/
    ▼
EC2 :80 → nginx container
    │
    ├── Static assets  →  served directly from /usr/share/nginx/html
    │
    └── /api/* requests
            │
            │  proxy_pass http://backend:3000/
            ▼
        Node.js API container
            │
            ├── JWT validation (middleware/auth.js)
            │
            ├── Business logic (controllers/)
            │
            └── MongoDB (shipeasy_net bridge → mongo container)
                    │
                    └── Named volume: mongo_data (persisted on EC2 EBS)
```

---

## 3. Container Architecture

| Container | Image | Exposed Port | Internal Port | Role |
|---|---|---|---|---|
| `shipeasy_frontend` | `<acr>.azurecr.io/shipeasy-frontend:<sha>` | 80 | 80 | nginx — Angular SPA + API proxy |
| `shipeasy_api` | `<acr>.azurecr.io/shipeasy-api:<sha>` | 3000 | 3000 | Express REST API + Socket.io |
| `shipeasy_mongo` | `mongo:6` | _none (internal)_ | 27017 | MongoDB data store |

---

## 4. Technology Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | Angular | 13 |
| Frontend UI | Angular Material, Bootstrap, NG-Zorro | — |
| Frontend Serving | nginx | stable-alpine |
| Backend Runtime | Node.js | 22 (LTS) |
| Backend Framework | Express | 4.x |
| Database | MongoDB | 6 |
| ORM | Mongoose | 8 |
| Real-time | Socket.io | 4.x |
| Auth | JWT + AWS Cognito + Google OAuth | — |
| Container Runtime | Docker Engine | 24+ |
| Orchestration | Docker Compose | v2 |
| CI Pipeline | Azure Pipelines | — |
| Container Registry | Azure Container Registry | — |
| Observability | Elastic APM + Winston | — |
| Cloud Platform | AWS EC2 (ap-south-1) | — |

---

## 5. Data Classification

| Data Type | Classification | Storage Location |
|---|---|---|
| User credentials | **Confidential** | MongoDB (hashed — bcrypt) |
| JWT tokens | **Confidential** | Client memory (not persisted) |
| Shipping documents | **Sensitive** | Azure Blob Storage |
| Application logs | Internal | EC2 Docker volume + CloudWatch |
| Database backups | **Confidential** | AWS S3 (encrypted) |
| Configuration secrets | **Confidential** | EC2 `.env` (not committed to repo) |
| API keys (third-party) | **Confidential** | ADO Variable Group (masked) |
