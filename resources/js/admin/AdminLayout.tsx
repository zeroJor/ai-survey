import { Outlet } from 'react-router-dom';
import { AdminHeader } from '@/admin/AdminHeader';

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader />
            <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">
                <Outlet />
            </main>
        </div>
    );
}
