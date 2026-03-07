import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav/MobileBottomNav';

// Docusaurus Root wrapper — injects AuthProvider and MobileBottomNav for the entire app
export default function Root({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
        <AuthProvider>
            {children}
            <MobileBottomNav />
        </AuthProvider>
    );
}

