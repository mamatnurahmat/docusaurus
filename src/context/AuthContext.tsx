import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'devops' | 'manager' | 'developer';

export interface AuthUser {
    username: string;
    name: string;
    role: UserRole;
}

interface UserRecord extends AuthUser {
    password: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<'ok' | 'invalid' | 'error'>;
    logout: () => void;
}

const AUTH_KEY = 'devops_portal_session';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(AUTH_KEY);
            if (stored) {
                const parsed: AuthUser = JSON.parse(stored);
                setUser(parsed);
            }
        } catch {
            localStorage.removeItem(AUTH_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (username: string, password: string): Promise<'ok' | 'invalid' | 'error'> => {
        try {
            const res = await fetch('/data/users.json');
            if (!res.ok) throw new Error('Cannot load users');
            const users: UserRecord[] = await res.json();

            const match = users.find(
                (u) => u.username === username.trim() && u.password === password
            );

            if (!match) return 'invalid';

            const session: AuthUser = {
                username: match.username,
                name: match.name,
                role: match.role,
            };

            localStorage.setItem(AUTH_KEY, JSON.stringify(session));
            setUser(session);
            return 'ok';
        } catch {
            return 'error';
        }
    };

    const logout = () => {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
