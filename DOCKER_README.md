# DevOps Documentation - Docker Setup

Dokumentasi DevOps yang dapat dijalankan menggunakan Docker dan Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Development Environment
```bash
# Start development server
./scripts/start.sh dev

# Access at: http://localhost:3000
```

### Production Environment
```bash
# Start production server
./scripts/start.sh prod

# Access at: http://localhost:80
```

### SSL Environment
```bash
# Start with SSL support
./scripts/start.sh ssl

# Access at: https://devops-docs.local
```

## 📋 Available Commands

```bash
./scripts/start.sh dev          # Development environment
./scripts/start.sh prod         # Production environment  
./scripts/start.sh ssl          # SSL environment
./scripts/start.sh monitoring   # Monitoring stack
./scripts/start.sh backup       # Backup service
./scripts/start.sh stop         # Stop all services
./scripts/start.sh logs         # View logs
./scripts/start.sh rebuild      # Rebuild images
./scripts/start.sh status       # Show status
```

## 🏗️ Architecture

### Multi-Stage Docker Build
- **Builder Stage**: Node.js build environment
- **Production Stage**: Nginx serving static files
- **Development Stage**: Node.js development server

### Services
- **devops-docs-dev**: Development server with hot reload
- **devops-docs-prod**: Production server with Nginx
- **devops-docs-ssl**: SSL-enabled production server
- **nginx-proxy**: Reverse proxy for SSL termination
- **letsencrypt**: Automatic SSL certificate management
- **prometheus**: Metrics collection
- **grafana**: Monitoring dashboards
- **backup**: Automated backup service

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=development|production
VIRTUAL_HOST=your-domain.com
VIRTUAL_PORT=80
```

### Ports
- **3000**: Development server
- **80**: Production server
- **443**: SSL server
- **9090**: Prometheus
- **3001**: Grafana

### Volumes
- **Source code**: Mounted for development
- **Build artifacts**: Served by Nginx
- **SSL certificates**: Managed by Let's Encrypt
- **Monitoring data**: Persistent storage
- **Backups**: Local backup directory

## 📊 Monitoring

### Prometheus
- **URL**: http://localhost:9090
- **Features**: Metrics collection, alerting, data retention

### Grafana
- **URL**: http://localhost:3001
- **Credentials**: admin/admin
- **Features**: Dashboards, data visualization, alerting

## 💾 Backup & Recovery

### Automatic Backup
- Daily compressed backups
- Timestamped files
- Configurable retention

### Manual Backup
```bash
# Create backup
docker-compose exec devops-docs-prod tar -czf /tmp/backup.tar.gz -C /usr/share/nginx/html .

# Restore backup
docker cp backup.tar.gz devops-docs-prod:/tmp/
docker-compose exec devops-docs-prod tar -xzf /tmp/backup.tar.gz -C /usr/share/nginx/html
```

## 🔒 Security Features

### Network Security
- Internal Docker networks
- Minimal port exposure
- Reverse proxy for SSL

### Container Security
- Non-root user execution
- Minimal base images
- Security headers
- Content Security Policy

### SSL/TLS
- Automatic certificate generation
- Let's Encrypt integration
- HTTPS enforcement
- Certificate renewal

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check port usage
sudo netstat -tlnp | grep :80

# Use different port
docker-compose up -d -p 8080:80
```

#### Permission Issues
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

#### Build Failures
```bash
# Clean build
docker-compose build --no-cache

# Check disk space
df -h
```

### Logs
```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f devops-docs-prod

# View with timestamps
docker-compose logs -t
```

## 📈 Performance

### Optimization Features
- Multi-stage builds
- Gzip compression
- Static file caching
- Resource limits
- Health checks

### Monitoring
- Container resource usage
- Application metrics
- Performance dashboards
- Alert notifications

## 🔄 CI/CD Integration

### Build Pipeline
```yaml
# Example GitHub Actions
- name: Build Docker image
  run: docker-compose build

- name: Run tests
  run: docker-compose --profile test up --abort-on-container-exit

- name: Deploy to production
  run: docker-compose --profile prod up -d
```

### Deployment
- Automated builds
- Blue-green deployment
- Rollback capability
- Health checks

## 📚 Documentation

### Available Topics
- **DevOps Overview**: Introduction to DevOps practices
- **CI/CD Pipeline**: Continuous Integration/Deployment
- **GitOps**: Git as source of truth
- **Kubernetes**: Container orchestration
- **Rancher**: Kubernetes management
- **RKE2**: Rancher Kubernetes Engine 2
- **Docker Setup**: This guide
- **Sidebar Configuration**: Dynamic sidebar setup

### Navigation
- **Sidebar**: Dynamic navigation with categories
- **Search**: Full-text search functionality
- **Responsive**: Mobile-friendly design
- **Dark Mode**: Theme switching

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test with Docker
5. Submit pull request

### Testing
```bash
# Run tests
docker-compose --profile test up --abort-on-container-exit

# Check build
docker-compose build --no-cache

# Validate configuration
docker-compose config
```

## 📞 Support

### Resources
- **Documentation**: [docs.devops-docs.com](https://docs.devops-docs.com)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

### Community
- **Discord**: [DevOps Documentation Community](https://discord.gg/devops-docs)
- **Stack Overflow**: Tagged with `devops-docs`
- **Blog**: [devops-docs.com/blog](https://devops-docs.com/blog)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Happy Documenting! 📖✨** 