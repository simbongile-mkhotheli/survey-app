#!/bin/bash

# Survey Application Deployment Script
# This script handles deployment to staging and production environments

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE=""
ENV_FILE=""
ENVIRONMENT=""
VERSION=""
BACKUP_ENABLED=true
HEALTH_CHECK_TIMEOUT=300

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

# Usage information
usage() {
    cat << EOF
Usage: $0 [OPTIONS] ENVIRONMENT

Deploy Survey Application to specified environment.

ENVIRONMENTS:
    staging     Deploy to staging environment
    production  Deploy to production environment

OPTIONS:
    -v, --version VERSION    Specify version tag (default: latest)
    -f, --compose-file FILE  Custom docker-compose file
    -e, --env-file FILE      Custom environment file
    --no-backup             Skip database backup
    --timeout SECONDS       Health check timeout (default: 300)
    -h, --help              Show this help message

EXAMPLES:
    $0 staging
    $0 production -v v1.2.3
    $0 staging --no-backup
    $0 production -f docker-compose.custom.yml

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--version)
                VERSION="$2"
                shift 2
                ;;
            -f|--compose-file)
                COMPOSE_FILE="$2"
                shift 2
                ;;
            -e|--env-file)
                ENV_FILE="$2"
                shift 2
                ;;
            --no-backup)
                BACKUP_ENABLED=false
                shift
                ;;
            --timeout)
                HEALTH_CHECK_TIMEOUT="$2"
                shift 2
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            staging|production)
                ENVIRONMENT="$1"
                shift
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$ENVIRONMENT" ]]; then
        error "Environment is required. Use 'staging' or 'production'."
    fi

    # Set defaults based on environment
    if [[ -z "$COMPOSE_FILE" ]]; then
        case $ENVIRONMENT in
            staging)
                COMPOSE_FILE="docker-compose.yml"
                ;;
            production)
                COMPOSE_FILE="docker-compose.prod.yml"
                ;;
        esac
    fi

    if [[ -z "$ENV_FILE" ]]; then
        ENV_FILE=".env.${ENVIRONMENT}"
    fi

    if [[ -z "$VERSION" ]]; then
        VERSION="latest"
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."

    # Check if required files exist
    if [[ ! -f "$PROJECT_ROOT/$COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $COMPOSE_FILE"
    fi

    if [[ ! -f "$PROJECT_ROOT/$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
    fi

    # Check Docker and Docker Compose
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed or not in PATH"
    fi

    # Validate Docker Compose file
    log "Validating Docker Compose configuration..."
    cd "$PROJECT_ROOT"
    if ! docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" config > /dev/null; then
        error "Invalid Docker Compose configuration"
    fi

    success "Pre-deployment checks passed"
}

# Create database backup
create_backup() {
    if [[ "$BACKUP_ENABLED" == "false" ]]; then
        log "Skipping database backup (--no-backup specified)"
        return 0
    fi

    log "Creating database backup..."
    
    local backup_dir="$PROJECT_ROOT/backups"
    local backup_file="backup_${ENVIRONMENT}_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p "$backup_dir"
    
    # Export database
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
        pg_dump -U "${POSTGRES_USER:-survey_user}" "${POSTGRES_DB:-survey_db}" > "$backup_dir/$backup_file"
    
    if [[ $? -eq 0 ]]; then
        success "Database backup created: $backup_file"
        
        # Compress backup
        gzip "$backup_dir/$backup_file"
        success "Backup compressed: ${backup_file}.gz"
    else
        error "Failed to create database backup"
    fi
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    cd "$PROJECT_ROOT"
    
    if ! docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull; then
        error "Failed to pull Docker images"
    fi
    
    success "Docker images pulled successfully"
}

# Deploy application
deploy_application() {
    log "Deploying application to $ENVIRONMENT environment..."
    cd "$PROJECT_ROOT"
    
    # Stop existing containers gracefully
    log "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --timeout 30
    
    # Start new containers
    log "Starting new containers..."
    if ! docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d; then
        error "Failed to start containers"
    fi
    
    success "Containers started successfully"
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to become healthy (timeout: ${HEALTH_CHECK_TIMEOUT}s)..."
    
    local start_time=$(date +%s)
    local services=("backend" "frontend" "postgres" "redis")
    
    for service in "${services[@]}"; do
        log "Checking health of $service..."
        
        local service_healthy=false
        local elapsed=0
        
        while [[ $elapsed -lt $HEALTH_CHECK_TIMEOUT ]]; do
            if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps "$service" | grep -q "healthy\|Up"; then
                success "$service is healthy"
                service_healthy=true
                break
            fi
            
            sleep 10
            elapsed=$(($(date +%s) - start_time))
            log "Waiting for $service... (${elapsed}s elapsed)"
        done
        
        if [[ "$service_healthy" == "false" ]]; then
            error "$service failed to become healthy within timeout"
        fi
    done
    
    success "All services are healthy"
}

# Run application health checks
health_check() {
    log "Running application health checks..."
    
    # Backend health check
    local backend_url="http://localhost:5000/health"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        backend_url="${BACKEND_URL:-http://localhost:5000}/health"
    fi
    
    local max_attempts=10
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s -f "$backend_url" > /dev/null; then
            success "Backend health check passed"
            break
        fi
        
        attempt=$((attempt + 1))
        log "Backend health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 10
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        error "Backend health check failed after $max_attempts attempts"
    fi
    
    # Frontend health check (if applicable)
    local frontend_url="http://localhost:3000/health"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        frontend_url="${FRONTEND_URL:-http://localhost:3000}/health"
    fi
    
    if curl -s -f "$frontend_url" > /dev/null; then
        success "Frontend health check passed"
    else
        warn "Frontend health check failed (may be normal for production with load balancer)"
    fi
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Run database migrations if needed
    log "Running database migrations..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec backend npx prisma migrate deploy
    
    # Clear caches if needed
    log "Clearing application caches..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec redis redis-cli FLUSHALL
    
    # Log deployment info
    local log_file="$PROJECT_ROOT/logs/deployments.log"
    mkdir -p "$(dirname "$log_file")"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Deployed $VERSION to $ENVIRONMENT" >> "$log_file"
    
    success "Post-deployment tasks completed"
}

# Rollback function
rollback() {
    error "Deployment failed. Starting rollback procedure..."
    
    cd "$PROJECT_ROOT"
    
    # Stop current containers
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    
    # If backup exists, offer to restore
    local latest_backup=$(find "$PROJECT_ROOT/backups" -name "backup_${ENVIRONMENT}_*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [[ -n "$latest_backup" && "$BACKUP_ENABLED" == "true" ]]; then
        read -p "Restore database from backup? ($latest_backup) [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "Restoring database from backup..."
            gunzip -c "$latest_backup" | docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
                psql -U "${POSTGRES_USER:-survey_user}" "${POSTGRES_DB:-survey_db}"
            success "Database restored from backup"
        fi
    fi
    
    error "Rollback completed. Please investigate the deployment issue."
}

# Main deployment function
main() {
    log "Starting deployment of Survey Application"
    log "Environment: $ENVIRONMENT"
    log "Version: $VERSION"
    log "Compose file: $COMPOSE_FILE"
    log "Environment file: $ENV_FILE"
    
    # Set trap for cleanup on error
    trap rollback ERR
    
    # Run deployment steps
    pre_deployment_checks
    create_backup
    pull_images
    deploy_application
    wait_for_health
    health_check
    post_deployment
    
    success "🚀 Deployment to $ENVIRONMENT completed successfully!"
    
    # Display useful information
    log "Application endpoints:"
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        log "  Frontend: http://localhost:3000"
        log "  Backend API: http://localhost:5000/api"
        log "  Health Check: http://localhost:5000/health"
        log "  API Docs: http://localhost:5000/api-docs"
        log "  Metrics: http://localhost:5000/metrics"
    else
        log "  Frontend: ${FRONTEND_URL:-https://yourdomain.com}"
        log "  Backend API: ${BACKEND_URL:-https://api.yourdomain.com}/api"
        log "  Health Check: ${BACKEND_URL:-https://api.yourdomain.com}/health"
    fi
}

# Parse arguments and run main function
parse_args "$@"
main