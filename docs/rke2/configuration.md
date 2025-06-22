---
id: rke2-configuration
slug: /rke2/configuration
title: RKE2 Configuration
---

# RKE2 Configuration

Panduan lengkap untuk mengkonfigurasi Rancher Kubernetes Engine 2 (RKE2) sesuai kebutuhan production.

## Configuration File Structure

RKE2 menggunakan file konfigurasi YAML yang terletak di `/etc/rancher/rke2/config.yaml`.

```yaml
# Basic RKE2 Configuration
token: "your-secure-token"
tls-san:
  - "192.168.1.100"
  - "rke2.example.com"
```

## Network Configuration

### CNI (Container Network Interface)

#### Default CNI - Canal (Flannel + Calico)

```yaml
# Default configuration (no need to specify)
cni:
  - canal
```

#### Cilium CNI

```yaml
# Enable Cilium for advanced networking features
cni:
  - cilium

# Cilium specific configuration
cilium:
  enable-ipv4: true
  enable-ipv6: false
  tunnel-protocol: "disabled"
  enable-endpoint-routes: true
  enable-k8s-event-handover: true
  preallocate-bpf-maps: true
  operator:
    replicas: 1
```

#### Calico CNI

```yaml
# Use Calico for advanced network policies
cni:
  - calico

calico:
  mode: "vxlan"
  mtu: 1440
  ipv4-pool: "10.42.0.0/16"
  ipv6-pool: "fd00:42::/48"
```

### Service CIDR Configuration

```yaml
# Custom service CIDR
service-cidr: "10.43.0.0/16"
service-node-port-range: "30000-32767"
cluster-cidr: "10.42.0.0/16"
```

## Storage Configuration

### Local Storage

```yaml
# Configure local storage
local-storage:
  enabled: true
  storage-class: "local-path"
```

### External Storage

```yaml
# NFS Storage
nfs:
  server: "192.168.1.10"
  path: "/nfs/rke2"

# Longhorn Storage
longhorn:
  enabled: true
  replicas: 3
  storage-class: "longhorn"
```

### etcd Configuration

```yaml
# etcd configuration
etcd-s3: true
etcd-s3-bucket: "rke2-backup"
etcd-s3-region: "us-west-2"
etcd-s3-endpoint: "s3.amazonaws.com"
etcd-s3-access-key: "your-access-key"
etcd-s3-secret-key: "your-secret-key"

# etcd backup schedule
etcd-snapshot-schedule-cron: "0 */6 * * *"  # Every 6 hours
etcd-snapshot-retention: 5  # Keep 5 snapshots
```

## Security Configuration

### TLS Configuration

```yaml
# TLS configuration
tls-san:
  - "192.168.1.100"
  - "rke2.example.com"
  - "kubernetes.example.com"

# Custom certificates
tls-cert-file: "/etc/rancher/rke2/tls/server.crt"
tls-key-file: "/etc/rancher/rke2/tls/server.key"
tls-ca-file: "/etc/rancher/rke2/tls/ca.crt"
```

### Secrets Encryption

```yaml
# Enable secrets encryption
secrets-encryption: true

# Custom encryption provider
encryption-provider-config: "/etc/rancher/rke2/encryption-provider.yaml"
```

### Audit Policy

```yaml
# Audit policy configuration
audit-policy-file: "/etc/rancher/rke2/audit-policy.yaml"
audit-log-path: "/var/log/rke2/audit.log"
audit-log-maxage: 30
audit-log-maxbackup: 10
audit-log-maxsize: 100
```

### RBAC Configuration

```yaml
# RBAC configuration
authorization-mode: "Node,RBAC"
```

## Performance Tuning

### API Server Configuration

```yaml
# API Server performance tuning
kube-apiserver-arg:
  - "max-requests-inflight=800"
  - "max-mutating-requests-inflight=400"
  - "request-timeout=60s"
  - "enable-admission-plugins=NodeRestriction,PodSecurityPolicy"
  - "disable-admission-plugins=ServiceAccount"
```

### Controller Manager Configuration

```yaml
# Controller Manager configuration
kube-controller-manager-arg:
  - "node-cidr-mask-size=24"
  - "allocate-node-cidrs=true"
  - "cluster-cidr=10.42.0.0/16"
```

### Scheduler Configuration

```yaml
# Scheduler configuration
kube-scheduler-arg:
  - "config=/etc/rancher/rke2/scheduler-config.yaml"
```

### Kubelet Configuration

```yaml
# Kubelet configuration
kubelet-arg:
  - "max-pods=110"
  - "eviction-hard=memory.available<100Mi,nodefs.available<10%"
  - "eviction-soft=memory.available<200Mi,nodefs.available<15%"
  - "eviction-soft-grace-period=memory.available=30s,nodefs.available=30s"
```

## Monitoring and Logging

### Metrics Server

```yaml
# Enable metrics server
metrics-server:
  enabled: true
```

### Prometheus Configuration

```yaml
# Prometheus monitoring
prometheus:
  enabled: true
  retention: "15d"
  storage-size: "10Gi"
```

### Logging Configuration

```yaml
# Logging configuration
logging:
  level: "info"
  format: "json"
  output: "/var/log/rke2/rke2.log"
```

## High Availability Configuration

### Multi-Server Setup

```yaml
# Server configuration for HA
server: "https://192.168.1.100:6443"
token: "your-secure-token"

# Node labels for HA
node-label:
  - "node-role.kubernetes.io/control-plane=true"
  - "topology.kubernetes.io/zone=zone-1"
```

### Load Balancer Configuration

```yaml
# Load balancer configuration
load-balancer:
  enabled: true
  type: "nginx"
  replicas: 2
  service-type: "LoadBalancer"
```

## Backup and Recovery

### Backup Configuration

```yaml
# Backup configuration
backup:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention: 7  # Keep 7 days
  storage:
    type: "s3"
    bucket: "rke2-backups"
    region: "us-west-2"
```

### Snapshot Configuration

```yaml
# Snapshot configuration
snapshot:
  enabled: true
  schedule: "0 */6 * * *"  # Every 6 hours
  retention: 5  # Keep 5 snapshots
  compression: true
```

## Environment-Specific Configurations

### Development Environment

```yaml
# Development configuration
token: "dev-token"
tls-san:
  - "192.168.1.100"

# Development-specific settings
kube-apiserver-arg:
  - "enable-admission-plugins=NodeRestriction"
  - "disable-admission-plugins=PodSecurityPolicy"

# Resource limits for development
kubelet-arg:
  - "max-pods=50"
  - "eviction-hard=memory.available<50Mi"
```

### Production Environment

```yaml
# Production configuration
token: "prod-secure-token"
tls-san:
  - "prod-rke2.example.com"
  - "kubernetes.example.com"

# Production security settings
secrets-encryption: true
audit-policy-file: "/etc/rancher/rke2/audit-policy.yaml"

# Production performance settings
kube-apiserver-arg:
  - "max-requests-inflight=800"
  - "max-mutating-requests-inflight=400"
  - "enable-admission-plugins=NodeRestriction,PodSecurityPolicy"

kubelet-arg:
  - "max-pods=110"
  - "eviction-hard=memory.available<100Mi,nodefs.available<10%"
```

### Air-gapped Environment

```yaml
# Air-gapped configuration
token: "airgap-token"
tls-san:
  - "192.168.1.100"

# Disable external registries
disable:
  - rke2-coredns
  - rke2-metrics-server

# Use internal registry
registry:
  mirrors:
    docker.io:
      endpoint:
        - "http://192.168.1.10:5000"
```

## Configuration Validation

### Validate Configuration

```bash
# Validate configuration file
rke2 server --config /etc/rancher/rke2/config.yaml --dry-run

# Check configuration syntax
yamllint /etc/rancher/rke2/config.yaml
```

### Configuration Testing

```bash
# Test configuration without starting server
rke2 server --config /etc/rancher/rke2/config.yaml --validate-only

# Check configuration compatibility
rke2 check-config
```

## Configuration Management

### Version Control

```bash
# Backup configuration
sudo cp /etc/rancher/rke2/config.yaml /etc/rancher/rke2/config.yaml.backup

# Version control with git
sudo git init /etc/rancher/rke2/
sudo git add config.yaml
sudo git commit -m "Initial RKE2 configuration"
```

### Configuration Templates

```yaml
# Template for different environments
# config-dev.yaml
token: "{{ .DevToken }}"
tls-san:
  - "{{ .DevIP }}"

# config-prod.yaml  
token: "{{ .ProdToken }}"
tls-san:
  - "{{ .ProdDomain }}"
```

## Troubleshooting Configuration

### Common Configuration Issues

#### Issue 1: Invalid YAML Syntax

```bash
# Check YAML syntax
yamllint /etc/rancher/rke2/config.yaml

# Validate with kubectl
kubectl apply --dry-run=client -f /etc/rancher/rke2/config.yaml
```

#### Issue 2: Network Configuration

```bash
# Check CNI configuration
kubectl get pods -n kube-system | grep cni

# Check network policies
kubectl get networkpolicies --all-namespaces
```

#### Issue 3: Storage Configuration

```bash
# Check storage classes
kubectl get storageclass

# Check persistent volumes
kubectl get pv
kubectl get pvc --all-namespaces
```

### Configuration Debugging

```bash
# Enable debug logging
logging:
  level: "debug"

# Check configuration at runtime
kubectl get configmap -n kube-system

# View applied configuration
kubectl describe configmap -n kube-system
```

## Best Practices

### Security Best Practices

1. **Use strong tokens**: Generate secure random tokens
2. **Enable secrets encryption**: Protect sensitive data
3. **Configure audit logging**: Monitor cluster activities
4. **Use RBAC**: Implement proper access controls
5. **Regular updates**: Keep RKE2 updated

### Performance Best Practices

1. **Resource limits**: Set appropriate resource limits
2. **Monitoring**: Implement comprehensive monitoring
3. **Backup strategy**: Regular backups and testing
4. **Load balancing**: Use proper load balancing
5. **Network optimization**: Optimize network configuration

### Operational Best Practices

1. **Configuration management**: Version control configurations
2. **Documentation**: Document all custom configurations
3. **Testing**: Test configurations in non-production
4. **Rollback plan**: Have rollback procedures ready
5. **Monitoring**: Monitor configuration changes

## References

- [RKE2 Configuration Reference](https://docs.rke2.io/install/install_options/server_config/)
- [Kubernetes Configuration](https://kubernetes.io/docs/concepts/configuration/)
- [etcd Configuration](https://etcd.io/docs/)
- [CNI Configuration](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/) 