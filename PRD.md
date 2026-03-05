# PRD — DevOps Documentation Portal

**Version:** 1.0  
**Date:** 2026-03-05  
**Owner:** mamatnurahmat  
**Status:** Active / In Development

---

## 1. Ringkasan Eksekutif (TL;DR)

Proyek ini adalah **portal dokumentasi internal** berbasis web yang berfungsi sebagai dua hal sekaligus:

1. **Knowledge base** — tempat menyimpan panduan teknis tentang infrastruktur, CI/CD, GitOps, dan monitoring
2. **Deployment dashboard** — tampilan real-time status service yang berjalan di Kubernetes cluster (production)

Portal ini dibangun di atas **Docusaurus** (framework dokumentasi open-source dari Meta), di-deploy otomatis ke GitHub Pages setiap kali ada perubahan kode.

---

## 2. Latar Belakang & Masalah yang Dipecahkan

### Masalah Sebelumnya
- Dokumentasi teknis tersebar di banyak tempat (Notion, Wiki, Confluence, dsb.)
- Tidak ada satu tempat untuk melihat status semua service production
- Tim baru sulit memahami arsitektur sistem
- Tidak ada standarisasi format dokumentasi

### Solusi
Satu portal tunggal yang:
- Menyatukan semua dokumentasi teknis
- Menampilkan status deployment secara visual
- Otomatis diperbarui via CI/CD pipeline

---

## 3. Pengguna & Pemangku Kepentingan

| Pengguna | Kebutuhan |
|---|---|
| **DevOps Engineer** | Lihat status service, cek deployment, dokumen infrastruktur |
| **Backend Developer** | Cari dokumentasi API gateway, service catalog, panduan deploy |
| **Engineering Manager** | Monitoring keseluruhan health system production |
| **Tim Baru (Onboarding)** | Pelajari arsitektur, tooling, dan proses kerja tim |

---

## 4. Fitur Utama

### 4.1 Home Page — Deployment Dashboard

**Apa ini?**  
Halaman utama menampilkan dashboard otomatis yang merangkum kondisi semua service production.

**Yang ditampilkan:**
- **Stat Cards Global:** Total Services, Running, Stopped, Total Replicas, Jumlah Namespace
- **Per-Namespace Cards:** Uptime rate (%), breakdown front/back node, language distribution
- **Language Distribution:** Jumlah service per bahasa pemrograman (GO, DOTNET, dll)

**Cara kerja teknis:**  
Dashboard fetch data langsung dari file `.json` statis di folder `static/data/deploy/`. Data dibaca di browser, tidak perlu backend.

---

### 4.2 Dynamic Deployment Table (`/deploy-table`)

**Apa ini?**  
Halaman tabel interaktif yang menampilkan detail setiap service deployment dalam bentuk tabel yang bisa difilter dan diurutkan.

**Fitur:**
- **Tab dinamis** — setiap namespace/environment punya tab sendiri
- **Search / Filter** — ketik nama service, image, namespace untuk menyaring baris
- **Sort** — klik header kolom untuk mengurutkan naik/turun
- **Kolom:** Manifest, Image, Node Type, Replicas, Port, Port2, Helm, Language, Namespace

**Cara menambah namespace baru:**  
1. Taruh file JSON baru di `static/data/deploy/namafile.json`
2. Tambahkan entri ke `static/data/deploy/manifest.json`
3. Tab baru muncul otomatis — tanpa ubah kode

**Data saat ini:**

| Namespace | File | Jumlah Service |
|---|---|---|
| production-saas | `production-saas.json` | 41 service |
| production-qoinhub | `production-qoinhub.json` | 73 service |

---

### 4.3 Dokumentasi Teknis (Sidebar)

Konten dokumentasi diorganisir dalam kategori-kategori:

#### 📦 CI/CD
- Penjelasan konsep CI/CD
- Contoh pipeline Jenkins & GitHub Actions
- Diagram alur build → test → deploy

#### 🔄 GitOps
- Konsep GitOps (Push vs Pull model)
- Cara kerja ArgoCD
- State machine sinkronisasi ArgoCD

#### 🏗️ Infrastructure
- Topologi jaringan 3 layer: DMZ → APP → DB
- Detail Kubernetes Cluster (Front nodes: KrakenD API Gateway; Back nodes: Auth, Business, Notification)
- Komponen shared: RabbitMQ, MongoDB, Redis

#### 📊 Monitoring
- **Logging (Loki):** Arsitektur Loki, alur log collection, contoh query LogQL
- **Metrics (Mimir):** Arsitektur Mimir, alerting flow, contoh query PromQL, integrasi Grafana

---

### 4.4 CI/CD Pipeline — Auto Deploy

**Apa ini?**  
Setiap kali ada perubahan yang di-push ke branch `main`, GitHub Actions otomatis membangun dan men-deploy situs ke GitHub Pages.

**Alur deploy:**
```
Developer push ke main
    → GitHub Actions trigger
    → Build Docker (make build)
    → Salin README ke build output
    → Deploy ke repo mamatnurahmat.github.io (branch master)
    → Situs live di https://mamatnurahmat.github.io/
```

**Secret yang dibutuhkan:**
- `DEPLOY_TOKEN` — GitHub Personal Access Token dengan scope `workflow` dan `repo`

---

## 5. Arsitektur Teknis

### Stack Teknologi

| Layer | Teknologi | Fungsi |
|---|---|---|
| **Framework** | Docusaurus v3 (React) | Rendering halaman & dokumentasi |
| **Bahasa** | TypeScript, TSX | Komponen & konfigurasi |
| **Styling** | CSS Modules + Docusaurus variables | Tampilan responsif & dark mode |
| **Data** | Static JSON files | Sumber data deployment |
| **Diagram** | Mermaid.js | Diagram arsitektur dalam Markdown |
| **Dev Environment** | Docker + Docker Compose | Isolasi lingkungan pengembangan |
| **CI/CD** | GitHub Actions | Otomasi build & deploy |
| **Hosting** | GitHub Pages | Hosting statis gratis |

### Struktur Direktori Penting

```
docusaurus/
├── docs/                        # Konten dokumentasi Markdown
│   ├── cicd.md                  # Panduan CI/CD
│   ├── gitops.md                # Panduan GitOps
│   ├── infrastructure.md        # Topologi infrastruktur
│   └── monitoring/
│       ├── logging-loki.md      # Dokumentasi Loki
│       └── metric-mimir.md      # Dokumentasi Mimir
├── src/
│   ├── pages/
│   │   ├── index.tsx            # Home page + dashboard
│   │   └── deploy-table.tsx     # Halaman tabel dinamis
│   └── components/
│       └── DeployDashboard/     # Komponen dashboard
├── static/
│   └── data/
│       └── deploy/
│           ├── manifest.json    # ← Daftar semua namespace
│           ├── production-saas.json
│           └── production-qoinhub.json
├── .github/workflows/
│   └── deploy.yml               # CI/CD pipeline
└── docusaurus.config.ts         # Konfigurasi utama
```

---

## 6. Format Data JSON Deployment

Setiap file JSON di `static/data/deploy/` berisi array objek dengan struktur berikut:

```json
{
  "id": "base64-encoded-id",
  "manifest": "nama-service",
  "replicas": 2,
  "image": "registry/image:version",
  "nodetype": "front | back",
  "port": 8080,
  "port2": null,
  "helm": "nama-helm-chart | null",
  "language": "GO | DOTNET",
  "ns": "nama-namespace"
}
```

**Aturan bisnis:**
- `replicas > 0` → service dianggap **Running** (badge hijau)
- `replicas = 0` → service dianggap **Stopped** (badge merah)
- `nodetype: "front"` → menghadap ke API Gateway (badge biru)
- `nodetype: "back"` → internal service (badge ungu)

---

## 7. Format Manifest JSON

File `static/data/deploy/manifest.json` mengontrol tab apa yang muncul di halaman `/deploy-table`:

```json
[
  {
    "slug": "production-saas",       // ID unik (digunakan di URL)
    "label": "Production SaaS",      // Nama yang tampil di tab
    "file": "/data/deploy/production-saas.json"  // Path ke file data
  }
]
```

---

## 8. Cara Menjalankan Secara Lokal

### Prasyarat
- Docker & Docker Compose terinstall
- Git

### Langkah

```bash
# Clone repository
git clone https://github.com/mamatnurahmat/docusaurus.git
cd docusaurus

# Jalankan development server
make dev

# Buka di browser
# http://localhost:3000
```

### Perintah Lainnya

```bash
make build    # Build production bundle
make stop     # Stop container
```

---

## 9. Cara Menambah/Mengubah Konten

### Tambah Halaman Dokumentasi Baru
1. Buat file `.md` di folder `docs/`
2. Tambahkan entry ke sidebar di `src/utils/sidebarConfig.ts`

### Tambah Data Deployment Baru
1. Taruh file `.json` di `static/data/deploy/`
2. Tambahkan entri di `static/data/deploy/manifest.json`
3. Tab otomatis muncul di `/deploy-table` dan kartu baru muncul di dashboard

### Update Dokumentasi yang Ada
Edit file `.md` yang sesuai di folder `docs/`. Perubahan langsung terlihat di dev server.

---

## 10. Batasan Saat Ini & Rencana Pengembangan

### Batasan
- Data deployment **tidak real-time** — harus update file JSON secara manual atau via CI/CD
- Tidak ada **autentikasi** — semua konten bisa diakses publik
- Navbar tidak 100% dinamis — `manifest.json` harus diupdate manual

### Rencana Pengembangan (Backlog)

| Fitur | Prioritas | Deskripsi |
|---|---|---|
| Auto-sync dari Kubernetes API | Tinggi | Script yang generate JSON dari `kubectl get` otomatis |
| Filter multi-kolom di tabel | Sedang | Filter bersamaan per kolom |
| Halaman detail per service | Sedang | Klik baris tabel → detail lengkap service |
| Dark/light theme toggle di dashboard | Rendah | Sudah menggunakan CSS variables, perlu tes visual |
| Autentikasi via GitHub OAuth | Rendah | Batasi akses hanya internal |

---

## 11. Kontributor & Kontak

| Peran | Nama |
|---|---|
| Owner & Maintainer | mamatnurahmat |
| GitHub Repository | [mamatnurahmat/docusaurus](https://github.com/mamatnurahmat/docusaurus) |
| Live Site | [mamatnurahmat.github.io](https://mamatnurahmat.github.io) |

---

*Dokumen ini dibuat otomatis berdasarkan state proyek per 2026-03-05. Update setiap ada perubahan arsitektur signifikan.*
