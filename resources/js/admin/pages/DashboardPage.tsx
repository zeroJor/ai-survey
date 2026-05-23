import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminInvites } from '@/admin/lib/adminApi';
import type { AdminInviteListItem, InviteDisplayStatus } from '@/admin/types';

const FILTERS: { value: string; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'in_progress', label: 'En curso' },
    { value: 'completed', label: 'Completadas' },
    { value: 'not_started', label: 'Sin empezar' },
    { value: 'revoked', label: 'Revocadas' },
];

function statusLabel(status: InviteDisplayStatus): string {
    switch (status) {
        case 'revoked':
            return 'Revocada';
        case 'completed':
            return 'Completada';
        case 'in_progress':
            return 'En curso';
        default:
            return 'Sin empezar';
    }
}

function formatDate(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleString('es-MX', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

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
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                    Invitaciones
                </h2>
                <Link
                    to="/admin/invites/new"
                    className="rounded-lg bg-[#0077FF] px-4 py-2 text-sm font-medium text-white"
                >
                    Nueva invitación
                </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((item) => (
                    <button
                        key={item.value || 'all'}
                        type="button"
                        className={`rounded-full px-3 py-1 text-sm ${
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
                <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    Contacto
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Negocio
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Estado
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Progreso
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Creada
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Última actividad
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invites.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        No hay invitaciones con este filtro.
                                    </td>
                                </tr>
                            ) : (
                                invites.map((invite) => (
                                    <tr
                                        key={invite.id}
                                        className="border-b border-gray-100 last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/admin/invites/${invite.id}`}
                                                className="font-medium text-[#0077FF] hover:underline"
                                            >
                                                {invite.contactName}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            {invite.businessName}
                                        </td>
                                        <td className="px-4 py-3">
                                            {statusLabel(invite.displayStatus)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {invite.progress.answered}/
                                            {invite.progress.total}
                                        </td>
                                        <td className="px-4 py-3">
                                            {formatDate(invite.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {formatDate(invite.lastActivityAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
