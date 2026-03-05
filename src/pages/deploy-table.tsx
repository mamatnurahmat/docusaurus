import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import styles from './table.module.css';
import tabStyles from './deploy-table.module.css';
import { useAuth } from '../context/AuthContext';

interface ManifestEntry {
    slug: string;
    label: string;
    file: string;
}

interface DeployData {
    id: string;
    manifest: string;
    replicas: number;
    image: string;
    nodetype: string;
    port: number | null;
    port2: number | null;
    helm: string | null;
    language: string;
    ns: string;
}

type SortKey = keyof DeployData;
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'manifest', label: 'Manifest' },
    { key: 'image', label: 'Image' },
    { key: 'nodetype', label: 'Node Type' },
    { key: 'replicas', label: 'Replicas' },
    { key: 'port', label: 'Port' },
    { key: 'port2', label: 'Port 2' },
    { key: 'helm', label: 'Helm' },
    { key: 'language', label: 'Language' },
    { key: 'ns', label: 'Namespace' },
];

const NODETYPE_STYLE: Record<string, string> = {
    front: styles.env_production,
    back: styles.env_staging,
};

const ROLE_COLOR: Record<string, string> = {
    devops: '#4f46e5',
    manager: '#0891b2',
    developer: '#16a34a',
};

function UserBadge(): React.ReactElement {
    const { user, logout } = useAuth();
    if (!user) return <></>;
    return (
        <div className={tabStyles.userBadge}>
            <span className={tabStyles.userIcon}>👤</span>
            <span className={tabStyles.userName}>{user.name}</span>
            <span
                className={tabStyles.userRole}
                style={{ background: ROLE_COLOR[user.role] ?? '#555' }}
            >
                {user.role}
            </span>
            <button
                className={tabStyles.logoutBtn}
                onClick={() => {
                    logout();
                    window.location.href = '/login';
                }}
            >
                Logout
            </button>
        </div>
    );
}

function DeployTable({ entry }: { entry: ManifestEntry }) {
    const [data, setData] = useState<DeployData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('manifest');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    useEffect(() => {
        setLoading(true);
        setError(null);
        setSearch('');
        fetch(entry.file)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load data');
                return res.json();
            })
            .then((json: DeployData[]) => { setData(json); setLoading(false); })
            .catch((err: Error) => { setError(err.message); setLoading(false); });
    }, [entry.file]);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDir('asc'); }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return data
            .filter((row) => Object.values(row).some((v) => v !== null && String(v).toLowerCase().includes(q)))
            .sort((a, b) => {
                const va = a[sortKey] ?? '', vb = b[sortKey] ?? '';
                const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
                return sortDir === 'asc' ? cmp : -cmp;
            });
    }, [data, search, sortKey, sortDir]);

    return (
        <>
            <div className={styles.header}>
                <div>
                    <p className={styles.subtitle}>
                        <code>{entry.file}</code> · {filtered.length} of {data.length} entries
                    </p>
                </div>
                <input
                    className={styles.search}
                    type="text"
                    placeholder="Search manifest, image, namespace..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading && <div className={styles.state}><div className={styles.spinner} /><span>Loading…</span></div>}
            {error && <div className={styles.errorBox}>⚠️ {error}</div>}
            {!loading && !error && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>#</th>
                                {COLUMNS.map((col) => (
                                    <th key={col.key} className={styles.th} onClick={() => handleSort(col.key)}>
                                        {col.label}
                                        <span className={styles.sortIcon}>{sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={COLUMNS.length + 1} className={styles.emptyRow}>No results for "{search}"</td></tr>
                            ) : filtered.map((row, i) => (
                                <tr key={row.id} className={styles.tr}>
                                    <td className={`${styles.td} ${styles.mono}`} style={{ opacity: 0.5, fontSize: '0.8rem' }}>{i + 1}</td>
                                    <td className={styles.td}><strong>{row.manifest}</strong></td>
                                    <td className={`${styles.td} ${styles.mono}`} style={{ fontSize: '0.8rem' }}>{row.image}</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.envBadge} ${NODETYPE_STYLE[row.nodetype] ?? ''}`}>{row.nodetype}</span>
                                    </td>
                                    <td className={`${styles.td} ${styles.center}`}>
                                        <span className={`${styles.statusBadge} ${row.replicas > 0 ? styles.statusRunning : styles.statusStopped}`}>{row.replicas}</span>
                                    </td>
                                    <td className={`${styles.td} ${styles.center} ${styles.mono}`}>{row.port ?? '—'}</td>
                                    <td className={`${styles.td} ${styles.center} ${styles.mono}`}>{row.port2 ?? '—'}</td>
                                    <td className={styles.td}>{row.helm ?? <span style={{ opacity: 0.4 }}>—</span>}</td>
                                    <td className={styles.td}>{row.language}</td>
                                    <td className={`${styles.td} ${styles.mono}`} style={{ fontSize: '0.8rem' }}>{row.ns}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

export default function DeployTablePage(): React.ReactElement {
    const { isAuthenticated, isLoading } = useAuth();
    const [manifest, setManifest] = useState<ManifestEntry[]>([]);
    const [activeSlug, setActiveSlug] = useState<string | null>(null);

    // Auth guard — redirect to /login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            window.location.href = '/login';
        }
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetch('/data/deploy/manifest.json')
            .then((r) => r.json())
            .then((entries: ManifestEntry[]) => {
                setManifest(entries);
                if (entries.length > 0) setActiveSlug(entries[0].slug);
            });
    }, [isAuthenticated]);

    // Show spinner while checking auth
    if (isLoading || !isAuthenticated) {
        return (
            <Layout title="Deploy Tables">
                <div className={tabStyles.authLoading}>
                    <div className={styles.spinner} />
                    <span>Checking session…</span>
                </div>
            </Layout>
        );
    }

    const active = manifest.find((e) => e.slug === activeSlug);

    return (
        <Layout title="Deploy Tables" description="Dynamic deployment table loaded from manifest">
            <main className={styles.container}>
                {/* Page header with user badge */}
                <div className={tabStyles.pageHeader}>
                    <div>
                        <h1 className={styles.title}>Deployment Tables</h1>
                        <p className={styles.subtitle}>Data dari <code>/data/deploy/manifest.json</code></p>
                    </div>
                    <UserBadge />
                </div>

                {/* Tab strip */}
                <div className={tabStyles.tabStrip}>
                    {manifest.map((entry) => (
                        <button
                            key={entry.slug}
                            className={`${tabStyles.tab} ${activeSlug === entry.slug ? tabStyles.tabActive : ''}`}
                            onClick={() => setActiveSlug(entry.slug)}
                        >
                            {entry.label}
                        </button>
                    ))}
                </div>

                {/* Active tab content */}
                {active && <DeployTable key={active.slug} entry={active} />}
            </main>
        </Layout>
    );
}
