---
id: devops
slug: /devops
title: DevOps
---

# DevOps

Dokumentasi ini membahas berbagai aspek DevOps modern — mulai dari keamanan infrastruktur, CI/CD pipeline, GitOps, Kubernetes, monitoring, hingga setup lingkungan pengembangan.

---

## 🔐 Security

Arsitektur pertahanan berlapis (*Defense in Depth*) untuk melindungi infrastruktur dari ancaman siber.

| Sub Tema | Deskripsi |
|---|---|
| [Security Overview](./security) | Gambaran umum strategi keamanan infrastruktur |
| [WAF dengan HAProxy & ModSecurity](./security/waf-haproxy-modsecurity) | Web Application Firewall dengan HAProxy, ModSecurity SPOA, dan OWASP CRS |
| [CrowdSec & HAProxy](./security/crowdsec-haproxy) | Proteksi berlapis: CrowdSec threat intelligence + ModSecurity WAF |
| [CrowdSec & Nginx Proxy Manager](./security/crowdsec-nginx) | Mengamankan NPM dengan CrowdSec Bouncer |

---

## 🔄 CI/CD Pipeline

Otomatisasi proses build, test, dan deployment.

| Sub Tema | Deskripsi |
|---|---|
| [CI/CD Overview](./cicd) | Konsep dasar dan strategi CI/CD |
| [GitOps dalam CI/CD](./cicd/gitops) | Integrasi GitOps (ArgoCD/Flux) ke dalam pipeline CI/CD |
| [Jenkins](./cicd/jenkins) | Pipeline CI/CD dengan Jenkins, Jenkinsfile, dan integrasi Kubernetes |
| [Docker Buildx](./cicd/buildx-docker) | Multi-platform image build dengan Docker Buildx dan BuildKit |

---

## ☸️ Kubernetes & Orchestration

| Sub Tema | Deskripsi |
|---|---|
| [Kubernetes](./kubernetes) | Konsep dasar, arsitektur, dan pengelolaan cluster |
| [Rancher](./rancher) | Platform manajemen multi-cluster Kubernetes |
| [RKE2](./rke2) | Instalasi dan konfigurasi RKE2 (Rancher Kubernetes Engine 2) |

---

## 📊 Monitoring & Observability

| Sub Tema | Deskripsi |
|---|---|
| [Metric dengan Mimir](./monitoring/metric-mimir) | Long-term metric storage dengan Grafana Mimir |
| [Logging dengan Loki](./monitoring/logging-loki) | Centralized logging dengan Grafana Loki |

---

## 🏗️ Infrastruktur

| Sub Tema | Deskripsi |
|---|---|
| [Infrastructure](./infrastructure) | Topologi jaringan 3-layer: DMZ, APP (Kubernetes), dan DB |
| [GitOps](./gitops) | Pengelolaan infrastruktur berbasis Git dengan ArgoCD |
| [Docker Setup](./docker-setup) | Menjalankan layanan dengan Docker dan Docker Compose |