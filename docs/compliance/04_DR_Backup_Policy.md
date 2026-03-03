# Shippeasy SaaS — Disaster Recovery & Backup Policy

**Document Version:** 1.0  
**Classification:** Internal / Compliance  
**Owner:** Engineering Lead  
**Last Updated:** March 2026  
**Review Cycle:** Annually

---

## 1. Purpose & Scope

This policy defines the Disaster Recovery (DR) and Backup procedures for the Shippeasy SaaS platform. It covers the production environment running on AWS EC2 (ap-south-1 / Mumbai), the MongoDB database, application configuration, and container images stored in Azure Container Registry.

**Objectives:**
- Define Recovery Time Objective (RTO) and Recovery Point Objective (RPO)
- Document all backup procedures and schedules
- Define restoration procedures for each component
- Assign roles and responsibilities for DR events

---

## 2. RTO & RPO Targets

| Component | RPO (Data Loss Tolerance) | RTO (Recovery Time Target) |
|---|---|---|
| MongoDB (business data) | ≤ 6 hours | ≤ 2 hours |
| Application containers | ≤ 1 hour | ≤ 30 minutes |
| Application configuration (`.env`) | ≤ 24 hours | ≤ 1 hour |
| Full system recovery (new EC2) | ≤ 24 hours | ≤ 4 hours |

---

## 3. Backup Strategy

### 3.1 MongoDB Database Backups

**Method:** `mongodump` — binary export to compressed archive  
**Schedule:** Every 6 hours via cron job on EC2  
**Destination:** AWS S3 bucket — `s3://shipeasy-backups/mongodb/`  
**Retention:** 30 days (S3 lifecycle rule)  
**Encryption:** SSE-KMS on S3 bucket  

**Cron job (`/etc/cron.d/shipeasy-backup`):**

```bash
# MongoDB backup every 6 hours
0 */6 * * * ubuntu bash /home/ubuntu/shipeasy/scripts/backup-mongo.sh >> /var/log/shipeasy-backup.log 2>&1
```

**Backup script (`scripts/backup-mongo.sh`):**

```bash
#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/mongo-backup-${TIMESTAMP}"
ARCHIVE="shipeasy-db-${TIMESTAMP}.tar.gz"
S3_BUCKET="s3://shipeasy-backups/mongodb"

# Dump from running container
docker exec shipeasy_mongo mongodump \
  --db shipeasy \
  --out "/tmp/backup-${TIMESTAMP}"

# Copy from container to host
docker cp "shipeasy_mongo:/tmp/backup-${TIMESTAMP}" "${BACKUP_DIR}"

# Compress
tar -czf "/tmp/${ARCHIVE}" -C /tmp "${BACKUP_DIR##*/}"

# Upload to S3 (uses EC2 IAM role — no credentials needed)
aws s3 cp "/tmp/${ARCHIVE}" "${S3_BUCKET}/${ARCHIVE}"

# Cleanup
rm -rf "${BACKUP_DIR}" "/tmp/${ARCHIVE}"

echo "[$(date -u)] Backup complete: ${S3_BUCKET}/${ARCHIVE}"
```

### 3.2 EC2 AMI Snapshots

**Method:** AWS AMI (Amazon Machine Image) snapshot of the full EC2 instance  
**Schedule:** Weekly (every Sunday at 02:00 UTC)  
**Retention:** 4 AMIs (rolling — 4 weeks)  
**Automation:** AWS Data Lifecycle Manager (DLM) policy

**DLM Policy configuration:**
```json
{
  "ResourceTypes": ["INSTANCE"],
  "TargetTags": [{"Key": "Name", "Value": "shipeasy-prod"}],
  "Schedules": [{
    "Name": "Weekly-AMI",
    "CreateRule": {"Interval": 7, "IntervalUnit": "DAYS", "Times": ["02:00"]},
    "RetainRule": {"Count": 4}
  }]
}
```

### 3.3 EBS Volume Snapshots

**Method:** AWS EBS Snapshot  
**Schedule:** Daily at 03:00 UTC  
**Retention:** 14 daily snapshots  
**Encryption:** Inherited from KMS-encrypted EBS volume  
**Volumes:**
- `/dev/xvda` — OS root volume
- `/dev/xvdb` — Docker data volume (mongo_data + logs_data)

### 3.4 Container Image Backup

**Method:** Docker images are stored in Azure Container Registry (ACR)  
**Tagging:** Every build tagged with Git SHA + `latest`  
**Retention:** ACR lifecycle policy — keep last 20 tags per repository  
**Recovery:** `docker pull <acr>.azurecr.io/shipeasy-api:<sha>`

### 3.5 Configuration Backup

**Method:** EC2 `.env` and `shipeasy-api/.env` encrypted and stored in AWS Secrets Manager  
**Schedule:** Update Secrets Manager whenever `.env` changes  
**Access:** IAM role `shipeasy-ec2-role` with `secretsmanager:GetSecretValue`

### 3.6 Source Code

**Primary:** Azure Repos (Git)  
**Mirror:** GitHub (parassynoris/Shippeasy-saas) — updated on every push  
**Branch protection:** `main` branch requires PR + review before merge

---

## 4. Backup Verification

| Backup Type | Verification Frequency | Method |
|---|---|---|
| MongoDB dump | Monthly | Restore to isolated test container, run schema validation queries |
| EBS snapshot | Quarterly | Restore snapshot to test EC2, verify Docker starts |
| AMI | Semi-annually | Launch test EC2 from AMI, verify application boots end-to-end |
| Container image | Every pipeline run | Image is deployed and health-checked automatically |

**Monthly backup verification checklist:**

```bash
# 1. List recent backups
aws s3 ls s3://shipeasy-backups/mongodb/ --recursive | tail -10

# 2. Download latest backup
aws s3 cp s3://shipeasy-backups/mongodb/<latest>.tar.gz /tmp/

# 3. Restore to test container
tar -xzf /tmp/<latest>.tar.gz -C /tmp/
docker run -d --name mongo-test mongo:6
docker cp /tmp/<backup-dir>/ mongo-test:/tmp/restore
docker exec mongo-test mongorestore --db shipeasy_test /tmp/restore/shipeasy

# 4. Verify record counts
docker exec mongo-test mongosh shipeasy_test --eval "db.getCollectionNames()"

# 5. Clean up
docker rm -f mongo-test
```

---

## 5. Disaster Scenarios & Recovery Procedures

### Scenario 1: Container crash (one service down)

**Trigger:** Single container exits unexpectedly  
**Detection:** Docker `restart: unless-stopped` + CloudWatch health alarm  
**Recovery:**

```bash
# Automatic: Docker restarts container automatically
# Manual if needed:
ssh ubuntu@<EC2-IP>
docker compose -f ~/shipeasy/docker-compose.yml up -d <service>
docker compose logs --tail=50 <service>
```

**RTO:** 2–5 minutes (automatic)

---

### Scenario 2: EC2 instance becomes unresponsive

**Trigger:** EC2 status check failure, OOM kill, kernel panic  
**Detection:** CloudWatch EC2 status check alarm → SNS notification  
**Recovery:**

```bash
# Option A: Reboot
aws ec2 reboot-instances --instance-ids <i-xxxx>

# Option B: Stop/Start (clears host issues)
aws ec2 stop-instances --instance-ids <i-xxxx>
aws ec2 start-instances --instance-ids <i-xxxx>

# After start, verify:
ssh ubuntu@<EC2-IP>
cd ~/shipeasy && docker compose up -d
```

**RTO:** 5–15 minutes

---

### Scenario 3: EBS volume corruption or data loss

**Trigger:** Filesystem corruption, accidental data deletion  
**Detection:** Application errors accessing MongoDB data  
**Recovery:**

```bash
# 1. Stop containers
docker compose -f ~/shipeasy/docker-compose.yml down

# 2. Identify latest EBS snapshot
aws ec2 describe-snapshots --filters "Name=tag:Name,Values=shipeasy-prod-data" \
  --query 'Snapshots[*].[SnapshotId,StartTime]' --output table

# 3. Create new volume from snapshot
aws ec2 create-volume \
  --snapshot-id snap-xxxxxxxx \
  --availability-zone ap-south-1a \
  --encrypted

# 4. Detach old volume, attach new volume
aws ec2 detach-volume --volume-id vol-old
aws ec2 attach-volume --volume-id vol-new --instance-id i-xxxx --device /dev/xvdb

# 5. Mount and verify
sudo mount /dev/xvdb /var/lib/docker/volumes/

# 6. Restart containers
cd ~/shipeasy && docker compose up -d
```

**RPO:** Up to 24 hours (daily snapshot)  
**RTO:** 1–2 hours

---

### Scenario 4: MongoDB data corruption (logical)

**Trigger:** Bad data, failed migration, ransomware  
**Recovery:**

```bash
# 1. Download latest S3 backup
aws s3 cp s3://shipeasy-backups/mongodb/<timestamp>.tar.gz /tmp/
tar -xzf /tmp/<timestamp>.tar.gz -C /tmp/

# 2. Stop API container (prevent new writes)
docker compose -f ~/shipeasy/docker-compose.yml stop backend

# 3. Drop corrupted database
docker exec shipeasy_mongo mongosh --eval "db.getSiblingDB('shipeasy').dropDatabase()"

# 4. Restore from dump
docker cp /tmp/<backup-dir>/ shipeasy_mongo:/tmp/restore
docker exec shipeasy_mongo mongorestore --db shipeasy /tmp/restore/shipeasy

# 5. Restart API
docker compose -f ~/shipeasy/docker-compose.yml start backend

# 6. Verify
docker exec shipeasy_mongo mongosh shipeasy --eval "db.getCollectionNames()"
```

**RPO:** Up to 6 hours (6-hour backup schedule)  
**RTO:** 30–60 minutes

---

### Scenario 5: Full EC2 instance loss (region failure or termination)

**Trigger:** EC2 terminated, AZ outage, accidental deletion  
**Recovery:**

```bash
# 1. Launch new EC2 from latest AMI
aws ec2 run-instances \
  --image-id <latest-AMI-id> \
  --instance-type t3.medium \
  --key-name shipeasy-key \
  --security-group-ids sg-xxxx \
  --subnet-id subnet-xxxx \
  --iam-instance-profile Name=shipeasy-ec2-role \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=shipeasy-prod}]'

# 2. Assign Elastic IP to new instance
aws ec2 associate-address --instance-id i-new --allocation-id eipalloc-xxxx

# 3. SSH and restore configuration
ssh ubuntu@<new-EC2-IP>
mkdir -p ~/shipeasy
cd ~/shipeasy

# 4. Retrieve secrets from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id shipeasy/production/env \
  --query SecretString --output text > .env

# 5. Pull latest images and start
docker login <acr>.azurecr.io -u $ACR_USERNAME -p $ACR_PASSWORD
docker compose up -d

# 6. Restore MongoDB from S3 if AMI backup is older than needed
bash ~/shipeasy/scripts/restore-mongo.sh <backup-timestamp>
```

**RTO:** 2–4 hours  
**RPO:** Up to 1 week (AMI) or 6 hours (MongoDB backup)

---

## 6. Roles & Responsibilities

| Role | Responsibility | Contact |
|---|---|---|
| Engineering Lead | Declare DR event, coordinate recovery, post-mortem | Primary |
| DevOps Engineer | Execute recovery procedures | Primary executor |
| Backend Developer | MongoDB validation, application verification | Support |
| Product Manager | Customer communication during outage | Comms |

---

## 7. DR Test Schedule

| Test Type | Frequency | Scope |
|---|---|---|
| Backup restore test | Monthly | Restore MongoDB to isolated container |
| Container recovery drill | Quarterly | Simulate container crash, verify auto-restart |
| Full EC2 recovery drill | Semi-annually | Launch from AMI, restore data, verify |
| Tabletop exercise | Annually | Walk through full DR plan with team |
