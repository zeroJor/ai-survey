import { Route, Routes } from 'react-router-dom';
import { AdminAuthGate } from '@/admin/AdminAuthGate';
import { AdminLayout } from '@/admin/AdminLayout';
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { InviteDetailPage } from '@/admin/pages/InviteDetailPage';
import { InviteNewPage } from '@/admin/pages/InviteNewPage';
import { SettingsPage } from '@/admin/pages/SettingsPage';

export default function AdminApp() {
    return (
        <AdminAuthGate>
            <Routes>
                <Route element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="invites/new" element={<InviteNewPage />} />
                    <Route path="invites/:id" element={<InviteDetailPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </AdminAuthGate>
    );
}
