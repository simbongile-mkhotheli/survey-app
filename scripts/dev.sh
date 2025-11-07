#!/bin/bash

# Development Helper Script
# This script provides common development tasks and utilities

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

usage() {
    cat << EOF
Development Helper Script for Survey Application

Usage: $0 COMMAND [OPTIONS]

COMMANDS:
    setup           Initial project setup
    start           Start development environment
    stop            Stop development environment
    restart         Restart development environment
    logs            Show application logs
    test            Run tests
    build           Build application
    clean           Clean up containers and volumes
    reset           Reset development environment
    backup          Create development database backup
    restore         Restore development database backup
    health          Check application health
    metrics         Show application metrics

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Verbose output

EXAMPLES:
    $0 setup        # Initial project setup
    $0 start        # Start development environment
    $0 logs backend # Show backend logs
    $0 test         # Run all tests
    $0 reset        # Reset everything

EOF
}

# Initial project setup
setup() {
    log "Setting up Survey Application development environment..."
    
    cd "$PROJECT_ROOT"
    
    # Check prerequisites
    if ! command -v docker &> /dev/null; then
        error "Docker is required but not installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is required but not installed"
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
    fi
    
    # Install dependencies
    log "Installing backend dependencies..."
    cd backend && npm ci
    
    log "Installing frontend dependencies..."
    cd ../frontend && npm ci
    
    cd "$PROJECT_ROOT"
    
    # Copy environment files if they don't exist
    if [[ ! -f backend/.env ]]; then
        log "Creating backend .env file..."
        cp backend/.env.example backend/.env
    fi
    
    if [[ ! -f frontend/.env ]]; then
        log "Creating frontend .env file..."
        cp frontend/.env.example frontend/.env 2>/dev/null || true
    fi
    
    # Generate Prisma client
    log "Generating Prisma client..."
    cd backend && npx prisma generate
    
    # Create necessary directories
    mkdir -p logs backups
    
    success "Setup completed! Run '$0 start' to start the development environment."
}

# Start development environment
start() {
    log "Starting development environment..."
    cd "$PROJECT_ROOT"
    
    # Start infrastructure services
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 10
    
    # Run database migrations
    log "Running database migrations..."
    cd backend && npx prisma migrate dev --name init || true
    
    # Start application services
    cd "$PROJECT_ROOT"
    docker-compose up -d
    
    # Show status
    docker-compose ps
    
    success "Development environment started!"
    log "Frontend: http://localhost:3000"
    log "Backend API: http://localhost:5000/api"
    log "API Docs: http://localhost:5000/api-docs"
    log "Health Check: http://localhost:5000/health"
    log "Metrics: http://localhost:5000/metrics"
}

# Stop development environment
stop() {
    log "Stopping development environment..."
    cd "$PROJECT_ROOT"
    docker-compose down
    success "Development environment stopped"
}

# Restart development environment
restart() {
    log "Restarting development environment..."
    stop
    start
}

# Show logs
show_logs() {
    local service="${1:-}"
    cd "$PROJECT_ROOT"
    
    if [[ -n "$service" ]]; then
        log "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        log "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Backend tests
    log "Running backend tests..."
    cd "$PROJECT_ROOT/backend"
    npm test
    
    # Frontend tests
    log "Running frontend tests..."
    cd "$PROJECT_ROOT/frontend"
    npm test
    
    success "All tests completed"
}

# Build application
build() {
    log "Building application..."
    
    # Backend build
    log "Building backend..."
    cd "$PROJECT_ROOT/backend"
    npm run build
    
    # Frontend build
    log "Building frontend..."
    cd "$PROJECT_ROOT/frontend"
    npm run build
    
    success "Build completed"
}

# Clean up
clean() {
    log "Cleaning up development environment..."
    cd "$PROJECT_ROOT"
    
    # Stop and remove containers
    docker-compose down --volumes --remove-orphans
    
    # Remove images
    docker-compose down --rmi all 2>/dev/null || true
    
    # Prune Docker system
    docker system prune -f
    
    success "Cleanup completed"
}

# Reset development environment
reset() {
    log "Resetting development environment..."
    
    # Confirm action
    read -p "This will destroy all data. Continue? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Reset cancelled"
        exit 0
    fi
    
    clean
    
    # Remove node_modules
    log "Removing node_modules..."
    rm -rf backend/node_modules frontend/node_modules
    
    # Remove dist/build directories
    rm -rf backend/dist frontend/dist
    
    # Reset database
    log "Resetting database..."
    rm -f backend/prisma/dev.db*
    
    setup
    start
    
    success "Development environment reset completed"
}

# Create backup
create_backup() {
    log "Creating development database backup..."
    cd "$PROJECT_ROOT"
    
    local backup_dir="backups"
    local backup_file="backup_dev_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p "$backup_dir"
    
    docker-compose exec -T postgres pg_dump -U survey_user survey_db > "$backup_dir/$backup_file"
    gzip "$backup_dir/$backup_file"
    
    success "Backup created: ${backup_file}.gz"
}

# Restore backup
restore_backup() {
    local backup_file="$1"
    
    if [[ -z "$backup_file" ]]; then
        error "Please specify a backup file"
    fi
    
    if [[ ! -f "backups/$backup_file" ]]; then
        error "Backup file not found: $backup_file"
    fi
    
    log "Restoring database from backup: $backup_file"
    cd "$PROJECT_ROOT"
    
    # Stop application but keep database running
    docker-compose stop backend frontend
    
    # Restore backup
    gunzip -c "backups/$backup_file" | docker-compose exec -T postgres psql -U survey_user survey_db
    
    # Restart application
    docker-compose start backend frontend
    
    success "Database restored from backup"
}

# Check health
health_check() {
    log "Checking application health..."
    
    local services=("backend:5000/health" "frontend:3000/health")
    
    for service_url in "${services[@]}"; do
        local service_name="${service_url%%:*}"
        local url="http://localhost:${service_url#*:}"
        
        log "Checking $service_name..."
        if curl -s -f "$url" > /dev/null; then
            success "$service_name is healthy"
        else
            error "$service_name is unhealthy"
        fi
    done
    
    success "Health check completed"
}

# Show metrics
show_metrics() {
    log "Fetching application metrics..."
    
    echo "=== Backend Metrics ==="
    curl -s http://localhost:5000/metrics | head -20
    echo
    
    echo "=== System Status ==="
    curl -s http://localhost:5000/api/monitoring/status | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/monitoring/status
    
    success "Metrics displayed"
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        setup)
            setup
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            show_logs "${2:-}"
            ;;
        test)
            run_tests
            ;;
        build)
            build
            ;;
        clean)
            clean
            ;;
        reset)
            reset
            ;;
        backup)
            create_backup
            ;;
        restore)
            restore_backup "${2:-}"
            ;;
        health)
            health_check
            ;;
        metrics)
            show_metrics
            ;;
        -h|--help|help)
            usage
            ;;
        "")
            usage
            ;;
        *)
            error "Unknown command: $command"
            ;;
    esac
}

main "$@"