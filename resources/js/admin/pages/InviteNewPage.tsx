import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAdminInvite } from '@/admin/lib/adminApi';

export function InviteNewPage() {
    const navigate = useNavigate();
    const [contactName, setContactName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [businessAbout, setBusinessAbout] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientWhatsapp, setClientWhatsapp] = useState('');
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const result = await createAdminInvite({
                contactName,
                businessName,
                businessAbout: businessAbout || undefined,
                clientEmail: clientEmail || undefined,
                clientWhatsapp: clientWhatsapp || undefined,
            });
            setInviteUrl(result.inviteUrl);
            navigate(`/admin/invites/${result.invite.id}`, {
                state: { inviteUrl: result.inviteUrl },
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'No pudimos crear la invitación.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="max-w-xl">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">
                Nueva invitación
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Indica al menos email o WhatsApp del cliente.
            </p>

            <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
                <label className="block text-sm">
                    <span className="font-medium text-gray-700">
                        Nombre de contacto
                    </span>
                    <input
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                    />
                </label>
                <label className="block text-sm">
                    <span className="font-medium text-gray-700">Negocio</span>
                    <input
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                    />
                </label>
                <label className="block text-sm">
                    <span className="font-medium text-gray-700">
                        Sobre el negocio (opcional)
                    </span>
                    <textarea
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                        rows={3}
                        value={businessAbout}
                        onChange={(e) => setBusinessAbout(e.target.value)}
                    />
                </label>
                <label className="block text-sm">
                    <span className="font-medium text-gray-700">Email</span>
                    <input
                        type="email"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                    />
                </label>
                <label className="block text-sm">
                    <span className="font-medium text-gray-700">WhatsApp</span>
                    <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={clientWhatsapp}
                        onChange={(e) => setClientWhatsapp(e.target.value)}
                    />
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-[#0077FF] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {submitting ? 'Creando…' : 'Crear invitación'}
                    </button>
                    <Link
                        to="/admin"
                        className="rounded-lg px-4 py-2 text-sm text-gray-600 ring-1 ring-gray-200"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>

            {inviteUrl && (
                <p className="mt-4 text-sm text-gray-600">
                    Enlace generado (también en el detalle).
                </p>
            )}
        </section>
    );
}
