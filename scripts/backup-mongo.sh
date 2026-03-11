#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
# backup-mongo.sh — Automated MongoDB backup with retention
#
# Backs up the Shippeasy MongoDB database using mongodump, compresses
# the archive, and optionally uploads to S3. Designed to run via cron.
#
# Usage:
#   bash scripts/backup-mongo.sh
#
# Environment variables:
#   MONGO_CONNECTION   MongoDB connection string (required)
#   MONGO_DB_NAME      Database name (default: shipeasy)
#   BACKUP_DIR         Local backup directory (default: /var/backups/mongodb)
#   BACKUP_RETENTION   Days to keep local backups (default: 7)
#   S3_BUCKET          S3 bucket for offsite backup (optional)
#   AWS_REGION         AWS region for S3 (default: ap-south-1)
#
# Cron example (every 6 hours):
#   0 */6 * * * /opt/shipeasy/scripts/backup-mongo.sh >> /var/log/mongo-backup.log 2>&1
# ══════════════════════════════════════════════════════════════════

set -euo pipefail

MONGO_CONNECTION="${MONGO_CONNECTION:?MONGO_CONNECTION is required}"
MONGO_DB_NAME="${MONGO_DB_NAME:-shipeasy}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/mongodb}"
BACKUP_RETENTION="${BACKUP_RETENTION:-7}"
TIMESTAMP=$(date -u '+%Y%m%d_%H%M%S')
BACKUP_NAME="${MONGO_DB_NAME}_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"; }

log "Starting backup: ${BACKUP_NAME}"

mkdir -p "${BACKUP_DIR}"

mongodump \
    --uri="${MONGO_CONNECTION}" \
    --db="${MONGO_DB_NAME}" \
    --out="${BACKUP_PATH}" \
    --gzip

ARCHIVE="${BACKUP_PATH}.tar.gz"
tar -czf "${ARCHIVE}" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
rm -rf "${BACKUP_PATH}"

ARCHIVE_SIZE=$(du -sh "${ARCHIVE}" | cut -f1)
log "Backup complete: ${ARCHIVE} (${ARCHIVE_SIZE})"

if [ -n "${S3_BUCKET:-}" ]; then
    S3_PATH="s3://${S3_BUCKET}/mongodb-backups/${BACKUP_NAME}.tar.gz"
    log "Uploading to ${S3_PATH}..."
    aws s3 cp "${ARCHIVE}" "${S3_PATH}" --region "${AWS_REGION:-ap-south-1}"
    log "S3 upload complete"
fi

log "Pruning backups older than ${BACKUP_RETENTION} days..."
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime "+${BACKUP_RETENTION}" -delete

REMAINING=$(find "${BACKUP_DIR}" -name "*.tar.gz" | wc -l)
log "Backup retention: ${REMAINING} archives remaining"
log "Backup job finished successfully"
