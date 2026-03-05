---
id: gitops
slug: /gitops
title: GitOps
---

# GitOps

GitOps adalah pendekatan DevOps yang menggunakan Git sebagai sumber kebenaran (*single source of truth*) untuk deployment dan operasi infrastruktur.

## Konsep Dasar GitOps

Prinsip utama GitOps:
- **Deklaratif**: Seluruh state sistem didefinisikan secara deklaratif (YAML/Helm Chart).
- **Versioned**: State tersimpan di Git, sehingga setiap perubahan tercatat dan bisa di-rollback.
- **Automatik**: Perubahan di Git secara otomatis direkonsiliasi ke cluster oleh operator seperti ArgoCD.
- **Continuous Reconciliation**: Operator terus-menerus memastikan state aktual sesuai dengan state yang diinginkan di Git.

---

## Diagram Alur GitOps (Push vs Pull)

Berbeda dengan CI/CD tradisional yang **mendorong (push)** artifact ke cluster, GitOps menggunakan model **tarik (pull)** di mana operator di dalam cluster lah yang mengambil perubahan dari Git.

```mermaid
flowchart TD
    subgraph Developer["Developer"]
        A[Tulis Kode / Update Config]
    end

    subgraph GitRepo["Git Repository"]
        B[App Source Code]
        C[Kubernetes Manifests / Helm Charts]
    end

    subgraph CI["CI Pipeline - GitHub Actions / Jenkins"]
        D[Build and Test]
        E[Build Docker Image]
        F[Push ke Container Registry]
        G[Update image tag di Git Manifests]
    end

    subgraph Cluster["Kubernetes Cluster"]
        H[ArgoCD / Flux Operator]
        I[Deployment]
        J[Service]
        K[ConfigMap / Secret]
    end

    A -->|git push| B
    B --> D
    D --> E
    E --> F
    F --> G
    G -->|update manifest| C

    C -->|Pull and Watch| H
    H -->|Reconcile| I
    H -->|Reconcile| J
    H -->|Reconcile| K

    classDef gitStyle fill:#f5f5f5,stroke:#333
    classDef ciStyle fill:#e3f2fd,stroke:#1565c0
    classDef clusterStyle fill:#e8f5e9,stroke:#2e7d32
    classDef devStyle fill:#fff8e1,stroke:#f57f17

    class A devStyle
    class B,C gitStyle
    class D,E,F,G ciStyle
    class H,I,J,K clusterStyle
```

---

## Diagram Cara Kerja ArgoCD

ArgoCD adalah salah satu tools GitOps paling populer. Ia berjalan **di dalam cluster** dan secara aktif membandingkan state Git vs state aktual cluster.

```mermaid
flowchart LR
    subgraph Git["Git Repository"]
        M[Kubernetes Manifests]
    end

    subgraph ArgoCD["ArgoCD"]
        direction TB
        R[Repo Server]
        AP[Application Controller]
        API[API Server]
    end

    subgraph Cluster["Kubernetes"]
        D1[Deployment]
        D2[Service]
        D3[Ingress]
    end

    M -->|Watch / Polling| R
    R --> AP
    AP -->|Apply Manifests| D1
    AP -->|Apply Manifests| D2
    AP -->|Apply Manifests| D3
    API -->|Kontrol Manual| AP

    classDef gitStyle fill:#f5f5f5,stroke:#555
    classDef argoStyle fill:#fce4ec,stroke:#c62828
    classDef k8sStyle fill:#e8f5e9,stroke:#1b5e20

    class M gitStyle
    class R,AP,API argoStyle
    class D1,D2,D3 k8sStyle
```

---

## Status Sinkronisasi ArgoCD

ArgoCD memiliki dua kondisi yang terus dipantau:

```mermaid
stateDiagram-v2
    [*] --> Synced : Manifest Git sama dengan State Cluster

    Synced --> OutOfSync : Ada perubahan di Git
    OutOfSync --> Syncing : Auto-sync atau Manual sync
    Syncing --> Synced : Berhasil direkonsiliasi
    Syncing --> Degraded : Gagal apply manifest

    Degraded --> OutOfSync : Retry
    Degraded --> [*] : Perlu intervensi manual
```

---

## Tools GitOps Populer

| Tools | Keterangan |
|---|---|
| **ArgoCD** | GitOps operator berbasis UI, sangat populer untuk Kubernetes |
| **Flux CD** | GitOps toolkit berbasis CLI, native controller |
| **Rancher Fleet** | GitOps untuk multi-cluster bawaan Rancher |
| **Jenkins X** | CI/CD dan GitOps khusus untuk cloud-native apps |