#!/bin/bash

# DevOps Documentation - Start Script
# Usage: ./scripts/start.sh [dev|prod|ssl|monitoring|backup]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  DevOps Documentation Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_status "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it first."
        exit 1
    fi
    print_status "Docker Compose is available"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p nginx-proxy/{certs,vhost.d,html,acme}
    mkdir -p monitoring/grafana/{dashboards,datasources}
    mkdir -p backup
    print_status "Directories created successfully"
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose --profile dev up -d
    print_status "Development server started at http://localhost:3000"
    print_status "Press Ctrl+C to stop"
    docker-compose --profile dev logs -f devops-docs-dev
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    docker-compose --profile prod up -d
    print_status "Production server started at http://localhost:80"
}

# Function to start SSL environment
start_ssl() {
    print_status "Starting SSL environment..."
    print_warning "Make sure to update VIRTUAL_HOST in docker-compose.yml with your domain"
    docker-compose --profile ssl up -d
    print_status "SSL server started"
    print_status "Access via: https://devops-docs.local (update hosts file if needed)"
}

# Function to start monitoring
start_monitoring() {
    print_status "Starting monitoring stack..."
    docker-compose --profile monitoring up -d
    print_status "Prometheus started at http://localhost:9090"
    print_status "Grafana started at http://localhost:3001 (admin/admin)"
}

# Function to start backup service
start_backup() {
    print_status "Starting backup service..."
    docker-compose --profile backup up -d
    print_status "Backup service started"
    print_status "Backups will be created in ./backup directory"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    docker-compose down
    print_status "All services stopped"
}

# Function to show logs
show_logs() {
    print_status "Showing logs..."
    docker-compose logs -f
}

# Function to rebuild images
rebuild() {
    print_status "Rebuilding Docker images..."
    docker-compose build --no-cache
    print_status "Images rebuilt successfully"
}

# Function to show status
show_status() {
    print_status "Container status:"
    docker-compose ps
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  ssl         Start production with SSL"
    echo "  monitoring  Start monitoring stack (Prometheus + Grafana)"
    echo "  backup      Start backup service"
    echo "  stop        Stop all services"
    echo "  logs        Show logs"
    echo "  rebuild     Rebuild Docker images"
    echo "  status      Show container status"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev          # Start development server"
    echo "  $0 prod         # Start production server"
    echo "  $0 ssl          # Start with SSL support"
    echo "  $0 monitoring   # Start monitoring stack"
}

# Main script
main() {
    print_header
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Create directories
    create_directories
    
    # Parse command line arguments
    case "${1:-help}" in
        dev)
            start_dev
            ;;
        prod)
            start_prod
            ;;
        ssl)
            start_ssl
            ;;
        monitoring)
            start_monitoring
            ;;
        backup)
            start_backup
            ;;
        stop)
            stop_all
            ;;
        logs)
            show_logs
            ;;
        rebuild)
            rebuild
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 