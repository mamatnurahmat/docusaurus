import React from 'react';
import { AuthProvider } from '../context/AuthContext';

// Docusaurus Root wrapper — injects AuthProvider for the entire app
export default function Root({ children }: { children: React.ReactNode }): React.ReactElement {
    return <AuthProvider>{children}</AuthProvider>;
}
