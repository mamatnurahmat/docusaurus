---
title: "Monitoring Metrik Berskala Besar dengan Grafana Mimir: Long-term Storage untuk Prometheus"
authors: [mamat]
tags: [monitoring, devops]
date: 2024-01-01
---

![Grafana Mimir Monitoring Banner](/img/blog/mimir-monitoring.png)

Prometheus merupakan standar de facto untuk pengumpulan dan penyimpanan metrik dalam ekosistem cloud-native. Namun, seiring pertumbuhan infrastruktur, Prometheus menghadapi keterbatasan dalam hal kapasitas penyimpanan jangka panjang dan skalabilitas horizontal. **Grafana Mimir** hadir sebagai solusi *long-term metric storage* yang dirancang untuk mengatasi keterbatasan tersebut.

Artikel ini membahas arsitektur, keunggulan, dan alasan mengapa Mimir merupakan komplemen yang ideal untuk deployment Prometheus berskala besar.

<!--truncate-->

## Apa Itu Grafana Mimir?

Grafana Mimir adalah sistem penyimpanan metrik jangka panjang (*long-term storage*) yang dirancang khusus untuk skalabilitas tinggi dan ketersediaan tinggi (*high availability*). Jika Prometheus berperan sebagai pengumpul dan penyimpan metrik jangka pendek, Mimir berperan sebagai penyimpan metrik jangka panjang yang mampu menampung data dari ratusan hingga ribuan instance Prometheus.

## Arsitektur Grafana Mimir

```mermaid
flowchart TB
    subgraph Prometheus["Prometheus Instances"]
        P1["Prometheus\nCluster A"]
        P2["Prometheus\nCluster B"]
        P3["Prometheus\nCluster C"]
    end

    P1 & P2 & P3 -->|Remote Write| Mimir

    subgraph Mimir["Grafana Mimir"]
        direction TB
        Dist["Distributor\n(Menerima & validasi data)"]
        Ing["Ingester\n(Buffer & batch write)"]
        Store["Store Gateway\n(Query historical data)"]
        Compact["Compactor\n(Optimasi storage)"]
        Query["Querier\n(Eksekusi PromQL)"]
        QFront["Query Frontend\n(Caching & splitting)"]

        Dist --> Ing
        Ing --> ObjStore
        Store --> ObjStore
        Compact --> ObjStore
        QFront --> Query
        Query --> Ing
        Query --> Store
    end

    ObjStore[("☁️ Object Storage\n(S3 / GCS / MinIO)")]

    Grafana["📈 Grafana Dashboard"] --> QFront

    style Prometheus fill:#e74c3c,stroke:#c0392b,color:#fff
    style Mimir fill:#0d1117,stroke:#30363d,color:#e6edf3
    style ObjStore fill:#4a90d9,stroke:#2c5f8a,color:#fff
    style Grafana fill:#f39c12,stroke:#d68910,color:#fff
```

## Mengapa Mimir Diperlukan?

### Keterbatasan Prometheus

| Aspek | Prometheus | Grafana Mimir |
|---|---|---|
| **Skalabilitas** | Vertikal (single node) | Horizontal (multi-node) |
| **Retensi Data** | Terbatas (minggu/bulan) | Tidak terbatas (tahun) |
| **High Availability** | Memerlukan konfigurasi tambahan | Bawaan (*built-in*) |
| **Multi-tenancy** | ❌ Tidak didukung | ✅ Didukung secara native |
| **Global View** | Terbatas pada satu instance | Agregasi dari seluruh instance |
| **Storage Backend** | Local disk | Object storage (S3/GCS/MinIO) |

### Keunggulan Utama Mimir

1. **Skalabilitas Horizontal** — Mampu menangani jutaan metrik aktif (*active series*) melalui arsitektur microservice yang dapat di-*scale* secara independen per komponen.

2. **High Availability** — Data direplikasi secara otomatis sehingga tidak ada *single point of failure*. Kegagalan pada satu node tidak akan menyebabkan kehilangan data.

3. **Multi-tenancy** — Mendukung pemisahan data antar tim, proyek, atau kluster dalam satu deployment Mimir. Setiap tenant memiliki isolasi data yang ketat.

4. **Performa Query yang Tinggi** — Meskipun data telah tersimpan dalam jangka waktu yang lama, query tetap dapat dieksekusi dengan cepat berkat mekanisme *query splitting*, *caching*, dan *parallel execution*.

## Alur Data

```mermaid
sequenceDiagram
    participant P as Prometheus
    participant D as Distributor
    participant I as Ingester
    participant S as Object Storage
    participant Q as Querier
    participant G as Grafana

    P->>D: Remote write (metrik terbaru)
    D->>D: Validasi & rate limiting
    D->>I: Distribusi ke ingester
    I->>I: Buffer di memori
    I->>S: Flush ke object storage (periodik)

    G->>Q: PromQL query
    
    alt Data Terbaru (< 2 jam)
        Q->>I: Query dari ingester
        I->>Q: Return data
    else Data Historis
        Q->>S: Query dari object storage
        S->>Q: Return data
    end
    
    Q->>G: Return query result
```

## Komponen Mimir

```mermaid
graph TB
    subgraph Write["Write Path"]
        D["📥 Distributor\nMenerima data dari Prometheus\nvia remote write API"]
        I["💾 Ingester\nMenyimpan data di memori\nsebelum flush ke storage"]
    end

    subgraph Read["Read Path"]
        QF["🔄 Query Frontend\nCaching, splitting &\nretry queries"]
        Q["🔍 Querier\nMenggabungkan data dari\ningester & storage"]
        SG["📦 Store Gateway\nMembaca data historis\ndari object storage"]
    end

    subgraph Backend["Backend"]
        C["🗜️ Compactor\nMenggabungkan block data\nuntuk optimasi storage"]
        OS[("☁️ Object Storage")]
    end

    D --> I
    I --> OS
    QF --> Q
    Q --> I
    Q --> SG
    SG --> OS
    C --> OS

    style Write fill:#238636,stroke:#2ea043,color:#fff
    style Read fill:#1f6feb,stroke:#388bfd,color:#fff
    style Backend fill:#6e40c9,stroke:#8957e5,color:#fff
```

## Kapan Mengadopsi Mimir?

| Kondisi | Rekomendasi |
|---|---|
| Infrastruktur kecil, satu kluster | Prometheus sudah memadai |
| Butuh retensi data > 3 bulan | ✅ Pertimbangkan Mimir |
| Multi-cluster Kubernetes | ✅ Sangat direkomendasikan |
| Kebutuhan multi-tenancy | ✅ Wajib menggunakan Mimir |
| Metrik aktif > 1 juta series | ✅ Sangat direkomendasikan |

## Kesimpulan

Grafana Mimir merupakan solusi yang tepat bagi organisasi yang membutuhkan penyimpanan metrik berskala besar dengan retensi jangka panjang. Dengan arsitektur microservice yang dapat di-*scale* secara horizontal, dukungan multi-tenancy, dan integrasi seamless dengan ekosistem Grafana, Mimir menjadi komplemen yang ideal untuk deployment Prometheus di lingkungan produksi.

:::tip Rekomendasi
Untuk memulai, Grafana Mimir dapat dijalankan dalam mode **monolithic** yang lebih sederhana untuk infrastruktur kecil, kemudian dimigrasikan ke mode **microservice** seiring dengan pertumbuhan kebutuhan.
:::
