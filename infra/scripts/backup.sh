#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
#  Muraho Rwanda — Backup & Restore
#  Usage:
#    ./backup.sh backup          # Create timestamped backup
#    ./backup.sh restore <file>  # Restore from backup
#    ./backup.sh list            # List available backups
# ══════════════════════════════════════════════════════════

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/muraho-backups}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/docker-compose.yml}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-muraho-rwanda-postgres-1}"
MINIO_CONTAINER="${MINIO_CONTAINER:-muraho-rwanda-minio-1}"
DB_NAME="${POSTGRES_DB:-muraho_rwanda}"
DB_USER="${POSTGRES_USER:-muraho}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

# ── Colors ─────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[backup]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
err() { echo -e "${RED}[error]${NC} $*" >&2; }

# ── Backup ─────────────────────────────────────────────
do_backup() {
  local timestamp
  timestamp=$(date +%Y%m%d_%H%M%S)
  local backup_path="$BACKUP_DIR/muraho-backup-$timestamp"
  mkdir -p "$backup_path"

  log "Starting backup: $backup_path"

  # 1. PostgreSQL dump
  log "Dumping PostgreSQL..."
  docker exec "$POSTGRES_CONTAINER" \
    pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom --compress=6 \
    > "$backup_path/database.dump"
  log "  Database: $(du -h "$backup_path/database.dump" | cut -f1)"

  # 2. MinIO media
  log "Backing up MinIO media..."
  docker exec "$MINIO_CONTAINER" \
    mc mirror --quiet local/muraho-media /tmp/media-backup 2>/dev/null || true
  docker cp "$MINIO_CONTAINER:/tmp/media-backup" "$backup_path/media" 2>/dev/null || {
    warn "  MinIO media backup skipped (no files or container not running)"
    mkdir -p "$backup_path/media"
  }
  log "  Media: $(du -sh "$backup_path/media" 2>/dev/null | cut -f1 || echo '0B')"

  # 3. Environment / config
  log "Backing up configuration..."
  cp .env "$backup_path/env.backup" 2>/dev/null || warn "  No .env found"

  # 4. Create archive
  log "Compressing..."
  local archive="$BACKUP_DIR/muraho-backup-$timestamp.tar.gz"
  tar czf "$archive" -C "$BACKUP_DIR" "muraho-backup-$timestamp"
  rm -rf "$backup_path"

  log "Backup complete: $archive ($(du -h "$archive" | cut -f1))"

  # 5. Cleanup old backups
  local deleted
  deleted=$(find "$BACKUP_DIR" -name "muraho-backup-*.tar.gz" -mtime +"$RETENTION_DAYS" -delete -print | wc -l)
  if [ "$deleted" -gt 0 ]; then
    log "Cleaned up $deleted backup(s) older than $RETENTION_DAYS days"
  fi
}

# ── Restore ────────────────────────────────────────────
do_restore() {
  local archive="$1"

  if [ ! -f "$archive" ]; then
    err "Backup file not found: $archive"
    exit 1
  fi

  log "Restoring from: $archive"
  warn "This will OVERWRITE the current database. Continue? [y/N]"
  read -r confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    log "Restore cancelled."
    exit 0
  fi

  local tmpdir
  tmpdir=$(mktemp -d)
  tar xzf "$archive" -C "$tmpdir"

  local backup_dir
  backup_dir=$(find "$tmpdir" -maxdepth 1 -type d -name "muraho-backup-*" | head -1)

  if [ -z "$backup_dir" ]; then
    err "Invalid backup archive: no backup directory found"
    rm -rf "$tmpdir"
    exit 1
  fi

  # 1. Restore database
  if [ -f "$backup_dir/database.dump" ]; then
    log "Restoring PostgreSQL..."
    docker exec -i "$POSTGRES_CONTAINER" \
      pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner \
      < "$backup_dir/database.dump" 2>/dev/null || warn "  Some restore warnings (expected)"
    log "  Database restored."
  fi

  # 2. Restore media
  if [ -d "$backup_dir/media" ] && [ "$(ls -A "$backup_dir/media")" ]; then
    log "Restoring MinIO media..."
    docker cp "$backup_dir/media" "$MINIO_CONTAINER:/tmp/media-restore"
    docker exec "$MINIO_CONTAINER" \
      mc mirror --overwrite /tmp/media-restore local/muraho-media 2>/dev/null || true
    log "  Media restored."
  fi

  # 3. Restore env
  if [ -f "$backup_dir/env.backup" ]; then
    warn "Environment backup found. Restore .env? [y/N]"
    read -r confirm_env
    if [ "$confirm_env" = "y" ] || [ "$confirm_env" = "Y" ]; then
      cp "$backup_dir/env.backup" .env
      log "  Environment restored."
    fi
  fi

  rm -rf "$tmpdir"
  log "Restore complete. Restart services: docker compose -f $COMPOSE_FILE restart"
}

# ── List ───────────────────────────────────────────────
do_list() {
  log "Available backups in $BACKUP_DIR:"
  echo ""
  ls -lh "$BACKUP_DIR"/muraho-backup-*.tar.gz 2>/dev/null | \
    awk '{ printf "  %s  %s  %s\n", $5, $6" "$7, $9 }' || \
    warn "  No backups found."
  echo ""
}

# ── Main ───────────────────────────────────────────────
case "${1:-help}" in
  backup)
    do_backup
    ;;
  restore)
    if [ -z "${2:-}" ]; then
      err "Usage: $0 restore <backup-file.tar.gz>"
      exit 1
    fi
    do_restore "$2"
    ;;
  list)
    do_list
    ;;
  *)
    echo "Usage: $0 {backup|restore <file>|list}"
    echo ""
    echo "  backup           Create a new backup"
    echo "  restore <file>   Restore from a backup archive"
    echo "  list             List available backups"
    echo ""
    echo "Environment:"
    echo "  BACKUP_DIR       Backup storage (default: /opt/muraho-backups)"
    echo "  RETENTION_DAYS   Auto-delete after N days (default: 30)"
    ;;
esac
