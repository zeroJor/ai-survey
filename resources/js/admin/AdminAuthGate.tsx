import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLoginScreen } from '@/admin/AdminLoginScreen';
import { AdminSettingsProvider } from '@/admin/context/AdminSettingsContext';
import { AdminApiError, fetchAdminSettings } from '@/admin/lib/adminApi';
import type { AdminSettings } from '@/admin/types';

type GateState = 'loading' | 'login' | 'ready';

export function AdminAuthGate({ children }: { children: ReactNode }) {
    const [searchParams] = useSearchParams();
    const googleDenied = searchParams.get('auth') === 'denied';
    const [state, setState] = useState<GateState>('loading');
    const [settings, setSettings] = useState<AdminSettings | null>(null);

    const loadSettings = useCallback(async () => {
        const data = await fetchAdminSettings();
        setSettings(data);
        setState('ready');
    }, []);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            try {
                await loadSettings();
            } catch (error) {
                if (cancelled) {
                    return;
                }
                if (error instanceof AdminApiError && error.status === 401) {
                    setState('login');
                    return;
                }
                setState('login');
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [loadSettings]);

    if (state === 'loading') {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
                <p className="text-sm text-gray-600">Cargando panel…</p>
            </main>
        );
    }

    if (state === 'login') {
        return (
            <AdminLoginScreen
                googleDenied={googleDenied}
                onSuccess={() => {
                    void loadSettings().catch(() => setState('login'));
                }}
            />
        );
    }

    if (!settings) {
        return null;
    }

    return (
        <AdminSettingsProvider initialSettings={settings}>
            {children}
        </AdminSettingsProvider>
    );
}
