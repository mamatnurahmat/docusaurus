---
id: security
slug: /security
title: Security
---

# Security

Dokumentasi ini membahas strategi **pertahanan berlapis (*Defense in Depth*)** untuk melindungi infrastruktur dan aplikasi web dari berbagai ancaman siber.

---

## Arsitektur Pertahanan Berlapis

```mermaid
flowchart LR
    Internet([🌐 Internet]) --> L1

    subgraph Defense["Arsitektur Pertahanan"]
        L1["🛡️ Layer 1\nCrowdSec\n(IP Reputation)"]
        L2["🔍 Layer 2\nWAF + ModSecurity\n(Payload Inspection)"]
        L3["🔒 Layer 3\nReverse Proxy\nNginx / HAProxy"]
        L4["✅ Application\nBackend Services"]
        L1 --> L2 --> L3 --> L4
    end

    L1 -->|"IP Jahat"| B1["⛔ Blocked"]
    L2 -->|"Payload Berbahaya"| B2["⛔ Blocked"]
```

---

## 📖 Sub Tema

| Sub Tema | Deskripsi |
|---|---|
| [WAF dengan HAProxy & ModSecurity](./security/waf-haproxy-modsecurity) | Membangun Web Application Firewall dengan HAProxy, ModSecurity SPOA, dan OWASP CRS |
| [CrowdSec & HAProxy](./security/crowdsec-haproxy) | Integrasi CrowdSec sebagai threat intelligence layer di HAProxy |
| [CrowdSec & Nginx Proxy Manager](./security/crowdsec-nginx) | Mengamankan Nginx Proxy Manager dengan CrowdSec Bouncer |
