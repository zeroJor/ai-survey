import { NavLink, Outlet } from 'react-router-dom';
import { adminLogout } from '@/admin/lib/adminApi';

const navClass = ({ isActive }: { isActive: boolean }) =>
    [
        'rounded-md px-3 py-2 text-sm font-medium',
        isActive
            ? 'bg-[#0077FF]/10 text-[#0077FF]'
            : 'text-gray-600 hover:bg-gray-100 hover:text-[#1A1A1A]',
    ].join(' ');

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#0077FF]">
                            Idwasoft Studio
                        </p>
                        <h1 className="text-lg font-semibold text-[#1A1A1A]">
                            Admin
                        </h1>
                    </div>
                    <nav className="flex flex-wrap items-center gap-1">
                        <NavLink to="/admin" end className={navClass}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/admin/invites/new" className={navClass}>
                            Nueva invitación
                        </NavLink>
                        <NavLink to="/admin/settings" className={navClass}>
                            Ajustes
                        </NavLink>
                        <button
                            type="button"
                            className="ml-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            onClick={() => void adminLogout()}
                        >
                            Cerrar sesión
                        </button>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
