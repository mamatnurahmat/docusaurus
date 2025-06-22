---
id: sidebar-configuration
slug: /sidebar-configuration
title: Sidebar Configuration
---

# Sidebar Configuration

Dokumentasi ini menjelaskan cara mengkonfigurasi sidebar dinamis di Docusaurus DevOps Documentation.

## Jenis Sidebar Dinamis

### 1. Sidebar Berdasarkan Environment

Sidebar akan menyesuaikan berdasarkan environment (development/production):

```typescript
// Di sidebars.ts
devopsSidebar: createEnvironmentSidebar()
```

**Perbedaan:**
- **Development**: Kategori expanded, dengan emoji
- **Production**: Kategori collapsed, tanpa emoji (lebih profesional)

### 2. Sidebar Berdasarkan User Role

Sidebar menyesuaikan berdasarkan role pengguna:

```typescript
// Untuk admin
devopsSidebar: createRoleBasedSidebar('admin')

// Untuk developer
devopsSidebar: createRoleBasedSidebar('developer')

// Untuk viewer (default)
devopsSidebar: createRoleBasedSidebar('viewer')
```

**Fitur per role:**
- **Admin**: Tambahan kategori "Administration"
- **Developer**: Tambahan kategori "Development"
- **Viewer**: Hanya kategori default

### 3. Sidebar Berdasarkan Feature Flags

Sidebar dapat dikontrol menggunakan feature flags:

```typescript
// Enable CI/CD, disable GitOps
devopsSidebar: createFeatureFlagSidebar({ 
  cicd: true, 
  gitops: false,
  kubernetes: true,
  rancher: true,
  rke2: true
})
```

## Konfigurasi Kategori

Setiap kategori dapat dikonfigurasi dengan properti berikut:

```typescript
{
  id: 'cicd',                    // ID unik kategori
  label: 'CI/CD',               // Label yang ditampilkan
  description: 'Continuous Integration & Deployment', // Deskripsi
  icon: '🔄',                   // Emoji/icon (opsional)
  items: ['cicd'],              // Array dokumen dalam kategori
  collapsed: false,             // Status collapsed/expanded
}
```

## Menambah Kategori Baru

### 1. Update Konfigurasi

Edit file `src/utils/sidebarConfig.ts`:

```typescript
export const defaultSidebarConfig: SidebarConfig = {
  categories: [
    // ... kategori existing
    {
      id: 'monitoring',
      label: 'Monitoring',
      description: 'Application and infrastructure monitoring',
      icon: '📊',
      items: ['monitoring'],
      collapsed: false,
    },
  ],
  // ... konfigurasi lainnya
};
```

### 2. Buat File Dokumentasi

Buat file markdown di folder `docs/`:

```markdown
---
id: monitoring
slug: /monitoring
title: Monitoring
---

# Monitoring

Konten tentang monitoring...
```

### 3. Update Sidebar

Sidebar akan otomatis terupdate karena menggunakan konfigurasi dinamis.

## Best Practices

### 1. Struktur Kategori
- Gunakan ID yang deskriptif dan konsisten
- Kelompokkan dokumen yang berhubungan dalam kategori yang sama
- Batasi jumlah item per kategori (maksimal 10-15)

### 2. Label dan Deskripsi
- Gunakan label yang jelas dan mudah dipahami
- Tambahkan deskripsi singkat untuk setiap kategori
- Konsisten dalam penggunaan emoji/icon

### 3. Collapsed State
- Kategori utama: `collapsed: false`
- Sub-kategori: `collapsed: true` (default)
- Production: collapsed untuk performa

### 4. Performance
- Gunakan lazy loading untuk kategori besar
- Batasi jumlah kategori yang ditampilkan sekaligus
- Implementasikan virtual scrolling jika diperlukan

## Contoh Implementasi Lanjutan

### Sidebar dengan Sub-kategori

```typescript
{
  id: 'cicd',
  label: 'CI/CD',
  description: 'Continuous Integration & Deployment',
  icon: '🔄',
  items: [
    'cicd',
    'cicd/jenkins',
    'cicd/gitlab-ci',
    'cicd/github-actions',
    'cicd/best-practices'
  ],
  collapsed: false,
}
```

### Sidebar dengan External Links

```typescript
{
  type: 'category' as const,
  label: '🔄 CI/CD Pipeline',
  items: [
    {
      type: 'doc' as const,
      id: 'cicd',
      label: 'CI/CD Fundamentals',
    },
    {
      type: 'link' as const,
      label: 'Jenkins Documentation',
      href: 'https://jenkins.io/doc/',
    },
  ],
}
```

### Sidebar dengan Conditional Rendering

```typescript
function createConditionalSidebar(showAdvanced: boolean) {
  const baseCategories = ['devops', 'cicd', 'kubernetes'];
  const advancedCategories = ['advanced-topics', 'troubleshooting'];
  
  return [
    ...baseCategories,
    ...(showAdvanced ? advancedCategories : [])
  ];
}
```

## Troubleshooting

### Sidebar Tidak Muncul
1. Pastikan file `sidebars.ts` sudah diimport dengan benar
2. Check console untuk error TypeScript
3. Restart development server

### Kategori Tidak Terurut
1. Urutan ditentukan oleh array di konfigurasi
2. Pastikan ID dokumen sesuai dengan yang didefinisikan
3. Check frontmatter di file markdown

### Emoji Tidak Muncul
1. Pastikan `showIcons: true` di konfigurasi
2. Check encoding file untuk emoji
3. Pastikan browser mendukung emoji

## Referensi

- [Docusaurus Sidebar Documentation](https://docusaurus.io/docs/sidebar)
- [TypeScript Configuration](https://www.typescriptlang.org/docs/)
- [Mermaid Diagrams](https://mermaid.js.org/) 