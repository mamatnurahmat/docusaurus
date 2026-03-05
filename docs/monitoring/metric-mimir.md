---
id: metric-mimir
slug: /monitoring/metric-mimir
title: Metric dengan Mimir
---

# Metric dengan Mimir

**Grafana Mimir** adalah backend time-series database yang kompatibel dengan Prometheus, dirancang untuk skala besar (multi-tenant, highly available). Mimir menyimpan metric yang dikumpulkan oleh Prometheus/Grafana Agent dan menyediakan query engine PromQL yang sangat cepat.

---

## Konsep Dasar Mimir

| Komponen | Fungsi |
|---|---|
| **Grafana Agent / Prometheus** | Mengumpulkan metric dari aplikasi/infrastruktur (scraping) |
| **Mimir** | Menerima, menyimpan, dan melayani query metric jangka panjang |
| **Grafana** | Antarmuka dashboard menggunakan PromQL |

**Keunggulan Mimir dibanding Prometheus standalone**:
- **Multi-tenant**: Satu cluster bisa melayani banyak tim
- **Horizontal scaling**: Setiap komponen bisa di-scale secara independen
- **Long-term storage**: Data metric disimpan di object storage (S3/GCS), tidak di disk lokal
- **High availability**: Tidak ada single point of failure

---

## Diagram Topologi Metric Stack

```mermaid
flowchart TB
    subgraph Sources["Metric Sources"]
        direction LR
        APP1["Auth Service\n/metrics endpoint"]
        APP2["Business Service\n/metrics endpoint"]
        K8S["Kubernetes\nkube-state-metrics"]
        NODE["Node Exporter\nHardware metrics"]
    end

    subgraph Collector["Metric Collector"]
        AGENT["Grafana Agent / Prometheus\n(scrape interval: 15s)"]
    end

    subgraph MimirStack["Mimir Stack"]
        direction TB
        DIST2["Distributor\nTerima dan validasi series"]
        ING2["Ingester\nBuffer metric di memory"]
        COMP["Compactor\nKompres dan merge blok lama"]
        QF2["Query Frontend\nSplit, cache, retry queries"]
        QR2["Querier\nEksekusi PromQL"]
        RULER["Ruler\nEvaluasi alerting rules"]
        STORE2[("Object Storage\nS3 / MinIO\n(TSDB blocks)")]
    end

    subgraph Visualization["Visualization & Alerting"]
        GRAF2["Grafana\nDashboard / Explore"]
        AM["Alert Manager\nRouting notifikasi"]
        SLACK["Slack / Email\nPagerDuty"]
    end

    APP1 -->|"scrape /metrics"| AGENT
    APP2 -->|"scrape /metrics"| AGENT
    K8S -->|"scrape /metrics"| AGENT
    NODE -->|"scrape /metrics"| AGENT

    AGENT -->|"Remote Write\n(snappy compressed)"| DIST2
    DIST2 --> ING2
    ING2 -->|"Upload blocks"| STORE2
    COMP -->|"Compact old blocks"| STORE2

    GRAF2 -->|"PromQL Query"| QF2
    QF2 --> QR2
    QR2 --> STORE2
    QR2 --> ING2
    RULER -->|"Evaluate rules"| QR2
    RULER -->|"Fire alerts"| AM
    AM -->|"Notify"| SLACK

    classDef sourceStyle fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef agentStyle fill:#fff8e1,stroke:#f57f17,color:#000
    classDef mimirStyle fill:#fbe9e7,stroke:#bf360c,color:#000
    classDef storeStyle fill:#e8f5e9,stroke:#1b5e20,color:#000
    classDef vizStyle fill:#f3e5f5,stroke:#6a1b9a,color:#000
    classDef alertStyle fill:#ffebee,stroke:#c62828,color:#000

    class APP1,APP2,K8S,NODE sourceStyle
    class AGENT agentStyle
    class DIST2,ING2,COMP,QF2,QR2,RULER mimirStyle
    class STORE2 storeStyle
    class GRAF2 vizStyle
    class AM,SLACK alertStyle
```

---

## Diagram Alur Alert (dari Metric ke Notifikasi)

```mermaid
sequenceDiagram
    participant App as Application
    participant Agent as Grafana Agent
    participant Mimir
    participant Ruler
    participant AM as Alert Manager
    participant Slack

    App->>Agent: Expose /metrics endpoint
    Agent->>Mimir: Remote Write metric tiap 15s

    loop Setiap interval evaluasi (1m)
        Ruler->>Mimir: Query PromQL rule
        Note over Ruler,Mimir: up{job="auth-service"} == 0
        Mimir-->>Ruler: Return hasil
        Ruler->>Ruler: Evaluasi kondisi alert
    end

    Ruler->>AM: Kirim alert (FIRING)
    AM->>AM: Terapkan routing rules
    AM->>Slack: Kirim notifikasi
    Note over AM,Slack: #alert-channel: Auth Service DOWN!
```

---

## Contoh Query PromQL

```promql
# CPU usage per pod
rate(container_cpu_usage_seconds_total{namespace="production"}[5m])

# Memory usage
container_memory_usage_bytes{app="auth-service"} / 1024 / 1024

# Request rate per service
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)

# Uptime check
up{job="auth-service"} == 0
```

---

## Integrasi dengan Infrastruktur

```mermaid
flowchart LR
    subgraph K8sCluster["Kubernetes Cluster (APP Layer)"]
        AGENT2["Grafana Agent\nDaemonSet"]
        APPS["Auth / Business /\nNotification Services"]
    end

    subgraph MonitoringStack["Monitoring Stack"]
        MIMIR["Grafana Mimir"]
        LOKI["Grafana Loki"]
        GRAF3["Grafana Dashboard"]
    end

    APPS -->|"metrics"| AGENT2
    APPS -->|"logs"| AGENT2
    AGENT2 -->|"remote_write"| MIMIR
    AGENT2 -->|"push logs"| LOKI
    MIMIR --> GRAF3
    LOKI --> GRAF3

    style K8sCluster fill:#f3e5f5,stroke:#6a1b9a
    style MonitoringStack fill:#e8f5e9,stroke:#1b5e20
```

---

## Best Practices

- Gunakan **recording rules** untuk query PromQL yang berat agar tidak dijalankan real-time
- Atur **retention** di object storage sesuai kebutuhan (misalnya 90 hari)
- Gunakan **Grafana Agent** daripada Prometheus jika sudah menggunakan Mimir dan Loki — satu agent untuk keduanya
- Pisahkan **alerting rules** antara tim (misal: tim infra vs tim aplikasi) menggunakan namespace di Ruler
