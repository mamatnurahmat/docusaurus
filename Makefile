# Makefile for Docusaurus DevOps Documentation

# Variables
DOCKER_COMPOSE_DEV = docker-compose.dev.yml
DOCKER_COMPOSE_PROD = docker-compose.yml

.PHONY: help dev dev-rebuild stop build clean logs shell

help:
	@echo "Available commands:"
	@echo "  make dev          - Start development server with hot-reload"
	@echo "  make dev-rebuild  - Rebuild and start development server"
	@echo "  make stop         - Stop development server"
	@echo "  make build        - Build static HTML into 'build/' directory (using Docker)"
	@echo "  make clean        - Remove build artifacts and development cache"
	@echo "  make logs         - View development server logs"
	@echo "  make shell        - Open a shell inside the development container"

dev:
	docker compose -f $(DOCKER_COMPOSE_DEV) up

dev-rebuild:
	docker compose -f $(DOCKER_COMPOSE_DEV) up --build

stop:
	docker compose -f $(DOCKER_COMPOSE_DEV) down

build:
	@echo "Building static HTML..."
	docker run --rm \
		-v $(shell pwd):/app \
		-w /app \
		node:18-alpine \
		sh -c "npm install && npm run build"
	@echo "Success! Static files generated in: ./build"

clean:
	@echo "Cleaning up..."
	rm -rf build .docusaurus node_modules
	docker compose -f $(DOCKER_COMPOSE_DEV) down -v --remove-orphans

logs:
	docker compose -f $(DOCKER_COMPOSE_DEV) logs -f

shell:
	docker compose -f $(DOCKER_COMPOSE_DEV) exec docusaurus-dev sh
