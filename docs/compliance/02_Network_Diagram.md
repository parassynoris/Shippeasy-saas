# Shippeasy SaaS — Network Diagram & VPC Layout

**Document Version:** 1.0  
**Classification:** Internal / Compliance  
**Last Updated:** March 2026

---

## 1. VPC Layout

```mermaid
graph TD
    Internet["🌐 Internet"]

    subgraph VPC["VPC: shipeasy-vpc — CIDR 10.0.0.0/16  |  ap-south-1"]
        IGW["Internet Gateway<br/>shipeasy-igw"]

        subgraph AZ["Availability Zone: ap-south-1a"]
            subgraph PubSub["Public Subnet — 10.0.1.0/24"]
                SG["Security Group<br/>shipeasy-app-sg<br/>In: :80 :443 :22"]
                EC2["EC2: shipeasy-prod<br/>Private IP: 10.0.1.10<br/>Elastic IP — public<br/>t3.medium · Ubuntu 22.04<br/>IAM: shipeasy-ec2-role"]
                SG --> EC2
            end
            subgraph PrivSub["Private Subnet — 10.0.2.0/24"]
                Reserved["Reserved<br/>Future: RDS / ElastiCache"]
            end
        end

        subgraph RT["Route Tables"]
            PubRT["Public RT<br/>10.0.0.0/16 → local<br/>0.0.0.0/0 → IGW"]
            PrivRT["Private RT<br/>10.0.0.0/16 → local<br/>0.0.0.0/0 → NAT GW"]
        end
    end

    Internet -->|":80 / :443"| IGW
    IGW --> SG
    PubSub -.->|"route"| PubRT
    PrivSub -.->|"route"| PrivRT
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

```mermaid
graph TD
    Internet["🌐 Internet<br/>TCP :80 / :443"]
    IGW["Internet Gateway<br/>shipeasy-igw"]
    SG["Security Group<br/>shipeasy-app-sg<br/>Allow :80, :443, :22"]

    subgraph EC2["EC2: shipeasy-prod — 10.0.1.10"]
        subgraph DockerNet["Docker Bridge — shipeasy_net  172.18.0.0/16"]
            nginx["nginx — 172.18.0.2:80<br/>Angular SPA"]
            NodeAPI["Node.js API — 172.18.0.3:3000"]
            MongoDB["MongoDB — 172.18.0.4:27017<br/>⛔ internal only"]
        end
    end

    subgraph External["External Services — outbound HTTPS :443"]
        ACR["shippeasy.azurecr.io<br/>Docker images"]
        AzBlob["*.blob.core.windows.net<br/>Azure Blob Storage"]
        AWSCognito["cognito-idp.ap-south-1<br/>AWS Cognito"]
        APM["apm.synoris.co<br/>Elastic APM"]
        OpenAI["api.openai.com"]
        FCM["fcm.googleapis.com<br/>Firebase FCM"]
        Mapbox["api.mapbox.com"]
        WA["graph.facebook.com<br/>WhatsApp API"]
    end

    Internet --> IGW --> SG --> nginx
    nginx -->|"/api/* proxy"| NodeAPI
    NodeAPI --> MongoDB
    NodeAPI --> ACR
    NodeAPI --> AzBlob
    NodeAPI --> AWSCognito
    NodeAPI --> APM
    NodeAPI --> OpenAI
    nginx --> FCM
    NodeAPI --> Mapbox
    NodeAPI --> WA
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
