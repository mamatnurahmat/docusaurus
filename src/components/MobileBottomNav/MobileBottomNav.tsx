import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import styles from './MobileBottomNav.module.css';

type NavItem = {
    label: string;
    to: string;
    icon: React.ReactNode;
};

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const DocsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const BlogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

const TableIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
);

const NAV_ITEMS: NavItem[] = [
    { label: 'Home', to: '/', icon: <HomeIcon /> },
    { label: 'DevOps', to: '/docs/devops', icon: <DocsIcon /> },
    { label: 'Blog', to: '/blog', icon: <BlogIcon /> },
    { label: 'Table', to: '/deploy-table', icon: <TableIcon /> },
];

export default function MobileBottomNav(): React.ReactElement {
    const { pathname } = useLocation();

    const isActive = (to: string): boolean => {
        if (to === '/') return pathname === '/';
        return pathname.startsWith(to);
    };

    return (
        <nav className={styles.bottomNav} aria-label="Mobile bottom navigation">
            {NAV_ITEMS.map((item) => {
                const active = isActive(item.to);
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                        aria-current={active ? 'page' : undefined}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.label}</span>
                        {active && <span className={styles.indicator} />}
                    </Link>
                );
            })}
        </nav>
    );
}
