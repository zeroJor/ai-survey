import { useEffect, useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { adminLogout } from '@/admin/lib/adminApi';

type NavItem = {
    to: string;
    label: string;
    end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
    { to: '/admin', end: true, label: 'Dashboard' },
    { to: '/admin/invites/new', label: 'Nueva invitación' },
    { to: '/admin/settings', label: 'Ajustes' },
];

const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
    [
        'rounded-md px-3 py-2 text-sm font-medium',
        isActive
            ? 'bg-[#0077FF]/10 text-[#0077FF]'
            : 'text-gray-600 hover:bg-gray-100 hover:text-[#1A1A1A]',
    ].join(' ');

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    [
        'block rounded-lg px-4 py-3 text-base font-medium',
        isActive
            ? 'bg-[#0077FF]/10 text-[#0077FF]'
            : 'text-[#1A1A1A] hover:bg-gray-100',
    ].join(' ');

function BrandBlock() {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#0077FF]">
                Idwasoft Studio
            </p>
            <h1 className="text-lg font-semibold text-[#1A1A1A]">Admin</h1>
        </div>
    );
}

function MenuIcon({ open }: { open: boolean }) {
    return (
        <svg
            className="h-6 w-6 text-[#1A1A1A]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
        >
            {open ? (
                <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                </>
            ) : (
                <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                </>
            )}
        </svg>
    );
}

export function AdminHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuId = useId();
    const location = useLocation();

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [menuOpen]);

    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
                <BrandBlock />

                <nav
                    className="hidden items-center gap-1 md:flex"
                    aria-label="Navegación principal"
                >
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end === true}
                            className={desktopNavClass}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <button
                        type="button"
                        className="ml-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        onClick={() => void adminLogout()}
                    >
                        Cerrar sesión
                    </button>
                </nav>

                <button
                    type="button"
                    className="inline-flex rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
                    aria-expanded={menuOpen}
                    aria-controls={menuId}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <MenuIcon open={menuOpen} />
                </button>
            </div>

            {menuOpen && (
                <div className="md:hidden">
                    <button
                        type="button"
                        className="fixed inset-0 z-40 bg-black/40"
                        aria-label="Cerrar menú"
                        onClick={() => setMenuOpen(false)}
                    />
                    <nav
                        id={menuId}
                        className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,18rem)] flex-col bg-white shadow-xl"
                        aria-label="Menú móvil"
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                                Menú
                            </p>
                            <button
                                type="button"
                                className="rounded-lg p-2 hover:bg-gray-100"
                                aria-label="Cerrar menú"
                                onClick={() => setMenuOpen(false)}
                            >
                                <MenuIcon open />
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                            {NAV_ITEMS.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end === true}
                                    className={mobileNavClass}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 p-3">
                            <button
                                type="button"
                                className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-600 hover:bg-gray-100"
                                onClick={() => void adminLogout()}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
