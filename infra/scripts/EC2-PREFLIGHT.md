# EC2 GPU Preflight (Muraho Production)

Run this before deploying to a new EC2 host.

## 1) SSH and go to repo

```bash
ssh <your-ec2-user>@<your-ec2-host>
cd /opt/muraho-rwanda
```

## 2) Run automated preflight

```bash
chmod +x infra/scripts/ec2-gpu-preflight.sh
./infra/scripts/ec2-gpu-preflight.sh /opt/muraho-rwanda
```

The script validates:

- Docker + Docker Compose availability
- NVIDIA driver + container GPU access
- RAM/disk recommendations
- Presence of production compose + `.env`
- Required `.env` keys
- Production compose render
- Common service port availability

## 3) Manual spot checks (recommended)

```bash
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi
cd infra/docker
docker compose -f docker-compose.prod.yml config --services
```

Expected services:

- `vllm`
- `ai-service`
- `postgres`
- `redis`
- `minio`

## 4) Minimum requirements for this stack

- NVIDIA GPU with working driver/runtime (L4/A10 class or better recommended)
- Docker Engine + Docker Compose plugin
- NVIDIA Container Toolkit configured for Docker
- RAM: 32GB+ recommended
- Free disk: 120GB+ recommended (models + Docker layers + media)
- Open ports/security-group rules for your exposure plan (typically 80/443)

## 5) If preflight passes

Proceed with production deploy flow (GPU compose):

```bash
cd infra/docker
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```
