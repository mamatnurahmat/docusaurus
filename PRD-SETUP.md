# PRD — Setup & Development Journey: DevOps Documentation Portal

**Version:** 1.0  
**Date:** 2026-03-05  
**Tipe Dokumen:** Engineering Setup Guide / Development History  
**Audience:** Developer baru, LLM context, tim yang ingin replikasi setup ini

---

## Gambaran Umum

Dokumen ini menjelaskan **perjalanan lengkap** membangun portal dokumentasi DevOps dari nol hingga kondisi saat ini. Dokumen ini berguna untuk:

- Developer baru yang ingin memahami keputusan teknis yang sudah dibuat
- Mereplikasi setup yang sama di environment lain
- Memberikan konteks lengkap ke LLM agar bisa membantu pengembangan lebih lanjut

---

## FASE 1 — Bootstrap Proyek

### 1.1 Inisialisasi Docusaurus

**Tool:** `npx create-docusaurus@latest`  
**Template:** `classic` (dengan TypeScript)

Proyek dibuat dengan struktur default Docusaurus v3, yang menghasilkan:
- `docs/` — folder konten Markdown
- `src/pages/` — halaman React kustom
- `src/components/` — komponen reusable
- `docusaurus.config.ts` — konfigurasi utama
- `sidebars.ts` — konfigurasi sidebar navigasi

### 1.2 Konfigurasi GitHub Repository

Repository dibuat di: `github.com/mamatnurahmat/docusaurus`

Konfigurasi di `docusaurus.config.ts` disesuaikan:
```ts
organizationName: 'mamatnurahmat',
projectName: 'docusaurus',
url: 'https://mamatnurahmat.github.io',
baseUrl: '/',
```

---

## FASE 2 — Docker Development Environment

### 2.1 Mengapa Docker?

Menjamin konsistensi environment antar mesin developer. Tidak perlu install Node.js secara manual di mesin host.

### 2.2 File yang Dibuat

#### `Dockerfile.dev`
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
```

**Keputusan desain:**
- Menggunakan `node:18-alpine` untuk image yang ringan
- `COPY package*.json` dilakukan sebelum `COPY . .` untuk memanfaatkan Docker layer cache
- `--host 0.0.0.0` agar dev server bisa diakses dari luar container

#### `docker-compose.dev.yml`
```yaml
services:
  docusaurus-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: docusaurus-dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app                  # Hot-reload: mount source code
      - /app/node_modules       # Isolasi node_modules agar tidak tertimpa
      - /app/.docusaurus        # Isolasi build cache
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true  # Diperlukan untuk hot-reload di WSL/Docker Desktop
    restart: always
```

**Catatan penting:** Volume anonymous `/app/node_modules` dan `/app/.docusaurus` sengaja dipisah dari mount utama. Jika tidak, `node_modules` dari host akan menimpa `node_modules` di dalam container, menyebabkan error binary tidak kompatibel.

### 2.3 Makefile

Dibuat `Makefile` untuk menyederhanakan perintah:

```makefile
make dev          # docker compose up (dengan hot-reload)
make dev-rebuild  # docker compose up --build (rebuild image)
make stop         # docker compose down
make build        # Build production static files via Docker
make clean        # Hapus build output dan cache
make logs         # Lihat log container
make shell        # Masuk ke shell container
```

---

## FASE 3 — Konfigurasi CI/CD Pipeline

### 3.1 Target Deploy

Situs akan di-deploy ke repository terpisah: `mamatnurahmat/mamatnurahmat.github.io` (GitHub Pages).

Dua repository yang terlibat:
- **Source:** `mamatnurahmat/docusaurus` — kode sumber
- **Target:** `mamatnurahmat/mamatnurahmat.github.io` — output statis yang dihosting

### 3.2 Membuat GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy Docusaurus to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Build static site using Docker
        run: make build

      - name: Copy README to build directory
        run: sudo cp README.md ./build/

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          personal_token: ${{ secrets.DEPLOY_TOKEN }}
          external_repository: mamatnurahmat/mamatnurahmat.github.io
          publish_branch: master
          publish_dir: ./build
          commit_message: "Auto-deploy: ${{ github.sha }}"
```

### 3.3 Setup Secret

GitHub Actions membutuhkan token untuk push ke repo eksternal.

**Langkah:**
1. Buat Personal Access Token (PAT) di GitHub → Settings → Developer Settings
2. Berikan scope: `repo` + `workflow`
3. Tambahkan ke repository secrets: `Settings → Secrets → DEPLOY_TOKEN`

### 3.4 Masalah yang Ditemui & Solusinya

| Masalah | Penyebab | Solusi |
|---|---|---|
| Push ditolak "workflow scope missing" | PAT tidak punya scope `workflow` | Buat PAT baru dengan scope `workflow` |
| Push ditolak "personal_token required" | `github_token` tidak bisa push ke repo eksternal | Ganti dengan `personal_token` |
| Deploy ke branch salah | Target branch `gh-pages` tapi repo target pakai `master` | Ubah `publish_branch: master` |

---

## FASE 4 — Aktifkan Mermaid Diagrams

### 4.1 Masalah

Diagram Mermaid di file Markdown tidak ter-render, hanya tampil sebagai plain text.

### 4.2 Solusi

Tambahkan konfigurasi di `docusaurus.config.ts`:

```ts
const config: Config = {
  // ...
  markdown: {
    mermaid: true,   // ← Tambahkan ini
  },
  themes: ['@docusaurus/theme-mermaid'],  // ← Dan ini
};
```

### 4.3 Fix Diagram yang Bermasalah

Node label dengan karakter khusus (`&`) menyebabkan parsing error:

```
# Error:
B[Build & Test]

# Fix — quote labelnya:
B["Build & Test"]
```

---

## FASE 5 — Pembuatan Konten Dokumentasi

### 5.1 Sidebar Kustom

Karena Docusaurus default hanya menyupport sidebar statis, dibuat utility `src/utils/sidebarConfig.ts` yang lebih fleksibel:

```ts
// Interface untuk konfigurasi
interface SidebarCategory {
  id: string;
  label: string;
  icon?: string;
  items: string[];
  collapsed?: boolean;
}

// Fungsi generator sidebar
export function createSidebarFromConfig(config: SidebarConfig) { ... }

// Mendukung variasi berdasarkan environment
export function createEnvironmentSidebar() {
  const isProduction = process.env.NODE_ENV === 'production';
  // collapsed di production, expanded di development
}
```

**Kategori sidebar yang ada:**

| Kategori | Icon | Dokumen |
|---|---|---|
| 🏠 DevOps Overview | — | `devops.md` |
| 🔄 CI/CD | | `cicd.md` |
| 🚀 GitOps | | `gitops.md` |
| 🏗️ Infrastructure | | `infrastructure.md` |
| 📊 Monitoring | | `monitoring/logging-loki.md`, `monitoring/metric-mimir.md` |

**Kategori yang pernah ada tapi dihapus:** Kubernetes, Rancher, RKE2, Configuration (tidak relevan dengan scope saat ini).

### 5.2 Dokumentasi yang Dibuat

#### `docs/cicd.md` — CI/CD
- Konsep Continuous Integration & Continuous Deployment
- Contoh Jenkins pipeline (Declarative syntax)
- Mermaid diagram: push → build → test → deploy → verify
- Integrasi GitHub Actions

#### `docs/gitops.md` — GitOps
- Prinsip GitOps: Deklaratif, Versioned, Automatik, Continuous Reconciliation
- Perbedaan Push model (CI/CD tradisional) vs Pull model (GitOps)
- Mermaid diagram alur GitOps end-to-end
- Cara kerja ArgoCD internal (Repo Server, Application Controller, API Server)
- State machine ArgoCD: Synced → OutOfSync → Progressing → Synced

#### `docs/infrastructure.md` — Infrastruktur
- Topologi 3-layer: **DMZ → APP → DB**
- **DMZ Layer:** HAProxy, WAF, Nginx
- **APP Layer:** Kubernetes Cluster
  - Front nodes: KrakenD (API Gateway), Service Manager
  - Back nodes: Auth Service, Business Service, Notification Service
  - Shared: RabbitMQ, Redis, MongoDB
- **DB Layer:** Database servers (private network)
- Mermaid diagram topologi + tabel access rules

#### `docs/monitoring/logging-loki.md` — Grafana Loki
- Arsitektur Loki (label-based indexing, bukan full-text index)
- Topologi: Log Sources → Promtail/Alloy → Distributor → Ingester → Object Storage → Querier → Grafana
- Sequence diagram alur query LogQL
- Contoh query LogQL + best practices

#### `docs/monitoring/metric-mimir.md` — Grafana Mimir
- Arsitektur Mimir (multi-tenant, horizontally scalable)
- Topologi: App /metrics → Grafana Agent → Distributor → Ingester → Object Storage → Querier → Grafana
- Sequence diagram alerting: metric → Ruler → Alert Manager → Slack
- Integrasi satu Grafana Agent untuk Mimir + Loki dari Kubernetes cluster
- Contoh query PromQL + best practices

---

## FASE 6 — Custom Pages (React)

### 6.1 Halaman Tabel Statis (Awal)

Awalnya dibuat halaman tabel terpisah per namespace:
- `/table` — Service Status (data contoh)
- `/production-saas` — data dari `production-saas.json`
- `/production-qoinhub` — data dari `production-qoinhub.json`

Setiap halaman adalah file `.tsx` terpisah yang fetch JSON dan render tabel.

**Masalah:** Tidak skalabel — untuk setiap namespace baru harus buat file `.tsx` baru dan update navbar secara manual.

### 6.2 Refactor ke Halaman Dinamis

Solusi: **Satu halaman + manifest JSON**.

#### Sistem Manifest

File `static/data/deploy/manifest.json`:
```json
[
  {
    "slug": "production-saas",
    "label": "Production SaaS",
    "file": "/data/deploy/production-saas.json"
  },
  {
    "slug": "production-qoinhub",
    "label": "Production Qoinhub",
    "file": "/data/deploy/production-qoinhub.json"
  }
]
```

#### Halaman `deploy-table.tsx`

Logika:
1. Fetch `manifest.json` → dapatkan daftar namespace
2. Render tab untuk setiap entry
3. Klik tab → fetch JSON yang sesuai → render tabel
4. Tabel mendukung search (multi-kolom) dan sort per kolom

**Cara menambah namespace baru:**
```json
// Cukup tambah entry di manifest.json:
{ "slug": "nama-baru", "label": "Nama Tab", "file": "/data/deploy/nama-baru.json" }
```
Tidak perlu ubah kode apapun.

### 6.3 Navbar Update

Sebelum:
```ts
// Dropdown statis dengan 3 item hardcoded
{ label: 'Table', items: [
  { to: '/table', label: 'Service Status' },
  { to: '/production-saas', label: 'Production SaaS' },
  { to: '/production-qoinhub', label: 'Production Qoinhub' },
]}
```

Sesudah:
```ts
// Single link ke halaman dinamis
{ to: '/deploy-table', label: 'Table', position: 'left' }
```

---

## FASE 7 — Deployment Dashboard di Home Page

### 7.1 Komponen `DeployDashboard`

File: `src/components/DeployDashboard/index.tsx`

Komponen ini:
1. Fetch semua JSON dari daftar `SOURCES` (hardcoded di komponen)
2. Hitung statistik: total, running (replicas > 0), stopped (replicas = 0), total replicas
3. Render ke UI

### 7.2 UI yang Dirender

**Global Stat Cards:**
```
[ Total Services ]  [ Running ]  [ Stopped ]  [ Total Replicas ]  [ Namespaces ]
```

**Per-Namespace Card:**
```
┌─────────────────────────────────┐
│ production-saas      Lihat detail→│
│ 41 Services | 35 Running | 6 Stopped | 66 Replicas │
│ Uptime Rate ████████░░ 85%      │
│ [front: 24] [back: 17] [GO: 41] │
└─────────────────────────────────┘
```

**Language Distribution:**
```
107         7
 GO      DOTNET
████░   █░░░░░
 94%      6%
```

### 7.3 Integrasi ke Home Page

File `src/pages/index.tsx` diupdate:
- Hapus section `HomepageFeatures` (konten default Docusaurus — "Easy to Use", "Focus on What Matters", "Powered by React")
- Tambah `<DeployDashboard />` di bawah hero banner

```tsx
export default function Home(): ReactNode {
  return (
    <Layout>
      <HomepageHeader />   {/* Hero: judul + tombol dokumentasi */}
      <main>
        <DeployDashboard /> {/* Dashboard deployment */}
      </main>
    </Layout>
  );
}
```

### 7.4 Styling

Semua styling menggunakan **CSS Modules** + **CSS Variables Docusaurus** (`var(--ifm-color-primary)`, `var(--ifm-background-surface-color)`, dll) sehingga otomatis mendukung dark mode tanpa kode tambahan.

---

## Ringkasan Perjalanan (Timeline)

```
FASE 1: Bootstrap → npx create-docusaurus, konfigurasi GitHub repo
   ↓
FASE 2: Docker → Dockerfile.dev, docker-compose.dev.yml, Makefile
   ↓
FASE 3: CI/CD → GitHub Actions, DEPLOY_TOKEN secret, auto-deploy ke GitHub Pages
   ↓
FASE 4: Mermaid → Aktifkan rendering diagram, fix karakter khusus
   ↓
FASE 5: Konten → cicd.md, gitops.md, infrastructure.md, monitoring/*.md, sidebar kustom
   ↓
FASE 6: Custom Pages → Tabel statis → Refactor ke halaman dinamis + manifest.json
   ↓
FASE 7: Dashboard → DeployDashboard komponen, integrasi ke home page
```

---

## File Kunci & Perannya

| File | Peran |
|---|---|
| `docusaurus.config.ts` | Konfigurasi utama: URL, navbar, footer, Mermaid, GitHub links |
| `sidebars.ts` | Mengimpor dari `sidebarConfig.ts` untuk generate sidebar |
| `src/utils/sidebarConfig.ts` | Logic sidebar dinamis (per-environment, per-role) |
| `src/pages/index.tsx` | Home page dengan DeployDashboard |
| `src/pages/deploy-table.tsx` | Halaman tabel dinamis dengan tab sistem |
| `src/components/DeployDashboard/index.tsx` | Komponen dashboard utama |
| `static/data/deploy/manifest.json` | **Konfigurasi sumber data deployment** — edit ini untuk tambah namespace |
| `static/data/deploy/*.json` | Data deployment mentah per namespace |
| `.github/workflows/deploy.yml` | CI/CD pipeline auto-deploy |
| `Dockerfile.dev` | Image Docker untuk dev server |
| `docker-compose.dev.yml` | Konfigurasi container development |
| `Makefile` | Shortcut perintah dev |

---

## Dependensi NPM Penting

| Package | Versi | Fungsi |
|---|---|---|
| `@docusaurus/core` | ^3.x | Core framework |
| `@docusaurus/preset-classic` | ^3.x | Preset dengan docs, blog, theme |
| `@docusaurus/theme-mermaid` | ^3.x | Rendering diagram Mermaid |
| `prism-react-renderer` | ^2.x | Syntax highlighting code blocks |
| `react` | ^18.x | UI library |
| `clsx` | ^2.x | CSS class utility |

---

## Untuk Replikasi di Environment Baru

```bash
# 1. Clone
git clone https://github.com/mamatnurahmat/docusaurus.git
cd docusaurus

# 2. Jalankan
make dev
# Buka http://localhost:3000

# 3. Setup CI/CD (jika ingin auto-deploy)
# - Buat repo GitHub Pages: username.github.io
# - Buat PAT dengan scope: repo + workflow
# - Tambahkan ke Secrets dengan nama: DEPLOY_TOKEN
# - Push ke branch main → otomatis deploy

# 4. Tambah data deployment baru
# - Taruh file JSON di static/data/deploy/
# - Tambah entry di static/data/deploy/manifest.json
# - Done — tab muncul otomatis
```

---

*Dokumen ini merepresentasikan state proyek per 2026-03-05. Diperbarui secara manual setiap ada perubahan arsitektur signifikan.*
