# Operational Runbook

Standard operating procedures for the Shippeasy SaaS platform.

## Table of Contents

- [Service Health Checks](#service-health-checks)
- [Deployment Procedures](#deployment-procedures)
- [Database Operations](#database-operations)
- [Troubleshooting](#troubleshooting)
- [Monitoring & Alerts](#monitoring--alerts)
- [Security Operations](#security-operations)
- [Scaling Procedures](#scaling-procedures)

---

## Service Health Checks

### API Server Health

```bash
# Quick health check
curl -s http://localhost:3000/health | jq .

# Expected response:
# { "status": "OK", "timestamp": "2024-01-01T00:00:00.000Z" }

# Version check
curl -s http://localhost:3000/version | jq .
```

### Docker Service Status

```bash
# Check all service status
docker compose ps

# Check container resource usage
docker stats --no-stream

# View recent logs
docker compose logs --tail=100 backend
docker compose logs --tail=100 mongo
```

### MongoDB Health

```bash
# Connect to MongoDB shell
docker exec -it shippeasy-mongo mongosh

# Check server status
db.serverStatus()

# Check replication status (if replica set)
rs.status()

# Check connection pool
db.serverStatus().connections
```

---

## Deployment Procedures

### Standard Deployment

```bash
# 1. Pull latest changes
git pull origin main

# 2. Build and deploy
docker compose build --no-cache
docker compose up -d

# 3. Verify health
curl -s http://localhost:3000/health

# 4. Check logs for errors
docker compose logs --tail=50 backend
```

### Rollback Procedure

```bash
# 1. Identify previous version
docker images | grep shippeasy

# 2. Stop current deployment
docker compose down

# 3. Checkout previous version
git checkout <previous-commit-hash>

# 4. Rebuild and deploy
docker compose build --no-cache
docker compose up -d

# 5. Verify health
curl -s http://localhost:3000/health
```

### Zero-Downtime Deployment

```bash
# 1. Build new image without stopping current
docker compose build --no-cache backend

# 2. Rolling restart (one container at a time)
docker compose up -d --no-deps --build backend

# 3. Verify health after restart
sleep 5
curl -s http://localhost:3000/health
```

---

## Database Operations

### Backup

```bash
# Manual backup
docker exec shippeasy-mongo mongodump --archive=/data/backup/$(date +%Y%m%d).gz --gzip

# Copy backup to host
docker cp shippeasy-mongo:/data/backup/$(date +%Y%m%d).gz ./backups/

# Automated daily backup (add to crontab)
# 0 2 * * * /path/to/backup-script.sh
```

### Restore

```bash
# Restore from backup
docker exec -i shippeasy-mongo mongorestore --archive --gzip < ./backups/20240101.gz

# Restore specific collection
docker exec -i shippeasy-mongo mongorestore --collection=users --db=shippeasy --gzip < ./backups/users.gz
```

### Index Management

```bash
# Check existing indexes
docker exec shippeasy-mongo mongosh --eval "db.getCollectionNames().forEach(c => { print(c + ':'); printjson(db[c].getIndexes()) })"

# Indexes are auto-created on app startup via schema/schema.js collectionIndexes
# To force re-creation, restart the backend service
docker compose restart backend
```

### Performance Queries

```bash
# Find slow queries (>100ms)
docker exec shippeasy-mongo mongosh --eval "
  db.system.profile.find({ millis: { \$gt: 100 } }).sort({ ts: -1 }).limit(10).pretty()
"

# Check collection sizes
docker exec shippeasy-mongo mongosh --eval "
  db.getCollectionNames().forEach(c => {
    const stats = db[c].stats();
    print(c + ': ' + (stats.size / 1024 / 1024).toFixed(2) + ' MB, docs: ' + stats.count);
  })
"
```

---

## Troubleshooting

### API Server Not Responding

1. **Check if process is running:**
   ```bash
   docker compose ps backend
   docker compose logs --tail=50 backend
   ```

2. **Check for port conflicts:**
   ```bash
   lsof -i :3000
   ```

3. **Check MongoDB connectivity:**
   ```bash
   docker compose logs --tail=20 mongo
   # Look for "connection refused" or "authentication failed"
   ```

4. **Check memory/CPU:**
   ```bash
   docker stats --no-stream
   ```

### High Memory Usage

1. **Check current usage:**
   ```bash
   docker stats --no-stream
   ```

2. **Check for memory leaks (Node.js):**
   ```bash
   # Enable heap dump on OOM
   docker compose exec backend node --max-old-space-size=512 --expose-gc index.js
   ```

3. **Check MongoDB connection pool:**
   ```bash
   docker exec shippeasy-mongo mongosh --eval "db.serverStatus().connections"
   # If currentActive is close to maxPoolSize, increase MONGO_POOL_SIZE
   ```

### Rate Limiting Issues

1. **Check if tenant is rate-limited:**
   Look for structured log entries:
   ```bash
   docker compose logs backend | grep "TENANT_RATE_LIMIT_EXCEEDED"
   ```

2. **Check current rate limit configuration:**
   - General: `RATE_LIMIT_MAX` (default: 100 per 15min per IP)
   - Auth: `AUTH_RATE_LIMIT_MAX` (default: 10 per 15min per IP)
   - Tenant: Based on plan (free: 100, pro: 1000, enterprise: 10000)

3. **Temporarily increase limits:**
   ```bash
   # Update .env and restart
   RATE_LIMIT_MAX=500
   docker compose restart backend
   ```

### Authentication Failures

1. **Check JWT configuration:**
   ```bash
   # Verify SECRET_KEY_JWT is set
   docker compose exec backend printenv | grep SECRET_KEY_JWT
   ```

2. **Check token expiry:**
   ```bash
   # Decode JWT token (without verification)
   echo "<token>" | cut -d. -f2 | base64 -d 2>/dev/null | jq .
   ```

3. **Check for token version mismatch:**
   ```bash
   docker compose logs backend | grep "Invalid credentials"
   ```

### Plan Enforcement Issues

1. **Check enforcement mode:**
   ```bash
   # PLAN_ENFORCEMENT=soft (default) logs but allows
   # PLAN_ENFORCEMENT=hard blocks with 403
   docker compose exec backend printenv | grep PLAN_ENFORCEMENT
   ```

2. **Check plan access logs:**
   ```bash
   docker compose logs backend | grep "PLAN_FEATURE_ACCESS"
   ```

---

## Monitoring & Alerts

### Key Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold |
|--------|------------------|-------------------|
| API response time (p95) | > 500ms | > 2000ms |
| Error rate (5xx) | > 1% | > 5% |
| CPU usage | > 70% | > 90% |
| Memory usage | > 70% | > 90% |
| MongoDB connections | > 80% of pool | > 95% of pool |
| Disk usage | > 70% | > 85% |
| Rate limit hits | > 10/min | > 50/min |

### Log Analysis

```bash
# Count errors in last hour
docker compose logs --since=1h backend | grep '"error"' | wc -l

# Find most common error types
docker compose logs --since=1h backend | grep '"error"' | jq -r '.error' 2>/dev/null | sort | uniq -c | sort -rn

# Track API usage by tenant
docker compose logs --since=1h backend | grep '"event":"api_usage"' | jq -r '.orgId' 2>/dev/null | sort | uniq -c | sort -rn

# Check rate limit violations
docker compose logs --since=1h backend | grep "RATE_LIMIT_EXCEEDED"
```

### APM Dashboard

Elastic APM is configured at `APM_SERVER` URL:
- Transaction traces at `/api/*` endpoints
- Error tracking with stack traces
- Sample rate: 10% in production, 100% in development

---

## Security Operations

### Rotate API Keys

```bash
# 1. Generate new key
NEW_KEY=$(openssl rand -hex 32)

# 2. Add new key alongside old one (supports key rotation)
# In .env: API_KEYS=new-key,old-key
echo "API_KEYS=${NEW_KEY},${OLD_KEY}" >> .env

# 3. Restart to pick up new keys
docker compose restart backend

# 4. Update all clients to use new key

# 5. Remove old key
echo "API_KEYS=${NEW_KEY}" >> .env
docker compose restart backend
```

### Rotate JWT Secret

```bash
# WARNING: This will invalidate ALL active sessions
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 64)

# 2. Update .env
echo "SECRET_KEY_JWT=${NEW_SECRET}" >> .env

# 3. Restart
docker compose restart backend

# All users will need to re-login
```

### Check for Security Events

```bash
# Cross-tenant access attempts
docker compose logs backend | grep "TENANT_ISOLATION_OVERRIDE"

# Invalid API keys
docker compose logs backend | grep "API_KEY_INVALID"

# Invalid webhook signatures
docker compose logs backend | grep "Invalid.*webhook signature"

# Rate limit abuse
docker compose logs backend | grep "RATE_LIMIT_EXCEEDED" | jq '.ip' 2>/dev/null | sort | uniq -c | sort -rn
```

---

## Scaling Procedures

### Vertical Scaling (Docker)

Update resource limits in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'      # Increase from 1.0
          memory: 1024M     # Increase from 512M
```

### Horizontal Scaling (Multiple Instances)

> **Note:** Before scaling horizontally, migrate in-memory stores to Redis:
> - Tenant rate limiting (`middleware/usageTracking.js`)
> - Feature flag cache (`utils/featureFlags.js`)

```bash
# Scale backend to 3 instances (requires load balancer)
docker compose up -d --scale backend=3

# Verify all instances are healthy
for i in $(docker compose ps -q backend); do
  docker exec $i curl -s http://localhost:3000/health
done
```

### MongoDB Connection Pool Tuning

```bash
# For high-traffic deployments, increase pool size:
# In .env:
MONGO_POOL_SIZE=50          # Max connections (default: 10)
MONGO_MIN_POOL_SIZE=10      # Min idle connections (default: 2)
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | API server port |
| `NODE_ENV` | development | Environment (production/development) |
| `SECRET_KEY_JWT` | — | JWT signing secret (required) |
| `ENCRYPTION_KEY` | — | AES-256 encryption key (required when ENCRYPTION=true) |
| `CORS_ORIGINS` | — | Comma-separated allowed origins |
| `RATE_LIMIT_MAX` | 100 | General rate limit per 15min per IP |
| `AUTH_RATE_LIMIT_MAX` | 10 | Auth rate limit per 15min per IP |
| `API_KEYS` | — | Comma-separated API keys for service auth |
| `PLAN_ENFORCEMENT` | soft | Plan enforcement mode (soft/hard) |
| `MONGO_POOL_SIZE` | 10 | MongoDB max connection pool size |
| `MONGO_MIN_POOL_SIZE` | 2 | MongoDB min connection pool size |
| `MAX_FILE_SIZE` | 52428800 | Max file upload size in bytes (50MB) |
| `APM_SERVER` | — | Elastic APM server URL |

---

*Last updated: March 2026*
