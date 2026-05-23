import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminSettingsProvider } from '@/admin/context/AdminSettingsContext';
import {
    AdminApiError,
    fetchAdminSettings,
    redirectToGoogleLogin,
} from '@/admin/lib/adminApi';
import type { AdminSettings } from '@/admin/types';

type GateState = 'loading' | 'denied' | 'ready';

export function AdminAuthGate({ children }: { children: ReactNode }) {
    const [searchParams] = useSearchParams();
    const [state, setState] = useState<GateState>(() =>
        searchParams.get('auth') === 'denied' ? 'denied' : 'loading',
    );
    const [settings, setSettings] = useState<AdminSettings | null>(null);

    useEffect(() => {
        if (searchParams.get('auth') === 'denied') {
            setState('denied');
            return;
        }

        let cancelled = false;

        void (async () => {
            try {
                const data = await fetchAdminSettings();
                if (cancelled) {
                    return;
                }
                setSettings(data);
                setState('ready');
            } catch (error) {
                if (cancelled) {
                    return;
                }
                if (error instanceof AdminApiError && error.status === 401) {
                    redirectToGoogleLogin();
                    return;
                }
                setState('denied');
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    if (state === 'loading') {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
                <p className="text-sm text-gray-600">Cargando panel…</p>
            </main>
        );
    }

    if (state === 'denied') {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-[#0077FF]">
                    Idwasoft Studio
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-[#1A1A1A]">
                    Acceso restringido
                </h1>
                <p className="mt-4 max-w-md text-gray-600">
                    Solo cuentas <strong>@idwasoft.com</strong> pueden entrar al
                    panel de estudio.
                </p>
                <button
                    type="button"
                    className="mt-8 rounded-lg bg-[#0077FF] px-5 py-2.5 text-sm font-medium text-white"
                    onClick={() => redirectToGoogleLogin()}
                >
                    Iniciar sesión con Google
                </button>
            </main>
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
