# DevOps Documentation

Dokumentasi lengkap tentang praktik dan tools DevOps modern, termasuk CI/CD, GitOps, Kubernetes, Rancher, dan RKE2.

## Fitur

- 📚 **Dokumentasi Lengkap**: Panduan komprehensif untuk DevOps
- 🔄 **CI/CD Pipeline**: Alur dari developer commit hingga deployment
- 🚀 **GitOps**: Git sebagai sumber kebenaran
- 📦 **Container & Orchestration**: Kubernetes, Rancher, RKE2
- 🎨 **Sidebar Dinamis**: Konfigurasi sidebar yang fleksibel
- 📊 **Diagram Mermaid**: Visualisasi alur dan arsitektur
- 📱 **Responsive Design**: Tampilan optimal di semua device

## Sidebar Dinamis

Dokumentasi ini menggunakan sidebar dinamis yang dapat dikonfigurasi berdasarkan:

### 1. Environment
- **Development**: Kategori expanded dengan emoji
- **Production**: Kategori collapsed tanpa emoji (profesional)

### 2. User Role
- **Admin**: Tambahan kategori Administration
- **Developer**: Tambahan kategori Development  
- **Viewer**: Kategori default saja

### 3. Feature Flags
- Kontrol kategori yang ditampilkan
- Enable/disable fitur tertentu

## Cara Menggunakan

### Development
```bash
npm start
```

### Build Production
```bash
npm run build
```

### Serve Production Build
```bash
npm run serve
```

## Struktur Dokumentasi

```
docs/
├── devops.md                    # Overview DevOps
├── cicd.md                      # CI/CD Pipeline
├── gitops.md                    # GitOps Principles
├── kubernetes.md                # Kubernetes Basics
├── rancher.md                   # Rancher Management
├── rke2.md                      # RKE2 Installation
└── sidebar-configuration.md     # Sidebar Configuration Guide
```

## Konfigurasi Sidebar

Sidebar dapat dikonfigurasi dengan berbagai cara:

### Environment-based
```typescript
devopsSidebar: createEnvironmentSidebar()
```

### Role-based
```typescript
devopsSidebar: createRoleBasedSidebar('admin')
```

### Feature flags
```typescript
devopsSidebar: createFeatureFlagSidebar({ 
  cicd: true, 
  gitops: false 
})
```

## Export ke PDF

Untuk export dokumentasi ke PDF:

1. Install plugin PDF export
2. Konfigurasi export settings
3. Generate PDF dari build production

## Contributing

1. Fork repository
2. Buat branch fitur baru
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

## License

MIT License - lihat file LICENSE untuk detail.

## Support

- 📧 Email: support@devops-docs.com
- 💬 Discord: [DevOps Documentation Community](https://discord.gg/devops-docs)
- 📖 Documentation: [docs.devops-docs.com](https://docs.devops-docs.com)
