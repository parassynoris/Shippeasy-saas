# Shippeasy SaaS — Network Diagram & VPC Layout

**Document Version:** 1.0  
**Classification:** Internal / Compliance  
**Last Updated:** March 2026

---

## 1. VPC Layout

```
AWS Region: ap-south-1 (Mumbai)
┌──────────────────────────────────────────────────────────────────────────────┐
│  VPC: shipeasy-vpc   CIDR: 10.0.0.0/16                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Availability Zone: ap-south-1a                                         │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────┐                       │ │
│  │  │  PUBLIC SUBNET                               │                       │ │
│  │  │  CIDR:   10.0.1.0/24                         │                       │ │
│  │  │  Purpose: Application servers                │                       │ │
│  │  │                                              │                       │ │
│  │  │  ┌───────────────────────────────────────┐   │                       │ │
│  │  │  │  EC2: shipeasy-prod                   │   │                       │ │
│  │  │  │  Type: t3.medium                      │   │                       │ │
│  │  │  │  Private IP: 10.0.1.10                │   │                       │ │
│  │  │  │  Public IP:  (Elastic IP)             │   │                       │ │
│  │  │  │  OS: Ubuntu 22.04 LTS                 │   │                       │ │
│  │  │  │  SG: shipeasy-app-sg                  │   │                       │ │
│  │  │  │  IAM Role: shipeasy-ec2-role          │   │                       │ │
│  │  │  └───────────────────────────────────────┘   │                       │ │
│  │  └──────────────────────────────────────────────┘                       │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────┐                       │ │
│  │  │  PRIVATE SUBNET                              │                       │ │
│  │  │  CIDR:   10.0.2.0/24                         │                       │ │
│  │  │  Purpose: Reserved (RDS / ElastiCache)       │                       │ │
│  │  │  Currently: Empty                            │                       │ │
│  │  └──────────────────────────────────────────────┘                       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌──────────────────────────────────────────────────┐                        │
│  │  Internet Gateway: shipeasy-igw                  │                        │
│  │  Attached to: shipeasy-vpc                       │                        │
│  └──────────────────────────────────────────────────┘                        │
│                                                                              │
│  Route Tables:                                                               │
│  ├── Public RT:  10.0.0.0/16 → local                                         │
│  │               0.0.0.0/0   → shipeasy-igw                                  │
│  └── Private RT: 10.0.0.0/16 → local                                         │
│                  0.0.0.0/0   → NAT Gateway (when added)                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Security Groups

### 2.1 shipeasy-app-sg (EC2 Application Server)

**Inbound Rules:**

| Rule # | Type | Protocol | Port Range | Source | Description |
|---|---|---|---|---|---|
| 100 | HTTP | TCP | 80 | 0.0.0.0/0, ::/0 | Public web traffic |
| 110 | HTTPS | TCP | 443 | 0.0.0.0/0, ::/0 | Public web traffic (TLS) |
| 120 | Custom TCP | TCP | 3000 | 10.0.0.0/16 | API — internal VPC only |
| 130 | SSH | TCP | 22 | Azure Pipelines CIDR | CI/CD deployment only |
| 140 | SSH | TCP | 22 | Admin IP (office) | Emergency admin access |

**Outbound Rules:**

| Rule # | Type | Protocol | Port Range | Destination | Description |
|---|---|---|---|---|---|
| 100 | All traffic | All | All | 0.0.0.0/0 | Outbound internet |

> **Note:** Port 27017 (MongoDB) is intentionally absent from all inbound security group rules. MongoDB is accessed exclusively through the Docker internal bridge network (`shipeasy_net`) — it is never reachable from the host network or internet.

---

## 3. Network Flow Diagram

```
INTERNET
    │
    │  TCP :80 / :443
    ▼
┌─────────────────────────────┐
│   Internet Gateway (IGW)    │
│   shipeasy-igw              │
└──────────────┬──────────────┘
               │
               │  Routed to 10.0.1.0/24 (Public Subnet)
               ▼
┌─────────────────────────────┐
│   Security Group            │
│   shipeasy-app-sg           │
│   Allow: :80, :443, :22     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│   EC2: shipeasy-prod (10.0.1.10)                                │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Docker Bridge Network: shipeasy_net (172.18.0.0/16)    │   │
│   │                                                         │   │
│   │   nginx          →  172.18.0.2:80                       │   │
│   │   Node.js API    →  172.18.0.3:3000                     │   │
│   │   MongoDB        →  172.18.0.4:27017  (internal only)   │   │
│   │                                                         │   │
│   │   nginx ──/api/*──► Node.js API ──► MongoDB             │   │
│   │                              └─────► Azure Blob Storage │   │
│   │                              └─────► AWS Cognito        │   │
│   │                              └─────► External APIs      │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

               │  Outbound HTTPS (:443)
               ▼
┌─────────────────────────────────────────────────────────────────┐
│   External Services                                             │
│   ├── shippeasy.azurecr.io        (Docker image pull)           │
│   ├── *.blob.core.windows.net     (Azure Blob Storage)          │
│   ├── cognito-idp.ap-south-1.amazonaws.com (AWS Cognito)        │
│   ├── apm.synoris.co              (Elastic APM)                 │
│   ├── api.openai.com              (OpenAI)                      │
│   ├── fcm.googleapis.com          (Firebase push)               │
│   ├── api.mapbox.com              (Mapbox)                      │
│   └── graph.facebook.com         (WhatsApp Business API)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. DNS & TLS

| Record | Type | Value | Purpose |
|---|---|---|---|
| `app.shippeasy.com` | A | Elastic IP of EC2 | App entry point |
| `api.shippeasy.com` | A | Elastic IP of EC2 | API (if split domain used) |

**TLS Termination:** nginx (inside EC2 container)
- Certificate: Let's Encrypt (Certbot) or AWS Certificate Manager (ACM) if ALB is introduced
- Protocol: TLS 1.2 minimum, TLS 1.3 preferred
- Cipher Suite: ECDHE-RSA-AES256-GCM-SHA384 and modern equivalents

---

## 5. Firewall & Network ACL

| Layer | Tool | Policy |
|---|---|---|
| Perimeter | AWS Security Group | Stateful — only listed ports allowed |
| Host | UFW (Ubuntu Firewall) | Port 22, 80, 443 — all else DENY |
| Application | CORS policy in Express | Configurable per environment |
| Container | Docker bridge isolation | MongoDB not reachable from host |

---

## 6. Future Network Hardening (Recommended Roadmap)

| Item | Priority | Description |
|---|---|---|
| Add Application Load Balancer (ALB) | High | TLS offload at ALB; EC2 accepts only port 80 from ALB SG |
| Move MongoDB to private subnet | High | Dedicated EC2 or Amazon DocumentDB in private subnet |
| Add NAT Gateway | Medium | Allow private subnet outbound without public IP |
| Enable AWS WAF on ALB | High | Protect against OWASP Top 10 |
| Enable VPC Flow Logs | High | Log all VPC traffic to S3/CloudWatch for audit |
| Add AWS Shield Standard | Low | Free DDoS protection (auto-enabled on ALB/EC2) |
| Add second AZ (Multi-AZ) | Medium | Secondary EC2 for high availability |
