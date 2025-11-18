# Docker Deployment Guide

This guide explains how to build and deploy the Survey Application using Docker and Docker Compose.

## Prerequisites

- Docker 20.10 or higher
- Docker Compose v2.0 or higher

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.docker.example .env
```

Edit `.env` with your configuration:

```env
# PostgreSQL
POSTGRES_USER=survey
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=survey_db
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Backend
BACKEND_PORT=5000
NODE_ENV=production
LOG_LEVEL=info

# Frontend
FRONTEND_PORT=8080
VITE_API_URL=http://localhost:5000
```

### 2. Build and Run

Start all services:

```bash
docker compose up -d
```

This will start:

- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 5000
- Frontend application on port 8080
- Prometheus monitoring on port 9090

### 3. Initialize Database

Run database migrations:

```bash
docker compose exec backend npx prisma migrate deploy
```

### 4. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health
- **Prometheus Metrics**: http://localhost:9090

## Individual Service Management

### Build Individual Images

Backend:

```bash
docker build -t survey-backend:latest ./backend
```

Frontend:

```bash
docker build -t survey-frontend:latest ./frontend
```

### Run Individual Containers

Backend (with environment variables):

```bash
docker run -d \
  --name survey-backend \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:password@postgres:5432/survey_db" \
  -e REDIS_HOST="redis" \
  -e REDIS_PORT="6379" \
  -e NODE_ENV="production" \
  survey-backend:latest
```

Frontend:

```bash
docker run -d \
  --name survey-frontend \
  -p 8080:8080 \
  survey-frontend:latest
```

## Docker Compose Commands

### Start services

```bash
docker compose up -d
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Stop services

```bash
docker compose stop
```

### Stop and remove containers

```bash
docker compose down
```

### Stop and remove containers with volumes

```bash
docker compose down -v
```

### Rebuild services

```bash
docker compose up -d --build
```

### Scale services

```bash
docker compose up -d --scale backend=3
```

## Health Checks

All services include health checks:

```bash
# Check backend health
curl http://localhost:5000/health

# Check frontend health
curl http://localhost:8080/

# Check Docker container health
docker ps
```

## Volume Management

The application uses named volumes for data persistence:

- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis cache data
- `prometheus_data`: Prometheus metrics

### Backup Volumes

PostgreSQL:

```bash
docker compose exec postgres pg_dump -U survey survey_db > backup.sql
```

### Restore Volumes

PostgreSQL:

```bash
docker compose exec -T postgres psql -U survey survey_db < backup.sql
```

## Production Deployment

### Security Checklist

- [ ] Use strong passwords for PostgreSQL
- [ ] Configure proper CORS settings
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Set up log rotation
- [ ] Configure backup strategy
- [ ] Use Docker secrets for sensitive data
- [ ] Run containers as non-root users
- [ ] Scan images for vulnerabilities

### Production Docker Compose

For production, consider:

1. **Use Docker Secrets**:

```yaml
secrets:
  postgres_password:
    external: true
```

2. **Add Resource Limits**:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

3. **Configure Logging**:

```yaml
services:
  backend:
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
```

## Monitoring

### Prometheus Metrics

Access Prometheus at http://localhost:9090

Key metrics to monitor:

- `http_request_duration_seconds`: Request latency
- `http_requests_total`: Total requests
- `survey_completions_total`: Survey completions
- `process_cpu_user_seconds_total`: CPU usage
- `process_resident_memory_bytes`: Memory usage

### Health Check Endpoints

- Backend: `http://localhost:5000/health`
- Backend Liveness: `http://localhost:5000/health/live`
- Backend Readiness: `http://localhost:5000/health/ready`

## Troubleshooting

### Container won't start

Check logs:

```bash
docker compose logs backend
```

### Database connection issues

1. Verify PostgreSQL is running:

```bash
docker compose ps postgres
```

2. Check DATABASE_URL:

```bash
docker compose exec backend env | grep DATABASE_URL
```

3. Test connection:

```bash
docker compose exec backend npx prisma db pull
```

### Redis connection issues

1. Test Redis connectivity:

```bash
docker compose exec redis redis-cli ping
```

### Port conflicts

If ports are already in use, modify `.env`:

```env
BACKEND_PORT=5001
FRONTEND_PORT=8081
```

### Build cache issues

Clear build cache:

```bash
docker builder prune
docker compose build --no-cache
```

## CI/CD Integration

The GitHub Actions workflow automatically:

1. Builds Docker images
2. Runs tests
3. Pushes to container registry
4. Deploys to staging/production

See `.github/workflows/ci.yml` for details.

## Development with Docker

For local development with hot reload:

```bash
# Start only infrastructure services
docker compose up -d postgres redis prometheus

# Run backend in dev mode
cd backend && npm run dev

# Run frontend in dev mode
cd frontend && npm run dev
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma in Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
