---
id: docker-setup
slug: /docker-setup
title: Docker Setup
---

# Docker Setup

Panduan lengkap untuk menjalankan dokumentasi DevOps menggunakan Docker dan Docker Compose.

## Prerequisites

### System Requirements
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Disk Space**: Minimum 2GB free space
- **Memory**: Minimum 4GB RAM

### Install Docker

#### Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

#### CentOS/RHEL
```bash
# Install prerequisites
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
```

### Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

## Quick Start

### Using Start Script

```bash
# Make script executable
chmod +x scripts/start.sh

# Start development environment
./scripts/start.sh dev

# Start production environment
./scripts/start.sh prod

# Start with SSL support
./scripts/start.sh ssl

# Start monitoring stack
./scripts/start.sh monitoring
```

### Manual Docker Commands

#### Development Environment
```bash
# Build and start development container
docker-compose --profile dev up -d

# View logs
docker-compose logs -f devops-docs-dev

# Stop development environment
docker-compose --profile dev down
```

#### Production Environment
```bash
# Build and start production container
docker-compose --profile prod up -d

# View logs
docker-compose logs -f devops-docs-prod

# Stop production environment
docker-compose --profile prod down
```

## Environment Configurations

### Development Environment

**Features:**
- Hot reload enabled
- Source code mounted as volume
- Development server on port 3000
- Debug logging enabled

**Configuration:**
```yaml
devops-docs-dev:
  build:
    target: development
  ports:
    - "3000:3000"
  volumes:
    - .:/app
    - /app/node_modules
  environment:
    - NODE_ENV=development
    - CHOKIDAR_USEPOLLING=true
```

### Production Environment

**Features:**
- Optimized build
- Nginx web server
- Static file serving
- Gzip compression
- Security headers

**Configuration:**
```yaml
devops-docs-prod:
  build:
    target: production
  ports:
    - "80:80"
  environment:
    - NODE_ENV=production
```

### SSL Environment

**Features:**
- Automatic SSL certificates
- Domain-based routing
- HTTPS support
- Let's Encrypt integration

**Configuration:**
```yaml
devops-docs-ssl:
  environment:
    - VIRTUAL_HOST=devops-docs.local
    - VIRTUAL_PORT=80
```

## Monitoring Stack

### Prometheus Configuration

**Access:** http://localhost:9090

**Features:**
- Metrics collection
- Alerting rules
- Data retention
- Web UI

**Configuration:**
```yaml
prometheus:
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
```

### Grafana Configuration

**Access:** http://localhost:3001  
**Credentials:** admin/admin

**Features:**
- Dashboard visualization
- Data source integration
- Alerting
- User management

**Configuration:**
```yaml
grafana:
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
    - GF_USERS_ALLOW_SIGN_UP=false
```

## Backup and Recovery

### Automatic Backup

**Features:**
- Daily backups
- Compressed archives
- Timestamped files
- Configurable retention

**Configuration:**
```yaml
backup:
  volumes:
    - ./backup:/backup
    - devops_docs_data:/data:ro
  command: |
    sh -c "
      while true; do
        tar -czf /backup/devops-docs-$$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
        sleep 86400
      done
    "
```

### Manual Backup

```bash
# Create backup
docker-compose exec devops-docs-prod tar -czf /tmp/backup-$(date +%Y%m%d).tar.gz -C /usr/share/nginx/html .

# Copy backup to host
docker cp devops-docs-prod:/tmp/backup-$(date +%Y%m%d).tar.gz ./backup/

# Restore backup
docker cp ./backup/backup-20231201.tar.gz devops-docs-prod:/tmp/
docker-compose exec devops-docs-prod tar -xzf /tmp/backup-20231201.tar.gz -C /usr/share/nginx/html
```

## Troubleshooting

### Common Issues

#### Issue 1: Port Already in Use
```bash
# Check what's using the port
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000

# Kill process using the port
sudo kill -9 <PID>

# Or use different ports
docker-compose up -d -p 8080:80
```

#### Issue 2: Permission Denied
```bash
# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Issue 3: Build Failures
```bash
# Clean build
docker-compose build --no-cache

# Check Dockerfile syntax
docker build --target development .

# Check available disk space
df -h
```

#### Issue 4: SSL Certificate Issues
```bash
# Check certificate files
ls -la nginx-proxy/certs/

# Regenerate certificates
docker-compose restart letsencrypt

# Check logs
docker-compose logs letsencrypt
```

### Log Analysis

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs devops-docs-prod

# Follow logs in real-time
docker-compose logs -f

# View logs with timestamps
docker-compose logs -t
```

### Performance Monitoring

```bash
# Check container resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Check image sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

## Security Considerations

### Network Security
- Use internal networks for inter-service communication
- Expose only necessary ports
- Implement firewall rules
- Use reverse proxy for SSL termination

### Container Security
- Run containers as non-root user
- Use minimal base images
- Scan images for vulnerabilities
- Keep images updated

### Data Security
- Encrypt sensitive data
- Use secrets management
- Implement access controls
- Regular security audits

## Best Practices

### Development
1. **Use volumes for source code**: Enable hot reload
2. **Separate dev and prod configs**: Different optimization levels
3. **Use health checks**: Monitor container health
4. **Implement logging**: Centralized log management

### Production
1. **Use multi-stage builds**: Reduce image size
2. **Implement caching**: Optimize build times
3. **Use resource limits**: Prevent resource exhaustion
4. **Monitor performance**: Track metrics and alerts

### Maintenance
1. **Regular updates**: Keep images and dependencies updated
2. **Backup strategy**: Automated and manual backups
3. **Monitoring**: Comprehensive monitoring stack
4. **Documentation**: Keep setup documentation updated

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/) 