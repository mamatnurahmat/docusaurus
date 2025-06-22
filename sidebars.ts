import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import { createEnvironmentSidebar, createRoleBasedSidebar, createFeatureFlagSidebar } from './src/utils/sidebarConfig';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// Konfigurasi dinamis untuk kategori DevOps
const devopsCategories = [
  {
    id: 'cicd',
    label: 'CI/CD',
    description: 'Continuous Integration & Deployment',
    items: [
      'cicd',
      // Bisa ditambahkan sub-dokumen CI/CD di sini
      // 'cicd/jenkins',
      // 'cicd/gitlab-ci',
      // 'cicd/github-actions',
    ]
  },
  {
    label: 'GitOps',
    description: 'Git as the source of truth',
    items: [
      'gitops',
      // 'gitops/argocd',
      // 'gitops/flux',
    ]
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    description: 'Container orchestration platform',
    items: [
      'kubernetes',
      // 'kubernetes/basics',
      // 'kubernetes/advanced',
    ]
  },
  {
    id: 'rancher',
    label: 'Rancher',
    description: 'Kubernetes management platform',
    items: [
      'rancher',
      // 'rancher/installation',
      // 'rancher/multi-cluster',
    ]
  },
  {
    id: 'rke2',
    label: 'RKE2',
    description: 'Rancher Kubernetes Engine 2',
    items: [
      'rke2',
      'rke2/installation',
      'rke2/configuration',
    ]
  }
];

// Fungsi untuk membuat sidebar dinamis
function createDevOpsSidebar() {
  return [
    'devops', // Halaman utama DevOps
    ...devopsCategories.map(category => ({
      type: 'category' as const,
      label: category.label,
      description: category.description,
      items: category.items,
      collapsed: false, // Bisa diatur true/false
    }))
  ];
}

// Fungsi untuk membuat sidebar berdasarkan environment
function createEnvironmentSpecificSidebar() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return [
    'devops',
    ...devopsCategories.map(category => ({
      type: 'category' as const,
      label: category.label,
      description: category.description,
      items: category.items,
      collapsed: isDevelopment ? false : true, // Collapsed di production, expanded di development
    }))
  ];
}

// Fungsi untuk membuat sidebar dengan fitur advanced
function createAdvancedSidebar() {
  return [
    {
      type: 'doc' as const,
      id: 'devops',
      label: '🏠 DevOps Overview',
    },
    {
      type: 'category' as const,
      label: '🔄 CI/CD Pipeline',
      description: 'Continuous Integration & Deployment',
      items: [
        {
          type: 'doc' as const,
          id: 'cicd',
          label: 'CI/CD Fundamentals',
        },
        // Bisa ditambahkan sub-dokumen
        // {
        //   type: 'link' as const,
        //   label: 'Jenkins Tutorial',
        //   href: 'https://jenkins.io/doc/',
        // },
      ],
      collapsed: false,
    },
    {
      type: 'category' as const,
      label: '📦 Container & Orchestration',
      description: 'Container management and orchestration',
      items: [
        {
          type: 'doc' as const,
          id: 'kubernetes',
          label: 'Kubernetes',
        },
        {
          type: 'doc' as const,
          id: 'rancher',
          label: 'Rancher',
        },
        {
          type: 'doc' as const,
          id: 'rke2',
          label: 'RKE2',
        },
      ],
      collapsed: false,
    },
    {
      type: 'category' as const,
      label: '🚀 GitOps',
      description: 'Git as the source of truth',
      items: [
        {
          type: 'doc' as const,
          id: 'gitops',
          label: 'GitOps Principles',
        },
      ],
      collapsed: false,
    },
  ];
}

const sidebars: SidebarsConfig = {
  // Sidebar DevOps dinamis - pilih salah satu dari opsi di bawah
  devopsSidebar: createEnvironmentSidebar(), // Menggunakan konfigurasi dinamis berdasarkan environment
  
  // Alternatif lain:
  // devopsSidebar: createAdvancedSidebar(), // Versi advanced dengan emoji dan struktur yang lebih baik
  // devopsSidebar: createDevOpsSidebar(), // Versi sederhana
  // devopsSidebar: createEnvironmentSpecificSidebar(), // Berdasarkan environment
  // devopsSidebar: createRoleBasedSidebar('developer'), // Berdasarkan role user
  // devopsSidebar: createFeatureFlagSidebar({ cicd: true, gitops: false }), // Berdasarkan feature flags
};

export default sidebars;
