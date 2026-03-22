cd /opt/muraho-rwanda

# Set your public URL first (domain preferred)
DOMAIN="muraho.rw"
APP_URL="https://${DOMAIN}"

# Generate strong secrets (URL-safe: hex only)
POSTGRES_PASSWORD="$(openssl rand -hex 24)"
MINIO_PASSWORD="$(openssl rand -hex 24)"
PAYLOAD_SECRET="$(openssl rand -hex 48)"

# Backup current env files if they exist
for f in infra/docker/.env ai-service/.env cms/.env frontend/.env; do
  [ -f "$f" ] && cp "$f" "${f}.bak.$(date +%Y%m%d%H%M%S)"
done

# 1) infra/docker/.env (main runtime env)
cat > infra/docker/.env <<EOF
POSTGRES_USER=muraho
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=5432
DB_PASSWORD=${POSTGRES_PASSWORD}

PAYLOAD_SECRET=${PAYLOAD_SECRET}
PAYLOAD_PORT=3000

REDIS_PORT=6379

MINIO_ROOT_USER=muraho_minio
MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_USER=muraho_minio
MINIO_PASSWORD=${MINIO_PASSWORD}

AI_PORT=8000
OLLAMA_PORT=11434

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_WEBHOOK_HASH=
ELEVENLABS_API_KEY=

FRONTEND_PORT=5173
VITE_API_URL=/api
APP_URL=${APP_URL}
FRONTEND_URL=${APP_URL}
MAPBOX_TOKEN=
EOF

# 2) cms/.env
cat > cms/.env <<EOF
DATABASE_URI=postgres://muraho:${POSTGRES_PASSWORD}@postgres:5432/muraho_rwanda
PAYLOAD_SECRET=${PAYLOAD_SECRET}
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

S3_BUCKET=muraho-media
S3_ACCESS_KEY=muraho_minio
S3_SECRET_KEY=${MINIO_PASSWORD}
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1

APP_URL=${APP_URL}
FRONTEND_URL=${APP_URL}

REDIS_URL=redis://redis:6379
AI_SERVICE_URL=http://ai-service:8000

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_WEBHOOK_HASH=
EOF

# 3) ai-service/.env
cat > ai-service/.env <<EOF
DEBUG=false
LOG_LEVEL=INFO

ALLOWED_ORIGINS=["${APP_URL}","http://payload:3000"]
APP_SERVER_URL=http://payload:3000

LLM_BACKEND=vllm
LLM_BASE_URL=http://vllm:8000/v1

LLM_MODEL_FAST=mistralai/Mistral-7B-Instruct-v0.3
LLM_MODEL_HEAVY=mistralai/Mistral-7B-Instruct-v0.3
LLM_MODEL_DEFAULT=mistralai/Mistral-7B-Instruct-v0.3

LLM_MAX_TOKENS=1024
LLM_TEMPERATURE=0.3
LLM_TEMPERATURE_CREATIVE=0.7

EMBEDDING_MODEL=intfloat/multilingual-e5-large
EMBEDDING_DIMENSION=1024
EMBEDDING_DEVICE=cpu

DATABASE_URL=postgresql://muraho:${POSTGRES_PASSWORD}@postgres:5432/muraho_rwanda

WHISPER_MODEL=large-v3
WHISPER_DEVICE=cuda
WHISPER_COMPUTE_TYPE=float16

TRANSLATION_MODEL=facebook/nllb-200-distilled-600M

ENABLE_AUDIT_LOG=true
AUDIT_LOG_PATH=/var/log/muraho/ai_audit.jsonl

REDIS_URL=redis://redis:6379/0

RATE_LIMIT_FREE=5
RATE_LIMIT_PAID=100
RATE_LIMIT_AGENCY=500
EOF

# 4) frontend/.env
cat > frontend/.env <<EOF
VITE_API_URL=/api
VITE_MAPBOX_TOKEN=
EOF

echo "Env files written."