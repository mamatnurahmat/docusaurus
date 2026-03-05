---
id: logging-loki
slug: /monitoring/logging-loki
title: Logging dengan Loki
---

# Logging dengan Loki

**Grafana Loki** adalah sistem agregasi log yang didesain seperti Prometheus, namun untuk log. Loki tidak mengindeks isi log (seperti Elasticsearch), melainkan hanya mengindeks label/metadata-nya — sehingga jauh lebih hemat storage dan lebih cepat di-query.

---

## Konsep Dasar Loki

| Komponen | Fungsi |
|---|---|
| **Promtail / Alloy** | Agent yang mengumpulkan log dari file/container dan mengirimnya ke Loki |
| **Loki** | Server penyimpanan dan query log |
| **Grafana** | Antarmuka untuk memvisualisasikan log (menggunakan LogQL) |

**Prinsip utama**:
- Log disimpan dalam bentuk **stream** yang diidentifikasi oleh sekumpulan **label** (misalnya `app=auth-service, env=production`)
- Isi log **tidak diindeks**, hanya labelnya — sehingga ingestion sangat cepat
- Query menggunakan **LogQL**, sintaksnya mirip PromQL

---

## Diagram Topologi Logging Stack

```mermaid
flowchart TB
    subgraph Sources["Log Sources"]
        direction LR
        APP1["Auth Service\nPod"]
        APP2["Business Service\nPod"]
        APP3["Notification Service\nPod"]
        SYS["System / Node Logs"]
    end

    subgraph Collector["Log Collector"]
        AGENT["Promtail / Grafana Alloy\n(DaemonSet di setiap Node)"]
    end

    subgraph LokiStack["Loki Stack"]
        direction TB
        DIST["Distributor\nTerima dan validasi log stream"]
        ING["Ingester\nBuffer log di memory"]
        QF["Query Frontend\nSplit and cache queries"]
        QR["Querier\nEksekusi LogQL"]
        STORE[("Object Storage\nS3 / MinIO\n(Log chunks)")]
        IDX[("Index Store\nDynamoDB / BoltDB\n(Label index)")]
    end

    subgraph Visualization["Visualization"]
        GRAF["Grafana\nExplore / Dashboard"]
        ALERT["Grafana Alert Manager"]
    end

    APP1 -->|"stdout / file"| AGENT
    APP2 -->|"stdout / file"| AGENT
    APP3 -->|"stdout / file"| AGENT
    SYS -->|"/var/log"| AGENT

    AGENT -->|"Push log stream\nHTTP /loki/api/v1/push"| DIST
    DIST --> ING
    ING -->|"Flush chunks"| STORE
    ING -->|"Write index"| IDX

    GRAF -->|"LogQL Query"| QF
    QF --> QR
    QR --> STORE
    QR --> IDX
    QF --> ALERT

    classDef sourceStyle fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef agentStyle fill:#fff8e1,stroke:#f57f17,color:#000
    classDef lokiStyle fill:#fce4ec,stroke:#c62828,color:#000
    classDef storeStyle fill:#e8f5e9,stroke:#1b5e20,color:#000
    classDef vizStyle fill:#f3e5f5,stroke:#6a1b9a,color:#000

    class APP1,APP2,APP3,SYS sourceStyle
    class AGENT agentStyle
    class DIST,ING,QF,QR lokiStyle
    class STORE,IDX storeStyle
    class GRAF,ALERT vizStyle
```

---

## Diagram Alur Query LogQL

```mermaid
sequenceDiagram
    participant User as Developer / SRE
    participant Grafana
    participant QF as Query Frontend
    participant Querier
    participant Storage as Object Storage

    User->>Grafana: Masukkan LogQL query
    Note over User,Grafana: {app="auth-service"} |= "ERROR"

    Grafana->>QF: Kirim query
    QF->>QF: Split query per rentang waktu
    QF->>Querier: Jalankan sub-query
    Querier->>Storage: Fetch log chunks
    Storage-->>Querier: Return chunks
    Querier-->>QF: Return hasil
    QF-->>Grafana: Gabungkan hasil
    Grafana-->>User: Tampilkan log stream
```

---

## Contoh Query LogQL

```logql
# Tampilkan semua log error dari auth-service
{app="auth-service", env="production"} |= "ERROR"

# Hitung rate error per menit
rate({app="auth-service"} |= "ERROR" [1m])

# Parse log JSON dan filter field tertentu
{app="business-service"} | json | status_code >= 500
```

---

## Best Practices

- Gunakan **label yang konsisten** dan tidak terlalu banyak (hindari high-cardinality label seperti `user_id` atau `request_id`)
- Deploy Promtail sebagai **DaemonSet** agar semua pod di setiap node ter-cover
- Atur **retention policy** di object storage (misalnya log lebih dari 30 hari dihapus)
- Gunakan **chunk encoding** (snappy) untuk efisiensi storage
