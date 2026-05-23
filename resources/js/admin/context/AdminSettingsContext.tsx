import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { fetchAdminSettings } from '@/admin/lib/adminApi';
import type { AdminSettings } from '@/admin/types';

interface AdminSettingsContextValue {
    settings: AdminSettings;
    setSettings: (settings: AdminSettings) => void;
    refetchSettings: () => Promise<AdminSettings>;
}

const AdminSettingsContext = createContext<AdminSettingsContextValue | null>(
    null,
);

export function AdminSettingsProvider({
    initialSettings,
    children,
}: {
    initialSettings: AdminSettings;
    children: ReactNode;
}) {
    const [settings, setSettings] = useState(initialSettings);

    const refetchSettings = useCallback(async () => {
        const data = await fetchAdminSettings();
        setSettings(data);
        return data;
    }, []);

    const value = useMemo(
        () => ({ settings, setSettings, refetchSettings }),
        [settings, refetchSettings],
    );

    return (
        <AdminSettingsContext.Provider value={value}>
            {children}
        </AdminSettingsContext.Provider>
    );
}

export function useAdminSettings(): AdminSettingsContextValue {
    const value = useContext(AdminSettingsContext);
    if (!value) {
        throw new Error('useAdminSettings requires AdminSettingsProvider');
    }
    return value;
}
