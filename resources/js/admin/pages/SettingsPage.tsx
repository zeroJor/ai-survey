import { useState } from 'react';
import {
    createAdminChannel,
    deleteAdminChannel,
    patchAdminSettings,
} from '@/admin/lib/adminApi';
import { useAdminSettings } from '@/admin/context/AdminSettingsContext';
import type { AdminSettings } from '@/admin/types';

export function SettingsPage() {
    const { settings, setSettings } = useAdminSettings();
    const [form, setForm] = useState<AdminSettings>(settings);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [channelKey, setChannelKey] = useState('');
    const [channelEmail, setChannelEmail] = useState('');

    async function handleSave(event: React.FormEvent) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const updated = await patchAdminSettings({
                studioProcess: form.studioProcess,
                llmEnabled: form.llmEnabled,
                privacyNoticeUrl: form.privacyNoticeUrl,
                branding: form.branding,
            });
            setSettings(updated);
            setForm(updated);
            setMessage('Ajustes guardados.');
        } catch {
            setMessage('No pudimos guardar los ajustes.');
        } finally {
            setSaving(false);
        }
    }

    async function handleAddChannel(event: React.FormEvent) {
        event.preventDefault();
        if (!channelKey || !channelEmail) {
            return;
        }
        try {
            const updated = await createAdminChannel({
                channelKey,
                name: `Email ${channelKey}`,
                type: 'email',
                config: {
                    toAddresses: [channelEmail],
                    fromAddress: 'hola@idwasoft.com',
                    fromName: 'Idwasoft',
                },
            });
            setSettings(updated);
            setForm(updated);
            setChannelKey('');
            setChannelEmail('');
        } catch {
            setMessage('No pudimos añadir el canal.');
        }
    }

    async function handleDeleteChannel(key: string) {
        if (!window.confirm(`¿Eliminar canal ${key}?`)) {
            return;
        }
        const updated = await deleteAdminChannel(key);
        setSettings(updated);
        setForm(updated);
    }

    return (
        <section className="max-w-2xl space-y-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Ajustes</h2>

            <form className="space-y-4 rounded-lg border border-gray-200 bg-white p-6" onSubmit={(e) => void handleSave(e)}>
                <label className="block text-sm">
                    <span className="font-medium">Proceso del estudio</span>
                    <textarea
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                        rows={4}
                        value={form.studioProcess ?? ''}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                studioProcess: e.target.value,
                            }))
                        }
                    />
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.llmEnabled}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                llmEnabled: e.target.checked,
                            }))
                        }
                    />
                    <span>LLM habilitado (Gemini Flash)</span>
                </label>

                <label className="block text-sm">
                    <span className="font-medium">URL aviso de privacidad</span>
                    <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={form.privacyNoticeUrl ?? ''}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                privacyNoticeUrl: e.target.value,
                            }))
                        }
                    />
                </label>

                <fieldset className="space-y-2 border-t border-gray-100 pt-4">
                    <legend className="text-sm font-medium">Marca</legend>
                    {(
                        [
                            ['displayName', 'Nombre'],
                            ['primaryColor', 'Color primario'],
                            ['accentColor', 'Color acento'],
                            ['logoUrl', 'Logo URL'],
                            ['logoAlt', 'Logo alt'],
                            ['tagline', 'Tagline'],
                        ] as const
                    ).map(([key, label]) => (
                        <label key={key} className="block text-sm">
                            <span className="text-gray-600">{label}</span>
                            <input
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                value={form.branding[key] ?? ''}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        branding: {
                                            ...f.branding,
                                            [key]: e.target.value,
                                        },
                                    }))
                                }
                            />
                        </label>
                    ))}
                </fieldset>

                {message && (
                    <p className="text-sm text-gray-600">{message}</p>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#0077FF] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                    {saving ? 'Guardando…' : 'Guardar ajustes'}
                </button>
            </form>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-medium text-[#1A1A1A]">
                    Canales de email (alertas)
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                    {form.channels.length === 0 ? (
                        <li className="text-gray-500">Ningún canal configurado.</li>
                    ) : (
                        form.channels.map((ch) => (
                            <li
                                key={ch.channelKey}
                                className="flex items-center justify-between gap-2 rounded bg-gray-50 px-3 py-2"
                            >
                                <span>
                                    {ch.name} ({ch.channelKey}) —{' '}
                                    {Array.isArray(ch.config.toAddresses)
                                        ? (ch.config.toAddresses as string[]).join(', ')
                                        : ''}
                                </span>
                                <button
                                    type="button"
                                    className="text-red-600"
                                    onClick={() => void handleDeleteChannel(ch.channelKey)}
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))
                    )}
                </ul>

                <form
                    className="mt-4 flex flex-wrap gap-2"
                    onSubmit={(e) => void handleAddChannel(e)}
                >
                    <input
                        placeholder="channel_key"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={channelKey}
                        onChange={(e) => setChannelKey(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="email@idwasoft.com"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={channelEmail}
                        onChange={(e) => setChannelEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
                    >
                        Añadir canal
                    </button>
                </form>
            </div>
        </section>
    );
}
