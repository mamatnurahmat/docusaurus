import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import styles from './DeployDashboard.module.css';

interface DeployData {
    id: string;
    manifest: string;
    replicas: number;
    image: string;
    nodetype: string;
    port: number | null;
    helm: string | null;
    language: string;
    ns: string;
}

interface NamespaceStats {
    ns: string;
    slug: string;
    total: number;
    running: number;
    stopped: number;
    front: number;
    back: number;
    totalReplicas: number;
    languages: Record<string, number>;
}

const SOURCES = [
    { label: 'Production SaaS', file: '/data/deploy/production-saas.json', path: '/production-saas', color: '#4f46e5' },
    { label: 'Production Qoinhub', file: '/data/deploy/production-qoinhub.json', path: '/production-qoinhub', color: '#0891b2' },
];

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: color ?? 'var(--ifm-color-primary)' }}>{value}</div>
            <div className={styles.statLabel}>{label}</div>
            {sub && <div className={styles.statSub}>{sub}</div>}
        </div>
    );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${pct}%`, background: color }} />
        </div>
    );
}

function NamespaceCard({ stat, color, path }: { stat: NamespaceStats; color: string; path: string }) {
    const runRate = stat.total > 0 ? Math.round((stat.running / stat.total) * 100) : 0;
    return (
        <div className={styles.nsCard} style={{ borderTopColor: color }}>
            <div className={styles.nsHeader}>
                <span className={styles.nsName}>{stat.ns}</span>
                <Link to={path} className={styles.nsLink}>Lihat detail →</Link>
            </div>
            <div className={styles.nsStats}>
                <div className={styles.nsStatItem}>
                    <span className={styles.nsStatNum}>{stat.total}</span>
                    <span className={styles.nsStatLabel}>Services</span>
                </div>
                <div className={styles.nsStatItem}>
                    <span className={styles.nsStatNum} style={{ color: '#16a34a' }}>{stat.running}</span>
                    <span className={styles.nsStatLabel}>Running</span>
                </div>
                <div className={styles.nsStatItem}>
                    <span className={styles.nsStatNum} style={{ color: '#dc2626' }}>{stat.stopped}</span>
                    <span className={styles.nsStatLabel}>Stopped</span>
                </div>
                <div className={styles.nsStatItem}>
                    <span className={styles.nsStatNum}>{stat.totalReplicas}</span>
                    <span className={styles.nsStatLabel}>Replicas</span>
                </div>
            </div>
            <div className={styles.nsProgress}>
                <div className={styles.nsProgressLabel}>
                    <span>Uptime Rate</span><span style={{ color: runRate === 100 ? '#16a34a' : runRate > 70 ? '#ca8a04' : '#dc2626' }}>{runRate}%</span>
                </div>
                <ProgressBar value={stat.running} max={stat.total} color={runRate > 70 ? '#16a34a' : '#dc2626'} />
            </div>
            <div className={styles.nsNodeRow}>
                <span className={styles.nsBadgeFront}>front: {stat.front}</span>
                <span className={styles.nsBadgeBack}>back: {stat.back}</span>
                {Object.entries(stat.languages).map(([lang, count]) => (
                    <span key={lang} className={styles.nsBadgeLang}>{lang}: {count}</span>
                ))}
            </div>
        </div>
    );
}

function computeStats(items: DeployData[]): NamespaceStats[] {
    const map: Record<string, NamespaceStats> = {};
    for (const item of items) {
        if (!map[item.ns]) {
            map[item.ns] = { ns: item.ns, slug: item.ns, total: 0, running: 0, stopped: 0, front: 0, back: 0, totalReplicas: 0, languages: {} };
        }
        const s = map[item.ns];
        s.total++;
        if (item.replicas > 0) s.running++; else s.stopped++;
        if (item.nodetype === 'front') s.front++; else s.back++;
        s.totalReplicas += item.replicas;
        s.languages[item.language] = (s.languages[item.language] ?? 0) + 1;
    }
    return Object.values(map);
}

export default function DeployDashboard(): React.ReactElement {
    const [allData, setAllData] = useState<{ label: string; color: string; path: string; items: DeployData[] }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all(
            SOURCES.map((src) =>
                fetch(src.file)
                    .then((r) => r.json())
                    .then((items: DeployData[]) => ({ label: src.label, color: src.color, path: src.path, items }))
                    .catch(() => ({ label: src.label, color: src.color, path: src.path, items: [] as DeployData[] }))
            )
        ).then((results) => {
            setAllData(results);
            setLoading(false);
        });
    }, []);

    const combined = allData.flatMap((d) => d.items);
    const totalServices = combined.length;
    const totalRunning = combined.filter((d) => d.replicas > 0).length;
    const totalStopped = combined.filter((d) => d.replicas === 0).length;
    const totalReplicas = combined.reduce((a, b) => a + b.replicas, 0);
    const globalRunRate = totalServices > 0 ? Math.round((totalRunning / totalServices) * 100) : 0;

    if (loading) {
        return (
            <div className={styles.loadingWrap}>
                <div className={styles.spinner} /><span>Loading deployment data…</span>
            </div>
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>📊 Deployment Overview</h2>
                <p className={styles.sectionSub}>Ringkasan status seluruh service di semua namespace production</p>
            </div>

            {/* Global stat cards */}
            <div className={styles.statGrid}>
                <StatCard label="Total Services" value={totalServices} sub="across all namespaces" color="var(--ifm-color-primary)" />
                <StatCard label="Running" value={totalRunning} sub={`${globalRunRate}% uptime rate`} color="#16a34a" />
                <StatCard label="Stopped" value={totalStopped} sub="replicas = 0" color="#dc2626" />
                <StatCard label="Total Replicas" value={totalReplicas} sub="active pods" color="#0891b2" />
                <StatCard label="Namespaces" value={allData.length} sub="production environments" color="#7c3aed" />
            </div>

            {/* Per-source namespace cards */}
            {allData.map((src) => {
                const stats = computeStats(src.items);
                return (
                    <div key={src.label} className={styles.sourceBlock}>
                        <div className={styles.sourceTitle} style={{ borderLeftColor: src.color }}>
                            <span style={{ color: src.color }}>●</span> {src.label}
                            <span className={styles.sourceTotalBadge}>{src.items.length} services</span>
                        </div>
                        <div className={styles.nsGrid}>
                            {stats.map((stat) => (
                                <NamespaceCard key={stat.ns} stat={stat} color={src.color} path={src.path} />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Language distribution */}
            <div className={styles.langBlock}>
                <h3 className={styles.langTitle}>Language Distribution</h3>
                <div className={styles.langGrid}>
                    {Object.entries(
                        combined.reduce<Record<string, number>>((acc, d) => {
                            acc[d.language] = (acc[d.language] ?? 0) + 1;
                            return acc;
                        }, {})
                    ).sort((a, b) => b[1] - a[1]).map(([lang, count]) => (
                        <div key={lang} className={styles.langCard}>
                            <div className={styles.langCount}>{count}</div>
                            <div className={styles.langName}>{lang}</div>
                            <ProgressBar value={count} max={totalServices} color="var(--ifm-color-primary)" />
                            <div className={styles.langPct}>{Math.round((count / totalServices) * 100)}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
