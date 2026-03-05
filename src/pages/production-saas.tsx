import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import styles from './table.module.css';

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

export default function ProductionSaasPage(): React.ReactElement {
    const [data, setData] = useState<DeployData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('manifest');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    useEffect(() => {
        fetch('/data/deploy/production-saas.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load data');
                return res.json();
            })
            .then((json: DeployData[]) => {
                setData(json);
                setLoading(false);
            })
            .catch((err: Error) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return data
            .filter((row) =>
                Object.values(row).some((val) =>
                    val !== null && String(val).toLowerCase().includes(q)
                )
            )
            .sort((a, b) => {
                const va = a[sortKey] ?? '';
                const vb = b[sortKey] ?? '';
                const cmp =
                    typeof va === 'number' && typeof vb === 'number'
                        ? va - vb
                        : String(va).localeCompare(String(vb));
                return sortDir === 'asc' ? cmp : -cmp;
            });
    }, [data, search, sortKey, sortDir]);

    return (
        <Layout title="Production SaaS" description="Production SaaS deployment table">
            <main className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Production SaaS Deployments</h1>
                        <p className={styles.subtitle}>
                            Loaded from <code>/data/deploy/production-saas.json</code> · {filtered.length} of {data.length} entries
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

                {loading && (
                    <div className={styles.state}>
                        <div className={styles.spinner} />
                        <span>Loading data…</span>
                    </div>
                )}

                {error && (
                    <div className={styles.errorBox}>⚠️ Error: {error}</div>
                )}

                {!loading && !error && (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>#</th>
                                    {COLUMNS.map((col) => (
                                        <th
                                            key={col.key}
                                            className={styles.th}
                                            onClick={() => handleSort(col.key)}
                                        >
                                            {col.label}
                                            <span className={styles.sortIcon}>
                                                {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMNS.length + 1} className={styles.emptyRow}>
                                            No results found for "{search}"
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((row, i) => (
                                        <tr key={row.id} className={styles.tr}>
                                            <td className={`${styles.td} ${styles.mono}`} style={{ opacity: 0.5, fontSize: '0.8rem' }}>
                                                {i + 1}
                                            </td>
                                            <td className={styles.td}><strong>{row.manifest}</strong></td>
                                            <td className={`${styles.td} ${styles.mono}`} style={{ fontSize: '0.8rem' }}>
                                                {row.image}
                                            </td>
                                            <td className={styles.td}>
                                                <span className={`${styles.envBadge} ${NODETYPE_STYLE[row.nodetype] ?? ''}`}>
                                                    {row.nodetype}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.center}`}>
                                                <span className={`${styles.statusBadge} ${row.replicas > 0 ? styles.statusRunning : styles.statusStopped}`}>
                                                    {row.replicas}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.center} ${styles.mono}`}>{row.port ?? '—'}</td>
                                            <td className={`${styles.td} ${styles.center} ${styles.mono}`}>{row.port2 ?? '—'}</td>
                                            <td className={styles.td}>{row.helm ?? <span style={{ opacity: 0.4 }}>—</span>}</td>
                                            <td className={styles.td}>{row.language}</td>
                                            <td className={`${styles.td} ${styles.mono}`} style={{ fontSize: '0.8rem' }}>{row.ns}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </Layout>
    );
}
