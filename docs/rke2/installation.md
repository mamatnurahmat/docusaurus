---
id: rke2-installation
slug: /rke2/installation
title: RKE2 Installation
---

# RKE2 Installation

Panduan lengkap untuk menginstal Rancher Kubernetes Engine 2 (RKE2) di berbagai environment.

## Prerequisites

### System Requirements

#### Minimum Requirements
- **OS**: Ubuntu 20.04+, CentOS 7+, RHEL 7+
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB free space
- **Network**: Internet access untuk download packages

#### Recommended Requirements
- **OS**: Ubuntu 22.04 LTS, RHEL 8+
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection

### Software Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
sudo yum update -y  # CentOS/RHEL

# Install required packages
sudo apt install -y curl wget git  # Ubuntu/Debian
sudo yum install -y curl wget git  # CentOS/RHEL
```

## Installation Methods

### Method 1: Quick Install Script

```bash
# Download and run installation script
curl -sfL https://get.rke2.io | sh -

# Start RKE2 service
sudo systemctl enable rke2-server.service
sudo systemctl start rke2-server.service
```

### Method 2: Manual Installation

#### Step 1: Download RKE2 Binary

```bash
# Create installation directory
sudo mkdir -p /opt/rke2

# Download RKE2 binary
wget https://github.com/rancher/rke2/releases/download/v1.27.8%2Brke2r1/rke2.linux-amd64.tar.gz

# Extract binary
sudo tar xzf rke2.linux-amd64.tar.gz -C /opt/rke2

# Create symlink
sudo ln -s /opt/rke2/rke2 /usr/local/bin/rke2
```

#### Step 2: Create Configuration

```bash
# Create config directory
sudo mkdir -p /etc/rancher/rke2

# Create basic configuration
sudo tee /etc/rancher/rke2/config.yaml <<EOF
# RKE2 Configuration
token: "your-secure-token-here"
tls-san:
  - "your-server-ip"
  - "your-domain.com"
node-label:
  - "node-role.kubernetes.io/control-plane=true"
EOF
```

#### Step 3: Start RKE2 Server

```bash
# Start RKE2 server
sudo rke2 server &

# Wait for initialization
sleep 30

# Check status
sudo rke2 server --help
```

### Method 3: Air-gapped Installation

#### Prepare Offline Package

```bash
# Download offline package
wget https://github.com/rancher/rke2/releases/download/v1.27.8%2Brke2r1/rke2-images-core.linux-amd64.tar.zst
wget https://github.com/rancher/rke2/releases/download/v1.27.8%2Brke2r1/rke2-images-cilium.linux-amd64.tar.zst

# Transfer to target server
scp rke2-images-*.tar.zst user@target-server:/tmp/
```

#### Install on Target Server

```bash
# Create images directory
sudo mkdir -p /var/lib/rancher/rke2/agent/images/

# Copy images
sudo cp /tmp/rke2-images-*.tar.zst /var/lib/rancher/rke2/agent/images/

# Install with offline images
curl -sfL https://get.rke2.io | INSTALL_RKE2_ARTIFACT_PATH=/var/lib/rancher/rke2/agent/images sh -
```

## Configuration Options

### Basic Configuration

```yaml
# /etc/rancher/rke2/config.yaml
token: "your-secure-token"
tls-san:
  - "192.168.1.100"
  - "rke2.example.com"
node-label:
  - "node-role.kubernetes.io/control-plane=true"
  - "environment=production"
```

### Advanced Configuration

```yaml
# /etc/rancher/rke2/config.yaml
token: "your-secure-token"
tls-san:
  - "192.168.1.100"
  - "rke2.example.com"

# Network configuration
cni:
  - cilium

# Storage configuration
etcd-s3: true
etcd-s3-bucket: "rke2-backup"
etcd-s3-region: "us-west-2"

# Security configuration
secrets-encryption: true
audit-policy-file: "/etc/rancher/rke2/audit-policy.yaml"

# Performance tuning
kube-apiserver-arg:
  - "max-requests-inflight=800"
  - "max-mutating-requests-inflight=400"
```

## Verification

### Check Installation

```bash
# Check RKE2 service status
sudo systemctl status rke2-server

# Check RKE2 version
rke2 --version

# Check Kubernetes version
kubectl version --client
```

### Verify Cluster

```bash
# Get kubeconfig
sudo cat /etc/rancher/rke2/rke2.yaml

# Set KUBECONFIG
export KUBECONFIG=/etc/rancher/rke2/rke2.yaml

# Check nodes
kubectl get nodes

# Check pods
kubectl get pods --all-namespaces
```

## Troubleshooting

### Common Issues

#### Issue 1: Service Won't Start

```bash
# Check logs
sudo journalctl -u rke2-server -f

# Check configuration
sudo rke2 server --help

# Verify prerequisites
sudo rke2 check-config
```

#### Issue 2: Network Connectivity

```bash
# Check ports
sudo netstat -tlnp | grep rke2

# Check firewall
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS/RHEL
```

#### Issue 3: Storage Issues

```bash
# Check disk space
df -h

# Check inodes
df -i

# Check storage class
kubectl get storageclass
```

### Log Analysis

```bash
# View RKE2 logs
sudo tail -f /var/log/rke2.log

# View containerd logs
sudo journalctl -u containerd -f

# View kubelet logs
sudo journalctl -u kubelet -f
```

## Security Considerations

### Firewall Configuration

```bash
# Required ports for RKE2
sudo ufw allow 6443/tcp  # Kubernetes API
sudo ufw allow 10250/tcp # Kubelet
sudo ufw allow 2379/tcp  # etcd
sudo ufw allow 2380/tcp  # etcd peer
sudo ufw allow 8472/udp  # Canal/Flannel VXLAN
sudo ufw allow 9099/tcp  # Canal/Flannel health
```

### SELinux Configuration

```bash
# For RHEL/CentOS with SELinux
sudo setsebool -P container_manage_cgroup 1
sudo setsebool -P container_manage_network 1
```

### RBAC Configuration

```yaml
# Create admin user
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kube-system
```

## Next Steps

After successful installation:

1. **Configure kubectl**: Set up kubeconfig for cluster access
2. **Install Helm**: Package manager for Kubernetes
3. **Deploy Applications**: Start deploying your workloads
4. **Setup Monitoring**: Install monitoring and logging solutions
5. **Configure Backup**: Set up etcd backup strategy

## References

- [RKE2 Official Documentation](https://docs.rke2.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Rancher Documentation](https://rancher.com/docs/)
- [GitHub Repository](https://github.com/rancher/rke2) 