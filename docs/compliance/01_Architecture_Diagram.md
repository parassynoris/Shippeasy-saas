# Shippeasy SaaS — AWS Architecture Diagram

**Document Version:** 1.0  
**Classification:** Internal / Compliance  
**Last Updated:** March 2026

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Users["🌐 Internet / End Users<br/>Browsers · Mobile PWA · Webhooks"]

    subgraph AWS["AWS — ap-south-1 Mumbai"]
        subgraph PublicSubnet["Public Subnet 10.0.1.0/24"]
            subgraph EC2["EC2 t3.medium — Ubuntu 22.04<br/>SG: shipeasy-app-sg"]
                subgraph DockerNet["Docker Bridge — shipeasy_net"]
                    FE["nginx :80<br/>Angular SPA"]
                    API["Node.js API :3000<br/>Express 4 + Socket.io"]
                    DB["MongoDB :27017<br/>internal only<br/>vol: mongo_data"]
                end
            end
        end
        subgraph PrivateSubnet["Private Subnet 10.0.2.0/24"]
            Reserved["Reserved — RDS / ElastiCache"]
        end
        S3["S3 Buckets<br/>shipeasy-docs / shipeasy-backups"]
        CW["CloudWatch<br/>Metrics + Logs + Alarms"]
        SNS["SNS — shipeasy-alerts"]
        IAM["IAM — Roles + Policies"]
    end

    ACR["Azure Container Registry<br/>Docker Images"]
    AzBlob["Azure Blob Storage<br/>ship-docs container"]
    Cognito["AWS Cognito<br/>ap-south-1"]
    GoogleOAuth["Google OAuth 2.0"]
    APM["Elastic APM<br/>apm.synoris.co"]
    Firebase["Firebase FCM<br/>Push Notifications"]
    WhatsApp["WhatsApp Business API"]
    ULIP["ULIP API<br/>Logistics Tracking"]
    OpenAI["OpenAI / Gemini"]
    BoldBI["Bold BI<br/>Embedded Reporting"]

    Users -->|"HTTPS :443 / :80"| FE
    FE -->|"/api/* proxy_pass"| API
    API --> DB
    API --> S3
    API --> CW
    API --> SNS
    API --> AzBlob
    API --> Cognito
    API --> GoogleOAuth
    API --> APM
    API --> WhatsApp
    API --> ULIP
    API --> OpenAI
    API --> BoldBI
    FE --> Firebase
    ACR -->|"docker pull"| EC2
```

---

## 2. Request Flow (Runtime)

```mermaid
sequenceDiagram
    participant U as User Browser
    participant N as nginx :80
    participant A as Node.js API :3000
    participant M as MongoDB

    U->>N: GET https://app.shippeasy.com/
    alt Static asset (HTML / JS / CSS)
        N-->>U: Served from /usr/share/nginx/html
    else /api/* request
        N->>A: proxy_pass http://backend:3000/
        A->>A: JWT validation (middleware/auth.js)
        A->>M: Query / Write (shipeasy_net bridge)
        M-->>A: Result
        A-->>N: JSON response
        N-->>U: JSON response
    end
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
