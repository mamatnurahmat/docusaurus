// Konfigurasi dinamis untuk sidebar DevOps
export interface SidebarCategory {
  id: string;
  label: string;
  description: string;
  icon?: string;
  items: string[];
  collapsed?: boolean;
}

export interface SidebarConfig {
  categories: SidebarCategory[];
  defaultCollapsed: boolean;
  showIcons: boolean;
}

// Konfigurasi default
export const defaultSidebarConfig: SidebarConfig = {
  categories: [
    {
      id: 'security',
      label: 'Security',
      description: 'Keamanan infrastruktur: WAF, CrowdSec, dan pertahanan berlapis',
      icon: '🔐',
      items: [
        'security',
        'security/waf-haproxy-modsecurity',
        'security/crowdsec-haproxy',
        'security/crowdsec-nginx',
      ],
      collapsed: false,
    },
    {
      id: 'cicd',
      label: 'CI/CD',
      description: 'Continuous Integration & Deployment',
      icon: '🔄',
      items: [
        'cicd',
        'cicd/gitops',
        'cicd/argocd-autopilot',
        'cicd/jenkins',
        'cicd/buildx-docker',
      ],
      collapsed: false,
    },
    {
      id: 'gitops',
      label: 'GitOps',
      description: 'Git as the source of truth',
      icon: '🚀',
      items: ['gitops'],
      collapsed: false,
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure',
      description: 'Network topology and infrastructure architecture',
      icon: '🏗️',
      items: ['infrastructure'],
      collapsed: false,
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      description: 'Observability stack: logging and metrics',
      icon: '📊',
      items: [
        'monitoring/logging-loki',
        'monitoring/metric-mimir',
      ],
      collapsed: false,
    },
  ],
  defaultCollapsed: false,
  showIcons: true,
};


// Fungsi untuk membuat sidebar berdasarkan konfigurasi
export function createSidebarFromConfig(config: SidebarConfig) {
  return [
    {
      type: 'doc' as const,
      id: 'devops',
      label: config.showIcons ? '🏠 DevOps Overview' : 'DevOps Overview',
    },
    ...config.categories.map(category => ({
      type: 'category' as const,
      label: config.showIcons ? `${category.icon} ${category.label}` : category.label,
      description: category.description,
      items: category.items,
      collapsed: category.collapsed ?? config.defaultCollapsed,
    })),
  ];
}

// Fungsi untuk membuat sidebar berdasarkan environment
export function createEnvironmentSidebar() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  const config = {
    ...defaultSidebarConfig,
    defaultCollapsed: isProduction, // Collapsed di production, expanded di development
    showIcons: !isProduction, // Sembunyikan emoji di production untuk tampilan yang lebih profesional
  };

  return createSidebarFromConfig(config);
}

// Fungsi untuk membuat sidebar berdasarkan user role (contoh)
export function createRoleBasedSidebar(userRole: 'admin' | 'developer' | 'viewer' = 'viewer') {
  const config = { ...defaultSidebarConfig };

  switch (userRole) {
    case 'admin':
      config.categories.push({
        id: 'admin',
        label: 'Administration',
        description: 'System administration tools',
        icon: '⚙️',
        items: ['admin'],
        collapsed: true,
      });
      break;
    case 'developer':
      config.categories.push({
        id: 'development',
        label: 'Development',
        description: 'Development tools and practices',
        icon: '💻',
        items: ['development'],
        collapsed: false,
      });
      break;
    case 'viewer':
    default:
      // Viewer hanya melihat kategori default
      break;
  }

  return createSidebarFromConfig(config);
}

// Fungsi untuk membuat sidebar berdasarkan feature flags
export function createFeatureFlagSidebar(featureFlags: Record<string, boolean>) {
  const config = { ...defaultSidebarConfig };

  // Filter kategori berdasarkan feature flags
  config.categories = config.categories.filter(category => {
    return featureFlags[category.id] !== false; // Tampilkan jika tidak explicitly disabled
  });

  return createSidebarFromConfig(config);
} 