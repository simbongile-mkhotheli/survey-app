#!/bin/bash

# Survey Application Rollback Script
# This script handles rollback to previous versions in case of deployment issues

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=""
VERSION=""
BACKUP_FILE=""
COMPOSE_FILE=""
ENV_FILE=""

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

Rollback Survey Application deployment.

ENVIRONMENTS:
    staging     Rollback staging environment
    production  Rollback production environment

OPTIONS:
    -v, --version VERSION    Rollback to specific version
    -b, --backup FILE        Restore from specific backup file
    -f, --compose-file FILE  Custom docker-compose file
    -e, --env-file FILE      Custom environment file
    --list-backups          List available backups
    --list-versions         List available versions
    -h, --help              Show this help message

EXAMPLES:
    $0 staging
    $0 production -v v1.2.0
    $0 staging -b backup_staging_20231105_120000.sql.gz
    $0 production --list-backups

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
            -b|--backup)
                BACKUP_FILE="$2"
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
            --list-backups)
                list_backups
                exit 0
                ;;
            --list-versions)
                list_versions
                exit 0
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
}

# List available backups
list_backups() {
    log "Available backups for $ENVIRONMENT:"
    echo
    
    local backup_dir="$PROJECT_ROOT/backups"
    if [[ ! -d "$backup_dir" ]]; then
        warn "No backup directory found"
        return
    fi
    
    local backups=($(find "$backup_dir" -name "backup_${ENVIRONMENT}_*.sql.gz" -type f | sort -r))
    
    if [[ ${#backups[@]} -eq 0 ]]; then
        warn "No backups found for $ENVIRONMENT"
        return
    fi
    
    for backup in "${backups[@]}"; do
        local filename=$(basename "$backup")
        local size=$(du -h "$backup" | cut -f1)
        local date=$(stat -c %y "$backup" | cut -d' ' -f1-2)
        
        printf "  %-50s %8s  %s\n" "$filename" "$size" "$date"
    done
}

# List available versions (from deployment log)
list_versions() {
    log "Recent deployments for $ENVIRONMENT:"
    echo
    
    local log_file="$PROJECT_ROOT/logs/deployments.log"
    if [[ ! -f "$log_file" ]]; then
        warn "No deployment log found"
        return
    fi
    
    grep "$ENVIRONMENT" "$log_file" | tail -10 | while read -r line; do
        echo "  $line"
    done
}

# Get latest backup
get_latest_backup() {
    local backup_dir="$PROJECT_ROOT/backups"
    
    if [[ -n "$BACKUP_FILE" ]]; then
        if [[ -f "$backup_dir/$BACKUP_FILE" ]]; then
            echo "$backup_dir/$BACKUP_FILE"
        else
            error "Specified backup file not found: $BACKUP_FILE"
        fi
    else
        find "$backup_dir" -name "backup_${ENVIRONMENT}_*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-
    fi
}

# Stop current deployment
stop_current_deployment() {
    log "Stopping current deployment..."
    cd "$PROJECT_ROOT"
    
    if ! docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --timeout 30; then
        warn "Failed to gracefully stop containers, forcing stop..."
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" kill
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" rm -f
    fi
    
    success "Current deployment stopped"
}

# Restore database from backup
restore_database() {
    local backup_file="$1"
    
    if [[ -z "$backup_file" || ! -f "$backup_file" ]]; then
        warn "No valid backup file provided, skipping database restore"
        return
    fi
    
    log "Restoring database from backup: $(basename "$backup_file")"
    
    # Start only the database container
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec postgres pg_isready -U "${POSTGRES_USER:-survey_user}" > /dev/null 2>&1; then
            success "Database is ready"
            break
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        error "Database failed to become ready"
    fi
    
    # Restore the backup
    log "Restoring database content..."
    if gunzip -c "$backup_file" | docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
        psql -U "${POSTGRES_USER:-survey_user}" "${POSTGRES_DB:-survey_db}" > /dev/null; then
        success "Database restored successfully"
    else
        error "Failed to restore database from backup"
    fi
}

# Deploy previous version
deploy_previous_version() {
    log "Deploying previous version..."
    cd "$PROJECT_ROOT"
    
    # If version specified, use it; otherwise use 'latest'
    local target_version="${VERSION:-latest}"
    
    log "Pulling images for version: $target_version"
    
    # Update docker-compose to use specific version if provided
    if [[ -n "$VERSION" && "$VERSION" != "latest" ]]; then
        # This would require modifying the docker-compose file or using environment variables
        export IMAGE_TAG="$VERSION"
    fi
    
    # Pull and start containers
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull && \
       docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d; then
        success "Previous version deployed successfully"
    else
        error "Failed to deploy previous version"
    fi
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to become healthy..."
    
    local services=("backend" "frontend" "postgres" "redis")
    local timeout=300
    local start_time=$(date +%s)
    
    for service in "${services[@]}"; do
        log "Checking health of $service..."
        
        local service_healthy=false
        local elapsed=0
        
        while [[ $elapsed -lt $timeout ]]; do
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

# Verify rollback
verify_rollback() {
    log "Verifying rollback..."
    
    # Health check
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
        log "Health check attempt $attempt/$max_attempts..."
        sleep 10
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        error "Backend health check failed after rollback"
    fi
    
    # Log rollback
    local log_file="$PROJECT_ROOT/logs/deployments.log"
    mkdir -p "$(dirname "$log_file")"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Rollback to ${VERSION:-previous} on $ENVIRONMENT" >> "$log_file"
    
    success "Rollback verification completed"
}

# Main rollback function
main() {
    log "Starting rollback of Survey Application"
    log "Environment: $ENVIRONMENT"
    log "Target version: ${VERSION:-latest/previous}"
    log "Backup file: ${BACKUP_FILE:-auto-detect}"
    
    # Confirmation prompt for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        warn "You are about to rollback the PRODUCTION environment!"
        read -p "Are you sure you want to continue? [y/N]: " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Rollback cancelled"
            exit 0
        fi
    fi
    
    # Get backup file if database restore is needed
    local backup_file=""
    if [[ -n "$BACKUP_FILE" || -d "$PROJECT_ROOT/backups" ]]; then
        backup_file=$(get_latest_backup)
        if [[ -n "$backup_file" ]]; then
            log "Will restore database from: $(basename "$backup_file")"
        fi
    fi
    
    # Execute rollback steps
    stop_current_deployment
    
    if [[ -n "$backup_file" ]]; then
        restore_database "$backup_file"
    fi
    
    deploy_previous_version
    wait_for_health
    verify_rollback
    
    success "🔄 Rollback to $ENVIRONMENT completed successfully!"
    
    # Display useful information
    log "Application endpoints:"
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        log "  Frontend: http://localhost:3000"
        log "  Backend API: http://localhost:5000/api"
        log "  Health Check: http://localhost:5000/health"
    else
        log "  Frontend: ${FRONTEND_URL:-https://yourdomain.com}"
        log "  Backend API: ${BACKEND_URL:-https://api.yourdomain.com}/api"
        log "  Health Check: ${BACKEND_URL:-https://api.yourdomain.com}/health"
    fi
    
    warn "Please verify that the application is functioning correctly after rollback"
}

# Parse arguments and run main function
parse_args "$@"
main