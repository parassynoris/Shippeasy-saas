#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
# migrate-to-managed-mongo.sh — Migrate from Docker MongoDB to Atlas/DocumentDB
#
# This script dumps the current Docker MongoDB, restores to a managed
# service, and verifies the migration.
#
# Usage:
#   export SOURCE_URI="mongodb://localhost:27017/shipeasy"
#   export TARGET_URI="mongodb+srv://user:pass@cluster.mongodb.net/shipeasy"
#   bash scripts/migrate-to-managed-mongo.sh
#
# Steps:
#   1. Dump source database
#   2. Restore to target
#   3. Verify document counts match
#   4. Print connection string for .env update
# ══════════════════════════════════════════════════════════════════

set -euo pipefail

SOURCE_URI="${SOURCE_URI:?SOURCE_URI is required}"
TARGET_URI="${TARGET_URI:?TARGET_URI is required}"
DB_NAME="${MONGO_DB_NAME:-shipeasy}"
DUMP_DIR="/tmp/mongo-migration-$(date +%s)"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"; }

log "═══ MongoDB Migration: Docker → Managed Service ═══"
log "Source: ${SOURCE_URI}"
log "Target: [REDACTED]"
log "Database: ${DB_NAME}"

log "Step 1: Dumping source database..."
mongodump --uri="${SOURCE_URI}" --db="${DB_NAME}" --out="${DUMP_DIR}" --gzip
log "Dump complete: ${DUMP_DIR}/${DB_NAME}"

log "Step 2: Restoring to target..."
mongorestore --uri="${TARGET_URI}" --db="${DB_NAME}" --gzip "${DUMP_DIR}/${DB_NAME}" --drop
log "Restore complete"

log "Step 3: Verifying document counts..."
COLLECTIONS=$(mongosh "${SOURCE_URI}/${DB_NAME}" --quiet --eval "db.getCollectionNames().join(',')")
MISMATCH=0

IFS=',' read -ra COLS <<< "$COLLECTIONS"
for col in "${COLS[@]}"; do
    SOURCE_COUNT=$(mongosh "${SOURCE_URI}/${DB_NAME}" --quiet --eval "db.${col}.countDocuments()")
    TARGET_COUNT=$(mongosh "${TARGET_URI}/${DB_NAME}" --quiet --eval "db.${col}.countDocuments()")
    if [ "$SOURCE_COUNT" != "$TARGET_COUNT" ]; then
        log "  MISMATCH: ${col} — source=${SOURCE_COUNT}, target=${TARGET_COUNT}"
        MISMATCH=1
    else
        log "  OK: ${col} — ${SOURCE_COUNT} documents"
    fi
done

if [ "$MISMATCH" -eq 1 ]; then
    log "WARNING: Document count mismatches detected. Investigate before switching."
else
    log "All collections verified successfully."
fi

log "Step 4: Cleanup..."
rm -rf "${DUMP_DIR}"

log ""
log "═══ Migration Complete ═══"
log ""
log "To switch the application to the managed database:"
log "  1. Update MONGO_CONNECTION in shipeasy-api/.env:"
log "     MONGO_CONNECTION=${TARGET_URI}"
log "  2. Remove the 'mongo' service from docker-compose.yml"
log "  3. Restart the backend: docker compose up -d --no-deps backend"
log "  4. Verify /health endpoint returns OK"
log "  5. Monitor for 48 hours before decommissioning Docker MongoDB"
