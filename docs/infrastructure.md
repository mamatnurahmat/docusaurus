---
id: infrastructure
slug: /infrastructure
title: Infrastructure
---

# Infrastructure

Dokumentasi topologi infrastruktur yang mencakup arsitektur 3 layer: **DMZ** (public), **APP** (private — Kubernetes Cluster), dan **DB** (private).

---

## Topologi Jaringan 3 Layer

Arsitektur ini memisahkan infrastruktur menjadi tiga zona keamanan. Hanya layer **DMZ** yang dapat diakses dari internet publik. Layer **APP** adalah sebuah **Kubernetes Cluster** dengan 2 node (front & back), sementara layer **DB** adalah zona paling terlindungi.

```mermaid
flowchart TB
    Internet(["Internet / Public"])

    subgraph DMZ["DMZ Layer — Public Zone"]
        direction LR
        WAF["WAF\nModSecurity / CrowdSec"]
        LB["Load Balancer\nHAProxy / Nginx"]
        FW1["Firewall In"]
    end

    subgraph APP["APP Layer — Kubernetes Cluster (Private Zone)"]
        direction TB

        subgraph NodeFront["Node: Front"]
            direction TB
            GW["API Gateway\nKrakenD"]
            SM["Service Manager\nIstio / Linkerd"]
        end

        subgraph NodeBack["Node: Back"]
            direction TB
            MOD1["Module: Auth Service"]
            MOD2["Module: Business Service"]
            MOD3["Module: Notification Service"]
        end

        CACHE["Redis Cache"]
        MQ["RabbitMQ\nMessage Broker"]
        MONGO["MongoDB\nDocument Store"]
        FW2["Firewall Out"]

        GW --> SM
        SM -->|"direct"| MOD1
        SM -->|"publish event"| MQ
        MQ -->|"consume event"| MOD2
        MQ -->|"consume event"| MOD3
        MOD1 <--> CACHE
        MOD2 <--> CACHE
        SM <--> CACHE
        MOD1 <--> MONGO
        MOD2 <--> MONGO
        MOD1 --> FW2
        MOD2 --> FW2
        MOD3 --> FW2
    end

    subgraph DB["DB Layer — Private Zone"]
        direction LR
        PRIMARY["DB Primary\nPostgreSQL / MySQL"]
        REPLICA["DB Replica\nRead Only"]
        BACKUP["Backup Storage\nS3 / NFS"]
    end

    Internet -->|"HTTPS :443"| WAF
    WAF --> LB
    LB --> FW1
    FW1 -->|"Internal Traffic"| GW

    FW2 -->|"DB Port :5432"| PRIMARY
    PRIMARY -->|"Replication"| REPLICA
    PRIMARY -->|"Backup"| BACKUP

    classDef dmzStyle fill:#fff3e0,stroke:#e65100,color:#000
    classDef frontStyle fill:#e8eaf6,stroke:#3949ab,color:#000
    classDef backStyle fill:#f3e5f5,stroke:#6a1b9a,color:#000
    classDef dbStyle fill:#e8f5e9,stroke:#1b5e20,color:#000
    classDef inetStyle fill:#e3f2fd,stroke:#0d47a1,color:#000
    classDef cacheStyle fill:#fce4ec,stroke:#c62828,color:#000
    classDef mqStyle fill:#fff8e1,stroke:#f57f17,color:#000
    classDef mongoStyle fill:#e0f7fa,stroke:#00695c,color:#000

    class WAF,LB,FW1 dmzStyle
    class GW,SM frontStyle
    class MOD1,MOD2,MOD3,FW2 backStyle
    class PRIMARY,REPLICA,BACKUP dbStyle
    class Internet inetStyle
    class CACHE cacheStyle
    class MQ mqStyle
    class MONGO mongoStyle
```

---

## Penjelasan Setiap Layer

### 🟠 DMZ Layer (Public Zone)
Layer ini adalah satu-satunya zona yang dapat diakses langsung dari internet. Berfungsi sebagai gerbang pertahanan pertama.

| Komponen | Fungsi |
|---|---|
| **WAF** | Memblokir serangan (SQLi, XSS, DDoS) menggunakan ModSecurity atau CrowdSec |
| **Load Balancer** | Mendistribusikan traffic ke Kubernetes cluster (HAProxy / Nginx) |
| **Firewall (In)** | Hanya mengizinkan traffic tervalidasi menuju APP Layer |

### 🟣 APP Layer — Kubernetes Cluster (Private Zone)
Layer ini adalah sebuah **Kubernetes Cluster** dengan dua node yang memiliki peran berbeda.

#### Node: Front
| Komponen | Fungsi |
|---|---|
| **API Gateway** | Pintu masuk tunggal (*single entry point*) untuk semua request — routing, auth, rate limiting. Menggunakan **KrakenD** |
| **Service Manager** | Mengatur komunikasi antar service (service mesh: Istio / Linkerd) |

#### Node: Back
| Komponen | Fungsi |
|---|---|
| **Module: Auth Service** | Mengelola autentikasi dan otorisasi pengguna |
| **Module: Business Service** | Logika bisnis utama aplikasi |
| **Module: Notification Service** | Mengirim notifikasi (email, push, SMS) |
| **RabbitMQ** | Message broker untuk komunikasi asinkron antar service (event-driven) |
| **MongoDB** | Document store untuk menyimpan data tidak terstruktur / semi-terstruktur |
| **Redis Cache** | Session, cache response, dan data sementara — digunakan oleh Service Manager, Auth Service, dan Business Service |
| **Firewall (Out)** | Membatasi koneksi keluar hanya ke port DB yang diizinkan |

### 🟢 DB Layer (Private Zone)
Layer paling dalam dan paling terlindungi. Tidak memiliki akses ke internet sama sekali.

| Komponen | Fungsi |
|---|---|
| **DB Primary** | Database utama untuk operasi baca dan tulis |
| **DB Replica** | Database replika hanya-baca untuk query report / analytics |
| **Backup Storage** | Penyimpanan backup otomatis ke S3 atau NFS |

---

## Aturan Akses Antar Layer

```mermaid
flowchart LR
    I(["Internet"]) -->|"HTTPS :443"| DMZ

    DMZ -->|"Internal :8080"| APP
    DMZ -->|"DIBLOKIR"| DB

    APP -->|"DB Port :5432"| DB
    APP -->|"DIBLOKIR"| I

    DB -->|"DIBLOKIR"| I
    DB -->|"DIBLOKIR"| DMZ

    style DMZ fill:#fff3e0,stroke:#e65100
    style APP fill:#f3e5f5,stroke:#6a1b9a
    style DB fill:#e8f5e9,stroke:#1b5e20
    style I fill:#e3f2fd,stroke:#0d47a1
```

---

## Prinsip Keamanan

- **Zero Trust**: Setiap koneksi antar layer diverifikasi dan difilter.
- **Least Privilege**: Setiap komponen hanya memiliki akses minimal yang dibutuhkan.
- **Defense in Depth**: Serangan harus menembus lebih dari satu lapisan pertahanan untuk mencapai data.
- **Segmentation**: Setiap layer berada di subnet/VLAN yang berbeda.
