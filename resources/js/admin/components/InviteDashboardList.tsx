import { Link } from 'react-router-dom';
import type { AdminInviteListItem, InviteDisplayStatus } from '@/admin/types';

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

function statusBadgeClass(status: InviteDisplayStatus): string {
    switch (status) {
        case 'completed':
            return 'bg-emerald-50 text-emerald-800 ring-emerald-200';
        case 'in_progress':
            return 'bg-[#0077FF]/10 text-[#0077FF] ring-[#0077FF]/25';
        case 'revoked':
            return 'bg-red-50 text-red-700 ring-red-200';
        default:
            return 'bg-gray-100 text-gray-600 ring-gray-200';
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

function progressPercent(invite: AdminInviteListItem): number {
    if (invite.progress.total <= 0) {
        return 0;
    }
    return Math.round(
        (invite.progress.answered / invite.progress.total) * 100,
    );
}

function InviteProgressBar({ invite }: { invite: AdminInviteListItem }) {
    const pct = progressPercent(invite);

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
                <span>Progreso</span>
                <span className="tabular-nums">
                    {invite.progress.answered}/{invite.progress.total}
                    {invite.progress.total > 0 ? ` (${pct}%)` : ''}
                </span>
            </div>
            <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso ${invite.progress.answered} de ${invite.progress.total}`}
            >
                <div
                    className="h-full rounded-full bg-[#0077FF] transition-[width]"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function InviteListCards({ invites }: { invites: AdminInviteListItem[] }) {
    if (invites.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                No hay invitaciones con este filtro.
            </p>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {invites.map((invite) => (
                <li key={invite.id}>
                    <Link
                        to={`/admin/invites/${invite.id}`}
                        className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors active:bg-gray-50"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-[#1A1A1A]">
                                    {invite.contactName}
                                </p>
                                <p className="mt-0.5 truncate text-sm text-gray-600">
                                    {invite.businessName}
                                </p>
                            </div>
                            <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(invite.displayStatus)}`}
                            >
                                {statusLabel(invite.displayStatus)}
                            </span>
                        </div>

                        <InviteProgressBar invite={invite} />

                        <dl className="mt-3 grid grid-cols-1 gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
                            <div className="flex justify-between gap-2">
                                <dt>Creada</dt>
                                <dd className="text-right text-gray-700">
                                    {formatDate(invite.createdAt)}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt>Última actividad</dt>
                                <dd className="text-right text-gray-700">
                                    {formatDate(invite.lastActivityAt)}
                                </dd>
                            </div>
                        </dl>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function InviteListTable({ invites }: { invites: AdminInviteListItem[] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-4 py-3 font-medium">Contacto</th>
                        <th className="px-4 py-3 font-medium">Negocio</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Progreso</th>
                        <th className="px-4 py-3 font-medium">Creada</th>
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
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(invite.displayStatus)}`}
                                    >
                                        {statusLabel(invite.displayStatus)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 tabular-nums">
                                    {invite.progress.answered}/
                                    {invite.progress.total}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {formatDate(invite.createdAt)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {formatDate(invite.lastActivityAt)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

interface Props {
    invites: AdminInviteListItem[];
}

export function InviteDashboardList({ invites }: Props) {
    return (
        <>
            <div className="md:hidden">
                <InviteListCards invites={invites} />
            </div>
            <div className="hidden md:block">
                <InviteListTable invites={invites} />
            </div>
        </>
    );
}
