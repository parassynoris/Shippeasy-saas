# Shippeasy SaaS — Compliance Documentation Index

**Platform:** Shippeasy SaaS (Angular 13 / Node.js 22 / MongoDB 6)  
**Infrastructure:** AWS EC2 (ap-south-1) + Azure Container Registry  
**Last Updated:** March 2026

---

## Documents in this directory

| # | Document | Description |
|---|---|---|
| 01 | [Architecture Diagram](01_Architecture_Diagram.md) | Full-stack architecture — EC2, Docker containers, external integrations, request flow |
| 02 | [Network Diagram](02_Network_Diagram.md) | VPC layout, subnets, security groups, firewall rules, DNS/TLS |
| 03 | [Security Whitepaper](03_Security_Whitepaper.md) | Auth, encryption, CORS, container hardening, secrets management, known risks, roadmap |
| 04 | [DR & Backup Policy](04_DR_Backup_Policy.md) | RPO/RTO targets, MongoDB backup scripts, EBS snapshots, recovery runbooks |
| 05 | [Incident Response Plan](05_Incident_Response_Plan.md) | Severity levels, response phases, communication templates, per-scenario runbooks |
| 06 | [IAM Role Matrix](06_IAM_Role_Matrix.md) | AWS IAM, ACR service principals, ADO access, application roles, joiners/leavers |
| 07 | [CI/CD Flow Diagram](07_CICD_Flow_Diagram.md) | Azure Pipelines → ACR → EC2 flow, image lifecycle, rollback procedure |
| 08 | [Patch Management Policy](08_Patch_Management_Policy.md) | OS, Docker, container images, npm dependencies — schedule, SLAs, procedures |

---

## Related documentation

- [CI/CD Setup Guide](../CICD_SETUP_GUIDE.md) — Step-by-step Azure Pipelines + AWS EC2 setup
- [Root README](../../README.md) — Project overview, quick start, development guide
