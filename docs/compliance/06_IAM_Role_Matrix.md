# Shippeasy SaaS — IAM Role Matrix

**Document Version:** 1.0  
**Classification:** Confidential — Internal / Compliance  
**Owner:** Engineering Lead  
**Last Updated:** March 2026  
**Review Cycle:** Quarterly or on personnel change

---

## 1. Overview

This document defines all Identity and Access Management (IAM) roles, policies, and permission matrices across AWS, Azure, and Azure DevOps for the Shippeasy SaaS platform. All access follows the **Principle of Least Privilege** — every identity has only the minimum permissions required for its specific function.

---

## 2. AWS IAM Roles

### 2.1 EC2 Instance Profile — `shipeasy-ec2-role`

Attached to: Production EC2 instance (`shipeasy-prod`)  
Purpose: Allows the EC2 application to access AWS services without embedding credentials

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
```

**Inline Policy — `shipeasy-ec2-policy`:**

| Service | Action | Resource | Justification |
|---|---|---|---|
| S3 | `s3:PutObject` | `arn:aws:s3:::shipeasy-backups/*` | Upload MongoDB backups |
| S3 | `s3:GetObject` | `arn:aws:s3:::shipeasy-backups/*` | Download backups for restore |
| S3 | `s3:ListBucket` | `arn:aws:s3:::shipeasy-backups` | List backup files |
| S3 | `s3:PutObject`, `s3:GetObject` | `arn:aws:s3:::shipeasy-docs/*` | Document storage |
| CloudWatch Logs | `logs:CreateLogGroup` | `arn:aws:logs:ap-south-1:*:*` | Create log groups |
| CloudWatch Logs | `logs:CreateLogStream` | `arn:aws:logs:ap-south-1:*:*` | Create log streams |
| CloudWatch Logs | `logs:PutLogEvents` | `arn:aws:logs:ap-south-1:*:*` | Ship application logs |
| CloudWatch | `cloudwatch:PutMetricData` | `*` | Custom metrics |
| SNS | `sns:Publish` | `arn:aws:sns:ap-south-1:*:shipeasy-alerts` | Ops notifications |
| Secrets Manager | `secretsmanager:GetSecretValue` | `arn:aws:secretsmanager:ap-south-1:*:secret:shipeasy/*` | Retrieve app secrets |
| Cognito IDP | `cognito-idp:AdminGetUser` | `arn:aws:cognito-idp:ap-south-1:*:userpool/*` | User lookup |

**Explicitly DENIED:**
- `iam:*` — no IAM modifications
- `ec2:*` — no EC2 control plane actions
- `s3:DeleteObject` on backup bucket — backups are append-only
- `kms:ScheduleKeyDeletion` — no KMS key destruction

---

### 2.2 Backup Automation Role — `shipeasy-backup-role`

Used by: AWS Data Lifecycle Manager (DLM) for EBS snapshots  
Purpose: Create and manage EBS snapshots

```json
{
  "Effect": "Allow",
  "Action": [
    "ec2:CreateSnapshot",
    "ec2:CreateSnapshots",
    "ec2:DeleteSnapshot",
    "ec2:DescribeInstances",
    "ec2:DescribeSnapshots",
    "ec2:DescribeVolumes",
    "ec2:CreateTags"
  ],
  "Resource": "*"
}
```

---

### 2.3 CI/CD Pipeline Role (Future) — `shipeasy-cicd-role`

*Currently the pipeline uses SSH key auth. This role is for future migration to AWS CodeDeploy or OIDC-based pipelines.*

```json
{
  "Effect": "Allow",
  "Action": [
    "ssm:SendCommand",
    "ssm:GetCommandInvocation",
    "ec2:DescribeInstances"
  ],
  "Resource": "*"
}
```

---

## 3. AWS IAM Users Matrix

| Username | Type | AWS Console? | Programmatic? | Attached Policies | Purpose |
|---|---|---|---|---|---|
| `admin-paras` | Human | ✅ | ✅ | `AdministratorAccess` | Primary admin |
| `readonly-auditor` | Human | ✅ | ❌ | `ReadOnlyAccess` | Security audit reviews |
| `shipeasy-backup` | Service | ❌ | ✅ | Custom backup policy | Programmatic S3 backup (if DLM not used) |

> **Rule:** No shared IAM users. Each human has their own user. Service accounts use IAM Roles where possible.

---

## 4. AWS S3 Bucket Policies

### 4.1 `shipeasy-backups` (MongoDB & config backups)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyPublicAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::shipeasy-backups", "arn:aws:s3:::shipeasy-backups/*"],
      "Condition": {"Bool": {"aws:SecureTransport": "false"}}
    },
    {
      "Sid": "AllowEC2Role",
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::<ACCOUNT_ID>:role/shipeasy-ec2-role"},
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::shipeasy-backups", "arn:aws:s3:::shipeasy-backups/*"]
    }
  ]
}
```

Bucket settings:
- Block all public access: **ENABLED**
- Versioning: **ENABLED**
- Lifecycle: Delete objects older than 30 days
- Encryption: SSE-KMS

---

## 5. Azure — ACR Access Matrix

| Identity | Role | Scope | Permissions |
|---|---|---|---|
| ADO Service Connection (`acr-connection`) | `AcrPush` | ACR resource | Push images (build stage) |
| EC2 Service Principal (`shipeasy-ec2-pull`) | `AcrPull` | ACR resource | Pull images (deploy stage) |
| Engineering Lead (`admin@org.com`) | `Owner` | ACR resource | Full admin |
| Developer | `AcrPull` | ACR resource | Pull images for local dev |

**ACR Service Principals:**

| Name | Type | Role | Client ID | Rotation |
|---|---|---|---|---|
| `shipeasy-ado-push` | Service Principal | AcrPush | `<sp-id>` | Every 12 months |
| `shipeasy-ec2-pull` | Service Principal | AcrPull | `<sp-id>` | Every 12 months |

---

## 6. Azure DevOps — User Access Matrix

| Role | ADO Permission Level | Access |
|---|---|---|
| Engineering Lead | **Project Administrator** | Full pipeline, repo, variable group access |
| Senior Developer | **Contributor** | Push to feature branches, run pipelines |
| Developer | **Contributor** | Push to feature branches |
| QA Engineer | **Reader** + pipeline trigger | Run pipelines, read logs |
| External Auditor | **Stakeholder** | Read-only repo and pipeline results |

**Variable Group — `shipeasy-secrets`:**

| User/Group | Permission |
|---|---|
| Project Administrators | Administer |
| Build Service | Read (pipelines only) |
| Developers | No access (secrets are masked) |

**Branch Policies on `main`:**

| Policy | Setting |
|---|---|
| Require PR review | 1 approver minimum |
| Require linked work item | Optional |
| Require passing build | `Test` stage must pass |
| Prevent force push | Enabled |
| Restrict merge types | Squash or merge commit |

---

## 7. Application-Level Role Matrix (Shippeasy App)

The application enforces role-based access via JWT claims and user model roles stored in MongoDB.

| Role | Description | Accessible Modules |
|---|---|---|
| `superadmin` | Platform owner | All modules + admin panel + user management |
| `admin` | Organisation admin | All modules within their `orgId` + user management |
| `manager` | Team manager | Shipments, invoices, reports, EDI, load planning |
| `user` | Standard user | Shipments, invoices, assigned tasks |
| `viewer` | Read-only | Reports and dashboards (read-only) |
| `api_service` | Service account | Webhook processing, automation triggers |

**API Authorization flow:**

```
Request → validateAuth middleware
              │
              ├── Verify JWT signature (SECRET_KEY_JWT)
              ├── Check tokenVersion matches MongoDB user record
              ├── Load user + org data into res.locals
              │
              └── Controller checks res.locals.user.role
                       │
                       ├── Allowed → proceed
                       └── Denied  → 403 Forbidden
```

---

## 8. SSH Access Matrix

| User | EC2 Private IP | Key File | Access Reason | Review Date |
|---|---|---|---|---|
| Engineering Lead | 10.0.1.10 | `shipeasy-admin.pem` | Full admin | Quarterly |
| Azure Pipelines Agent | 10.0.1.10 | `shipeasy-cicd.pem` | Deploy only | Quarterly |

**SSH Key Rules:**
- Ed25519 key algorithm (4096-bit RSA minimum if Ed25519 not supported)
- Keys stored in: AWS Secrets Manager (`shipeasy/ssh/admin-key`)
- Pipeline key stored in: ADO SSH service connection (encrypted)
- No password-based SSH authentication (`PasswordAuthentication no` in `/etc/ssh/sshd_config`)
- Root login disabled (`PermitRootLogin no`)

---

## 9. Access Review Schedule

| Review Type | Frequency | Owner | Action |
|---|---|---|---|
| AWS IAM users & policies | Quarterly | Engineering Lead | Remove unused users; rotate keys > 90 days old |
| ACR service principal keys | Every 12 months | Engineering Lead | Rotate client secrets |
| ADO user access | On personnel change + quarterly | Engineering Lead | Remove departed users immediately |
| SSH key audit | Quarterly | Engineering Lead | Remove unused keys from `authorized_keys` |
| Application roles | Monthly | Product Manager | Review user roles per org |
| Variable group access | Quarterly | Engineering Lead | Verify only pipeline service accounts have Read |

---

## 10. Joiners / Movers / Leavers Process

### New Employee (Joiner)

```
Day 1:
  [ ] Create AWS IAM user with MFA required
  [ ] Add to ADO project with appropriate role
  [ ] Issue EC2 SSH key only if role requires it
  [ ] Onboard to app with correct role (admin/manager/user)
  [ ] Document in access register
```

### Role Change (Mover)

```
On role change:
  [ ] Update ADO project role
  [ ] Update AWS IAM group membership
  [ ] Update application role in MongoDB
  [ ] Review and adjust SSH key access
  [ ] Update access register
```

### Departure (Leaver)

```
On last day (same day as departure):
  [ ] Disable AWS IAM user (do NOT delete — preserve audit trail)
  [ ] Remove from ADO project
  [ ] Remove SSH public key from EC2 authorized_keys
  [ ] Deactivate app user account
  [ ] Rotate secrets if user had access to:
        - JWT_SECRET
        - SMTP credentials
        - ACR service principal
  [ ] Update access register
```
