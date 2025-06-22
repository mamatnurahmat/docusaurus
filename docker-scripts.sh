#!/bin/bash

# Docker Compose scripts for Docusaurus

case "$1" in
    "dev")
        echo "Starting Docusaurus in development mode..."
        docker-compose up -d
        echo "Docusaurus is running at http://localhost:3000"
        ;;
    "build")
        echo "Building Docusaurus Docker image..."
        docker-compose build
        ;;
    "stop")
        echo "Stopping Docusaurus..."
        docker-compose down
        ;;
    "restart")
        echo "Restarting Docusaurus..."
        docker-compose restart
        ;;
    "logs")
        echo "Showing Docusaurus logs..."
        docker-compose logs -f docusaurus
        ;;
    "clean")
        echo "Cleaning up Docker containers and images..."
        docker-compose down -v --rmi all
        docker system prune -f
        ;;
    "prod")
        echo "Starting Docusaurus in production mode with Nginx..."
        docker-compose --profile production up -d
        echo "Docusaurus is running at http://localhost"
        ;;
    *)
        echo "Usage: $0 {dev|build|stop|restart|logs|clean|prod}"
        echo ""
        echo "Commands:"
        echo "  dev     - Start in development mode"
        echo "  build   - Build Docker image"
        echo "  stop    - Stop containers"
        echo "  restart - Restart containers"
        echo "  logs    - Show logs"
        echo "  clean   - Clean up containers and images"
        echo "  prod    - Start in production mode with Nginx"
        exit 1
        ;;
esac 