import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import styles from './table.module.css';

interface ServiceData {
    name: string;
    environment: string;
    version: string;
    status: string;
    replicas: number;
    owner: string;
    updated: string;
}

type SortKey = keyof ServiceData;
type SortDir = 'asc' | 'desc';

const STATUS_BADGES: Record<string, string> = {
    running: styles.statusRunning,
    degraded: styles.statusDegraded,
    stopped: styles.statusStopped,
};

const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Service Name' },
    { key: 'environment', label: 'Environment' },
    { key: 'version', label: 'Version' },
    { key: 'status', label: 'Status' },
    { key: 'replicas', label: 'Replicas' },
    { key: 'owner', label: 'Owner' },
    { key: 'updated', label: 'Last Updated' },
];

export default function TablePage(): React.ReactElement {
    const [data, setData] = useState<ServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    useEffect(() => {
        fetch('/data/data.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load data');
                return res.json();
            })
            .then((json: ServiceData[]) => {
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
                    String(val).toLowerCase().includes(q)
                )
            )
            .sort((a, b) => {
                const va = a[sortKey];
                const vb = b[sortKey];
                const cmp =
                    typeof va === 'number' && typeof vb === 'number'
                        ? va - vb
                        : String(va).localeCompare(String(vb));
                return sortDir === 'asc' ? cmp : -cmp;
            });
    }, [data, search, sortKey, sortDir]);

    return (
        <Layout title="Service Table" description="Dynamic service status table">
            <main className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Service Status Table</h1>
                        <p className={styles.subtitle}>
                            Loaded from <code>/data/data.json</code> · {filtered.length} entries
                        </p>
                    </div>
                    <input
                        className={styles.search}
                        type="text"
                        placeholder="Search services..."
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
                    <div className={styles.errorBox}>
                        ⚠️ Error: {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {COLUMNS.map((col) => (
                                        <th
                                            key={col.key}
                                            className={styles.th}
                                            onClick={() => handleSort(col.key)}
                                        >
                                            {col.label}
                                            <span className={styles.sortIcon}>
                                                {sortKey === col.key
                                                    ? sortDir === 'asc'
                                                        ? ' ▲'
                                                        : ' ▼'
                                                    : ' ⇅'}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMNS.length} className={styles.emptyRow}>
                                            No results found for "{search}"
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((row, i) => (
                                        <tr key={i} className={styles.tr}>
                                            <td className={styles.td}>
                                                <strong>{row.name}</strong>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={`${styles.envBadge} ${styles[`env_${row.environment}`]}`}>
                                                    {row.environment}
                                                </span>
                                            </td>
                                            <td className={styles.td}>
                                                <code>{row.version}</code>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={`${styles.statusBadge} ${STATUS_BADGES[row.status] ?? ''}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.center}`}>
                                                {row.replicas}
                                            </td>
                                            <td className={styles.td}>{row.owner}</td>
                                            <td className={`${styles.td} ${styles.mono}`}>{row.updated}</td>
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
