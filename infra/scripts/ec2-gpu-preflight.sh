#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo -e "${GREEN}✓ $1${NC}"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  echo -e "${YELLOW}⚠ $1${NC}"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo -e "${RED}✗ $1${NC}"
}

header() {
  echo
  echo "=================================================="
  echo "$1"
  echo "=================================================="
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

check_required_env() {
  local env_file="$1"
  local key="$2"

  if grep -Eq "^${key}=.+" "$env_file"; then
    pass "${key} is set in .env"
  else
    fail "${key} is missing/empty in .env"
  fi
}

echo "Muraho Rwanda EC2 GPU Preflight"
echo "Host: $(hostname)"
echo "Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

header "1) Base OS and tools"

if has_cmd uname; then
  pass "uname available: $(uname -a)"
else
  fail "uname command missing"
fi

if has_cmd docker; then
  pass "docker available: $(docker --version)"
else
  fail "docker is not installed"
fi

if has_cmd docker && docker compose version >/dev/null 2>&1; then
  pass "docker compose available: $(docker compose version | head -n 1)"
else
  fail "docker compose plugin is missing"
fi

header "2) GPU runtime"

if has_cmd nvidia-smi; then
  pass "nvidia-smi available"
  nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader || warn "Could not query GPU details"
else
  fail "nvidia-smi not found (GPU driver likely missing)"
fi

if has_cmd docker; then
  if docker info 2>/dev/null | grep -qi nvidia; then
    pass "Docker reports NVIDIA runtime support"
  else
    warn "Docker NVIDIA runtime not detected in docker info"
  fi
fi

if has_cmd docker; then
  if docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi >/dev/null 2>&1; then
    pass "Container GPU access test passed"
  else
    fail "Container GPU access test failed (check nvidia-container-toolkit)"
  fi
fi

header "3) Capacity checks"

if has_cmd free; then
  MEM_GB=$(free -g | awk '/^Mem:/ {print $2}')
  if [[ "${MEM_GB:-0}" -ge 32 ]]; then
    pass "System RAM ${MEM_GB}GB (recommended >=32GB)"
  else
    warn "System RAM ${MEM_GB}GB (recommended >=32GB for vLLM + payload + ai-service)"
  fi
fi

if has_cmd df; then
  DISK_GB=$(df -BG / | awk 'NR==2 {gsub("G", "", $4); print $4}')
  if [[ "${DISK_GB:-0}" -ge 120 ]]; then
    pass "Free disk ${DISK_GB}GB (recommended >=120GB)"
  else
    warn "Free disk ${DISK_GB}GB (may be low for model + image caches)"
  fi
fi

header "4) Repository and compose files"

REPO_DIR="${1:-/opt/muraho-rwanda}"
DOCKER_DIR="${REPO_DIR}/infra/docker"

if [[ -d "$REPO_DIR" ]]; then
  pass "Repo directory found: $REPO_DIR"
else
  fail "Repo directory not found: $REPO_DIR"
fi

if [[ -f "$DOCKER_DIR/docker-compose.prod.yml" ]]; then
  pass "Found production compose file"
else
  fail "Missing $DOCKER_DIR/docker-compose.prod.yml"
fi

if [[ -f "$DOCKER_DIR/.env" ]]; then
  pass "Found $DOCKER_DIR/.env"
else
  fail "Missing $DOCKER_DIR/.env (copy from .env.example first)"
fi

if [[ -f "$DOCKER_DIR/.env" ]]; then
  check_required_env "$DOCKER_DIR/.env" "DB_PASSWORD"
  check_required_env "$DOCKER_DIR/.env" "MINIO_USER"
  check_required_env "$DOCKER_DIR/.env" "MINIO_PASSWORD"
  check_required_env "$DOCKER_DIR/.env" "POSTGRES_USER"
  check_required_env "$DOCKER_DIR/.env" "POSTGRES_PASSWORD"
  check_required_env "$DOCKER_DIR/.env" "PAYLOAD_SECRET"
  check_required_env "$DOCKER_DIR/.env" "APP_URL"
  check_required_env "$DOCKER_DIR/.env" "FRONTEND_URL"
fi

header "5) Compose config render"

if [[ -f "$DOCKER_DIR/docker-compose.prod.yml" ]]; then
  if (cd "$DOCKER_DIR" && docker compose -f docker-compose.prod.yml config >/dev/null 2>&1); then
    pass "docker-compose.prod.yml renders successfully"
  else
    fail "docker compose config failed for production file"
  fi
fi

header "6) Port availability"

if has_cmd ss; then
  for p in 80 443 3000 5173 8000 8080 9000 9001 5432 6379; do
    if ss -ltn | awk '{print $4}' | grep -q ":${p}$"; then
      warn "Port ${p} currently in use"
    else
      pass "Port ${p} available"
    fi
  done
else
  warn "ss command not found; skipping port checks"
fi

header "Summary"
echo -e "Passed: ${GREEN}${PASS_COUNT}${NC}"
echo -e "Warnings: ${YELLOW}${WARN_COUNT}${NC}"
echo -e "Failed: ${RED}${FAIL_COUNT}${NC}"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo -e "${RED}Preflight failed. Fix errors before deployment.${NC}"
  exit 1
fi

echo -e "${GREEN}Preflight passed. Ready to proceed to deployment steps.${NC}"
