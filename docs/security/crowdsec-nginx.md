---
id: crowdsec-nginx
slug: /security/crowdsec-nginx
title: CrowdSec & Nginx Proxy Manager
---

# Mengamankan Nginx Proxy Manager dengan CrowdSec

Nginx Proxy Manager (NPM) adalah solusi reverse proxy populer berbasis GUI yang memudahkan manajemen SSL dan routing. Namun secara bawaan NPM tidak memiliki proteksi aktif terhadap serangan. Panduan ini menjelaskan cara mengintegrasikan CrowdSec Bouncer ke dalam NPM untuk perlindungan real-time.

---

## Arsitektur Integrasi

```mermaid
flowchart TB
    subgraph Internet["Internet"]
        User["✅ Pengguna"]
        Attacker["⛔ Penyerang"]
    end

    subgraph Stack["Nginx Proxy Manager + CrowdSec"]
        NPM["Nginx Proxy Manager\n(OpenResty / Nginx + Lua)"]
        Bouncer["🛡️ CrowdSec Lua Bouncer\n(Cek setiap request)"]
        Agent["🔍 CrowdSec Agent\n(Analisis log)"]
        LAPI["📡 Local API"]
        Log["📋 NPM Access Logs"]

        NPM --> Bouncer
        NPM --> Log
        Log --> Agent
        Agent --> LAPI
        LAPI --> Bouncer
    end

    Community["🌐 CrowdSec Community"] --> LAPI

    User --> NPM
    Attacker --> NPM

    Bouncer -->|"IP Bersih"| Backend["🏠 Backend Services\n(Home Assistant, Portainer, dll)"]
    Bouncer -->|"IP Terblokir"| Block["⛔ 403 / Captcha"]
```

---

## Alur Verifikasi Request

```mermaid
sequenceDiagram
    participant V as Visitor
    participant N as Nginx Proxy Manager
    participant B as Lua Bouncer
    participant L as CrowdSec LAPI
    participant A as Backend App

    V->>N: HTTP Request
    N->>B: Intercepted by Lua script
    B->>L: GET /v1/decisions?ip=<visitor_ip>

    alt IP Tidak Terblokir
        L->>B: [] (kosong — tidak ada keputusan)
        B->>N: Lanjutkan
        N->>A: Proxy ke backend
        A->>N: Response
        N->>V: 200 OK
    else IP Terblokir / Ban
        L->>B: [{type: "ban", ...}]
        B->>N: Tolak request
        N->>V: 403 Forbidden
    else IP Perlu Captcha
        L->>B: [{type: "captcha", ...}]
        B->>N: Tampilkan captcha
        N->>V: Halaman Captcha
    end
```

---

## Instalasi dan Konfigurasi

### 1. Docker Compose

```yaml
services:
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    ports:
      - "80:80"
      - "443:443"
      - "81:81"   # Admin UI
    volumes:
      - npm_data:/data
      - letsencrypt:/etc/letsencrypt
      # Mount custom OpenResty config untuk CrowdSec Bouncer
      - ./crowdsec-bouncer.conf:/etc/nginx/conf.d/crowdsec-bouncer.conf

  crowdsec:
    image: crowdsecurity/crowdsec:latest
    environment:
      - COLLECTIONS=crowdsecurity/nginx
    volumes:
      - npm_data:/var/log/nginx:ro    # Baca log NPM
      - crowdsec_db:/var/lib/crowdsec/data
      - crowdsec_config:/etc/crowdsec

  crowdsec-nginx-bouncer:
    image: crowdsecurity/nginx-proxy-manager-bouncer:latest
    environment:
      - CROWDSEC_LAPI_URL=http://crowdsec:8080
      - CROWDSEC_LAPI_KEY=${BOUNCER_API_KEY}

volumes:
  npm_data:
  letsencrypt:
  crowdsec_db:
  crowdsec_config:
```

### 2. Daftarkan Bouncer dan Dapatkan API Key

```bash
# Masuk ke container CrowdSec
docker exec -it crowdsec bash

# Daftarkan bouncer baru
cscli bouncers add npm-bouncer

# Salin API key yang dihasilkan ke environment variable BOUNCER_API_KEY
```

---

## Cakupan Perlindungan

| Aspek | Tanpa CrowdSec | Dengan CrowdSec |
|---|---|---|
| SSL Otomatis | ✅ | ✅ |
| Reverse Proxy GUI | ✅ | ✅ |
| Blokir Brute Force | ❌ | ✅ |
| IP Reputation Global | ❌ | ✅ |
| Captcha Challenge | ❌ | ✅ |
| Proteksi Backend | ❌ | ✅ Semua layanan |

---

## Best Practices

- Gunakan koleksi `crowdsecurity/nginx` yang sudah dioptimalkan untuk log format NPM
- Aktifkan **captcha mode** untuk IP mencurigakan (bukan langsung ban) untuk mengurangi false positive
- Monitor dashboard CrowdSec Console secara berkala untuk melihat tren serangan
