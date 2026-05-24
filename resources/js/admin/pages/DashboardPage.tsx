import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InviteDashboardList } from '@/admin/components/InviteDashboardList';
import { fetchAdminInvites } from '@/admin/lib/adminApi';
import type { AdminInviteListItem } from '@/admin/types';

const FILTERS: { value: string; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'in_progress', label: 'En curso' },
    { value: 'completed', label: 'Completadas' },
    { value: 'not_started', label: 'Sin empezar' },
    { value: 'revoked', label: 'Revocadas' },
];

export function DashboardPage() {
    const [filter, setFilter] = useState('');
    const [invites, setInvites] = useState<AdminInviteListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAdminInvites({
                status: filter || undefined,
            });
            setInvites(response.data);
        } catch {
            setError('No pudimos cargar las invitaciones.');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                    Invitaciones
                </h2>
                <Link
                    to="/admin/invites/new"
                    className="inline-flex justify-center rounded-lg bg-[#0077FF] px-4 py-2.5 text-sm font-medium text-white sm:py-2"
                >
                    Nueva invitación
                </Link>
            </div>

            <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {FILTERS.map((item) => (
                    <button
                        key={item.value || 'all'}
                        type="button"
                        className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                            filter === item.value
                                ? 'bg-[#0077FF] text-white'
                                : 'bg-white text-gray-600 ring-1 ring-gray-200'
                        }`}
                        onClick={() => setFilter(item.value)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-gray-600">Cargando…</p>
            ) : (
                <div className="mt-6">
                    <InviteDashboardList invites={invites} />
                </div>
            )}
        </section>
    );
}
