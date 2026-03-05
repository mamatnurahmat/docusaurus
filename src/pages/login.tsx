import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../context/AuthContext';
import styles from './login.module.css';

const ROLE_COLOR: Record<string, string> = {
    devops: '#4f46e5',
    manager: '#0891b2',
    developer: '#16a34a',
};

export default function LoginPage(): React.ReactElement {
    const { login, isAuthenticated, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            window.location.href = '/deploy-table';
        }
    }, [isAuthenticated, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Username dan password wajib diisi.');
            return;
        }
        setSubmitting(true);
        setError('');
        const result = await login(username, password);
        if (result === 'ok') {
            window.location.href = '/deploy-table';
        } else if (result === 'invalid') {
            setError('Username atau password salah.');
        } else {
            setError('Gagal memuat data. Coba lagi.');
        }
        setSubmitting(false);
    };

    if (isLoading) {
        return (
            <Layout title="Login">
                <div className={styles.centerWrap}>
                    <div className={styles.spinner} />
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Login — DevOps Portal" description="Login to access deployment tables">
            <div className={styles.centerWrap}>
                <div className={styles.card}>
                    {/* Logo / icon */}
                    <div className={styles.icon}>🔐</div>
                    <h1 className={styles.title}>DevOps Portal</h1>
                    <p className={styles.subtitle}>Login untuk akses Deployment Table</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="username">Username</label>
                            <input
                                id="username"
                                className={styles.input}
                                type="text"
                                placeholder="devops / manager / developer"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                autoFocus
                                disabled={submitting}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="password">Password</label>
                            <input
                                id="password"
                                className={styles.input}
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                disabled={submitting}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            className={styles.btn}
                            disabled={submitting}
                        >
                            {submitting ? <><span className={styles.btnSpinner} /> Logging in…</> : 'Login'}
                        </button>
                    </form>

                    {/* Role hints */}
                    <div className={styles.hints}>
                        <p className={styles.hintsTitle}>Available roles:</p>
                        <div className={styles.hintList}>
                            {[
                                { role: 'devops', label: 'DevOps Engineer', user: 'devops' },
                                { role: 'manager', label: 'Engineering Manager', user: 'manager' },
                                { role: 'developer', label: 'Backend Developer', user: 'developer' },
                            ].map((r) => (
                                <button
                                    key={r.role}
                                    type="button"
                                    className={styles.hintChip}
                                    style={{ borderColor: ROLE_COLOR[r.role], color: ROLE_COLOR[r.role] }}
                                    title={`Login sebagai ${r.label}`}
                                    onClick={() => setUsername(r.user)}
                                >
                                    {r.role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
