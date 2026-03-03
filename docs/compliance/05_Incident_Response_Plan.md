# Shippeasy SaaS — Incident Response Plan

**Document Version:** 1.0  
**Classification:** Confidential — Internal  
**Owner:** Engineering Lead  
**Last Updated:** March 2026  
**Review Cycle:** Annually or after any P1/P2 incident

---

## 1. Purpose

This Incident Response Plan (IRP) establishes procedures for detecting, responding to, and recovering from security incidents and service disruptions affecting the Shippeasy SaaS platform. It defines roles, escalation paths, communication protocols, and post-incident review requirements.

---

## 2. Incident Classification

| Severity | Label | Definition | Response SLA | Examples |
|---|---|---|---|---|
| P1 | **Critical** | Full service outage or confirmed data breach | Respond: 15 min / Resolve: 4 hrs | Production down, data exfiltration, ransomware |
| P2 | **High** | Major feature unavailable, partial data loss, active attack | Respond: 30 min / Resolve: 8 hrs | API returning 500s, MongoDB unreachable, active brute force |
| P3 | **Medium** | Degraded performance, non-critical feature broken | Respond: 2 hrs / Resolve: 24 hrs | Slow queries, email notifications failing |
| P4 | **Low** | Minor issue, no data impact | Respond: 8 hrs / Resolve: 72 hrs | Log errors, UI glitches, non-critical job failures |

---

## 3. Incident Response Team

| Role | Responsibility | Escalation |
|---|---|---|
| **Incident Commander (IC)** | Owns the incident end-to-end; makes decisions; declares severity | Engineering Lead |
| **Technical Lead** | Executes investigation and remediation | Senior Backend Engineer |
| **Communications Lead** | Internal updates, customer notifications | Product Manager |
| **Security Analyst** | Threat analysis, forensics, containment | Engineering Lead / External MSSP |

For P1/P2 incidents, the Incident Commander is the first responder who pages the full team.

---

## 4. Incident Response Phases

### Phase 1 — Detection & Triage

**Sources of detection:**

| Source | Tool | Alert Destination |
|---|---|---|
| Container exits unexpectedly | Docker health check | SNS → Email/Slack |
| High CPU / memory | CloudWatch alarm | SNS → Email |
| HTTP 5xx spike | Elastic APM | Email alert |
| Failed login attempts | Winston logs → CloudWatch | Metric filter alarm |
| Unauthorised SSH attempt | `/var/log/auth.log` → CloudWatch | Metric filter alarm |
| Customer report | Support ticket | Direct to IC |
| Team member discovery | Internal | Slack #incidents channel |

**Triage checklist (first 15 minutes):**

```
[ ] 1. Acknowledge the alert; post in #incidents: "Investigating [alert source] at [time]"
[ ] 2. Determine: Is this a security incident or an availability incident?
[ ] 3. Classify severity (P1–P4) based on §2
[ ] 4. Assign Incident Commander if P1/P2
[ ] 5. Start incident log (time-stamped notes document)
[ ] 6. Check system status:
        docker compose ps
        docker compose logs --tail=50
        aws ec2 describe-instance-status --instance-ids <i-xxxx>
[ ] 7. Identify blast radius (what is affected? data? users?)
```

---

### Phase 2 — Containment

**For security incidents (breach / intrusion):**

```bash
# Immediate: isolate the instance by modifying security group
# Remove all inbound rules except admin SSH
aws ec2 revoke-security-group-ingress \
  --group-id sg-xxxx \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 revoke-security-group-ingress \
  --group-id sg-xxxx \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Preserve evidence — create forensic snapshot BEFORE any changes
aws ec2 create-snapshot \
  --volume-id vol-xxxx \
  --description "FORENSIC-$(date +%Y%m%d%H%M%S)"

# Invalidate all user sessions by incrementing tokenVersion in MongoDB
docker exec shipeasy_mongo mongosh shipeasy --eval \
  'db.users.updateMany({}, {$inc: {tokenVersion: 1}})'

# Rotate JWT secret immediately
# 1. Update EC2 .env with new SECRET_KEY_JWT
# 2. Restart backend
docker compose restart backend
```

**For availability incidents (service down):**

```bash
# Attempt controlled restart first
docker compose -f ~/shipeasy/docker-compose.yml restart

# If that fails, full stop/start
docker compose down
docker compose up -d

# If EC2 is unresponsive, reboot via AWS
aws ec2 reboot-instances --instance-ids <i-xxxx>
```

---

### Phase 3 — Investigation & Eradication

**Security incident investigation checklist:**

```
[ ] 1. Review CloudWatch Logs for anomalous API calls
        - Unusual endpoints accessed
        - High volume requests from single IP
        - Requests from unexpected geographic regions

[ ] 2. Review Elastic APM for unusual transaction patterns

[ ] 3. Review auth logs on EC2
        sudo cat /var/log/auth.log | grep -i "failed\|invalid\|unauthorized"

[ ] 4. Review Docker container logs
        docker logs shipeasy_api --since 24h 2>&1 | grep -i "error\|warn\|unauthorized"

[ ] 5. Review MongoDB operation log for unexpected queries
        docker exec shipeasy_mongo mongosh --eval \
          'db.getSiblingDB("admin").system.profile.find().sort({ts:-1}).limit(20)'

[ ] 6. Check for new/modified files on EC2
        find /home/ubuntu ~/shipeasy -newer /tmp/INCIDENT_START -type f

[ ] 7. Check for unexpected running processes
        ps auxf | grep -v "\[" | head -40

[ ] 8. Review network connections
        netstat -tnap | grep ESTABLISHED

[ ] 9. Check cron jobs for tampering
        crontab -l
        cat /etc/cron.d/*
```

**Eradication (after root cause identified):**

- Remove malicious code / backdoors
- Patch exploited vulnerability
- Rotate all potentially-compromised credentials
- Rebuild containers from clean ACR images if code integrity is in doubt

---

### Phase 4 — Recovery

```
[ ] 1. Restore service from clean images:
        docker compose pull
        docker compose up -d --force-recreate

[ ] 2. Restore data if needed (see DR & Backup Policy §5)

[ ] 3. Re-enable ingress rules in security group after verification

[ ] 4. Conduct smoke tests:
        curl https://app.shippeasy.com/
        curl https://app.shippeasy.com/api-docs
        curl https://app.shippeasy.com/api/health

[ ] 5. Monitor Elastic APM and CloudWatch for 30 minutes post-recovery

[ ] 6. Update incident log with resolution timestamp
```

---

### Phase 5 — Post-Incident Review

**Required for all P1/P2 incidents. Optional for P3/P4.**

**Timeline:** Post-incident review document due within 5 business days.

**Review document must include:**

| Section | Content |
|---|---|
| Incident timeline | Chronological log of events, detection, actions taken |
| Root cause analysis | 5-Whys or fishbone analysis |
| Impact assessment | Users affected, data affected, downtime duration |
| What went well | Effective detection/response actions |
| What went wrong | Gaps in detection, slow response, missing controls |
| Action items | Specific tasks with owners and due dates |
| Lessons learned | Process improvements for future incidents |

---

## 5. Communication Templates

### Internal — P1 Incident Start

```
🚨 P1 INCIDENT DECLARED — [short description]
Time: [HH:MM UTC]
IC: [Name]
Channel: #incidents-[YYYYMMDD]
Status: INVESTIGATING
Impact: [what is affected]
Next update: in 30 minutes
```

### Internal — Status Update

```
📊 INCIDENT UPDATE [HH:MM UTC]
Status: [INVESTIGATING / CONTAINED / RESOLVING]
Findings: [what we know so far]
Actions taken: [what has been done]
Actions planned: [next steps]
Next update: in [X] minutes
```

### External — Customer Notification (Service Disruption)

```
Subject: Shippeasy — Service Disruption Notice

We are currently experiencing a service disruption affecting [feature/service].
Our engineering team is actively investigating and working to restore full service.

Current status: [Investigating / Resolving]
Estimated restoration: [time or TBD]
Affected users: [all users / specific region]

We apologise for the inconvenience and will provide updates every [30/60] minutes.
Updates: [status page URL]

— Shippeasy Engineering Team
```

### External — Resolution Notice

```
Subject: Shippeasy — Service Restored

The service disruption affecting [feature] has been resolved as of [time UTC].
All systems are now operating normally.

Duration: [X hours Y minutes]
Root cause: [brief, non-technical description]
Actions taken: [brief summary]

We apologise for the disruption. A full post-incident report will be 
shared with affected enterprise customers within 5 business days.

— Shippeasy Engineering Team
```

---

## 6. Runbooks

### Runbook: High JWT Failure Rate

**Symptom:** CloudWatch alarm — `invalid_token` log events > 50 in 5 minutes  
**Likely cause:** Token expiry en masse / credential stuffing attempt

```bash
# Check auth failure source IPs
docker logs shipeasy_api --since 1h 2>&1 | \
  grep "invalid token\|Unauthorized" | \
  awk '{print $NF}' | sort | uniq -c | sort -rn | head -20

# If brute force from single IP, block at security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxx \
  --protocol tcp --port 80 --cidr <ATTACKER-IP>/32 \
  --description "BLOCKED - brute force $(date)"
```

### Runbook: MongoDB Container Unhealthy

**Symptom:** `shipeasy_mongo` health check failing; API returning 500s

```bash
# Inspect mongo health
docker inspect shipeasy_mongo | grep -A5 Health

# View mongo logs
docker logs shipeasy_mongo --tail=50

# Try restart
docker compose restart mongo

# If data corruption, restore from backup (see DR §5 Scenario 4)
```

### Runbook: Disk Space Critical (> 85%)

```bash
# Check usage
df -hT
du -sh ~/shipeasy/shipeasy-api/logs/*

# Rotate old logs
docker exec shipeasy_api find /app/logs -name "*.log" -mtime +30 -delete

# Prune Docker images
docker image prune -af

# Upload and compress old MongoDB backups
aws s3 ls s3://shipeasy-backups/mongodb/ --recursive | awk '{print $4}' | \
  head -5 | xargs -I{} aws s3 cp s3://shipeasy-backups/mongodb/{} \
  s3://shipeasy-backups/archive/{}
```

---

## 7. Incident Register

Maintain a live incident register with the following columns:

| Incident ID | Date | Severity | Title | Duration | Root Cause | Status |
|---|---|---|---|---|---|---|
| INC-001 | — | — | — | — | — | — |

Store in: `docs/compliance/incident-register.csv` (internal, not committed to public repo)
