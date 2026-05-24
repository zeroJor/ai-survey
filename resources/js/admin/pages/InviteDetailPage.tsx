import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAdminSettings } from '@/admin/context/AdminSettingsContext';
import {
    fetchAdminInvite,
    fetchInterviewReview,
    generateInterviewSummary,
    resendInviteCopy,
    revokeAdminInvite,
} from '@/admin/lib/adminApi';
import { InterviewChatThread } from '@/admin/components/InterviewChatThread';
import {
    ARTIFACT_SECTIONS,
    type AdminInviteDetail,
    type InterviewReview,
} from '@/admin/types';

export function InviteDetailPage() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { settings } = useAdminSettings();
    const [invite, setInvite] = useState<AdminInviteDetail | null>(null);
    const [review, setReview] = useState<InterviewReview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [resendError, setResendError] = useState<string | null>(null);
    const [resending, setResending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const inviteUrlFromNav = (
        location.state as { inviteUrl?: string } | null
    )?.inviteUrl;

    const load = useCallback(async () => {
        if (!id) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const detail = await fetchAdminInvite(id);
            setInvite(detail);

            if (detail.interview?.id) {
                const thread = await fetchInterviewReview(detail.interview.id);
                setReview(thread);
            } else {
                setReview(null);
            }
        } catch {
            setError('No pudimos cargar la invitación.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    async function handleCopy() {
        const url = invite?.inviteUrl ?? inviteUrlFromNav;
        if (!url) {
            return;
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleRevoke() {
        if (!id || !invite || invite.displayStatus === 'revoked') {
            return;
        }
        if (!window.confirm('¿Revocar este enlace? El cliente no podrá continuar.')) {
            return;
        }
        setRevoking(true);
        try {
            const updated = await revokeAdminInvite(id);
            setInvite(updated);
        } catch {
            setError('No pudimos revocar la invitación.');
        } finally {
            setRevoking(false);
        }
    }

    async function handleResendCopy() {
        if (!id || !invite?.clientEmail || invite.displayStatus !== 'completed') {
            return;
        }
        setResending(true);
        setResendMessage(null);
        setResendError(null);
        try {
            await resendInviteCopy(id);
            setResendMessage('Copia reenviada por correo.');
        } catch {
            setResendError('No pudimos reenviar la copia.');
        } finally {
            setResending(false);
        }
    }

    async function handleGenerateSummary() {
        const interviewId = invite?.interview?.id;
        if (!interviewId || !settings.llmEnabled) {
            return;
        }
        setGenerating(true);
        setAnalysisError(null);
        try {
            await generateInterviewSummary(interviewId);
            const thread = await fetchInterviewReview(interviewId);
            setReview(thread);
        } catch {
            setAnalysisError('No pudimos generar el análisis.');
        } finally {
            setGenerating(false);
        }
    }

    if (loading) {
        return <p className="text-sm text-gray-600">Cargando…</p>;
    }

    if (error || !invite) {
        return (
            <p className="text-sm text-red-600">
                {error ?? 'Invitación no encontrada.'}
            </p>
        );
    }

    const inviteUrl = invite.inviteUrl ?? inviteUrlFromNav;
    const interviewCompleted = invite.interview?.status === 'completed';
    const canGenerate =
        settings.llmEnabled && interviewCompleted && invite.interview?.id;
    const artifact = review?.artifact;

    return (
        <section className="space-y-8">
            <div>
                <Link to="/admin" className="text-sm text-[#0077FF] hover:underline">
                    ← Volver al listado
                </Link>
                <h2 className="mt-2 text-xl font-semibold text-[#1A1A1A]">
                    {invite.contactName} — {invite.businessName}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Estado: {invite.displayStatus} · Progreso{' '}
                    {invite.progress.answered}/{invite.progress.total}
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium text-[#1A1A1A]">Enlace de entrevista</h3>
                {inviteUrl ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <code className="break-all text-xs text-gray-700">
                            {inviteUrl}
                        </code>
                        <button
                            type="button"
                            className="rounded-md bg-gray-100 px-3 py-1 text-sm"
                            onClick={() => void handleCopy()}
                        >
                            {copied ? 'Copiado' : 'Copiar'}
                        </button>
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-gray-500">Sin enlace.</p>
                )}
                {invite.displayStatus !== 'revoked' && (
                    <button
                        type="button"
                        disabled={revoking}
                        className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700"
                        onClick={() => void handleRevoke()}
                    >
                        {revoking ? 'Revocando…' : 'Revocar enlace'}
                    </button>
                )}
            </div>

            {invite.clientEmail && (
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="font-medium text-[#1A1A1A]">Copia al cliente</h3>
                    <p className="mt-1 text-sm text-gray-600">{invite.clientEmail}</p>
                    {invite.displayStatus !== 'completed' && (
                        <p className="mt-2 text-sm text-gray-500">
                            Podrás reenviar la copia cuando la entrevista esté completada.
                        </p>
                    )}
                    {resendMessage && (
                        <p className="mt-2 text-sm text-green-700">{resendMessage}</p>
                    )}
                    {resendError && (
                        <p className="mt-2 text-sm text-red-600">{resendError}</p>
                    )}
                    <button
                        type="button"
                        disabled={
                            resending || invite.displayStatus !== 'completed'
                        }
                        className="mt-3 rounded-lg border border-[#0077FF] px-4 py-2 text-sm text-[#0077FF] disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                        onClick={() => void handleResendCopy()}
                    >
                        {resending ? 'Enviando…' : 'Reenviar copia por email'}
                    </button>
                </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium text-[#1A1A1A]">Conversación</h3>
                {!invite.interview ? (
                    <p className="mt-2 text-sm text-gray-600">
                        El cliente aún no ha abierto el enlace.
                    </p>
                ) : review ? (
                    <InterviewChatThread review={review} />
                ) : null}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium text-[#1A1A1A]">Análisis de estudio</h3>
                {!settings.llmEnabled && (
                    <p className="mt-2 text-sm text-amber-700">
                        El LLM está deshabilitado en Ajustes. Actívalo para generar
                        análisis con Gemini.
                    </p>
                )}
                {analysisError && (
                    <p className="mt-2 text-sm text-red-600">{analysisError}</p>
                )}
                {settings.llmEnabled && !interviewCompleted && (
                    <p className="mt-2 text-sm text-gray-600">
                        Disponible cuando el cliente complete la entrevista.
                    </p>
                )}
                {artifact?.analysis && (
                    <div className="mt-4 space-y-4">
                        {artifact.generatedAt && (
                            <p className="text-xs text-gray-500">
                                Generado:{' '}
                                {new Date(artifact.generatedAt).toLocaleString(
                                    'es-MX',
                                )}
                            </p>
                        )}
                        {ARTIFACT_SECTIONS.map(({ key, title }) => {
                            const value = artifact.analysis[key];
                            if (key === 'keyQuotes') {
                                const quotes = value as string[];
                                if (quotes.length === 0) {
                                    return null;
                                }
                                return (
                                    <div key={key}>
                                        <h4 className="text-sm font-medium text-gray-800">
                                            {title}
                                        </h4>
                                        <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                                            {quotes.map((quote) => (
                                                <li key={quote}>{quote}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            }
                            if (!value || (typeof value === 'string' && value === '')) {
                                return null;
                            }
                            return (
                                <div key={key}>
                                    <h4 className="text-sm font-medium text-gray-800">
                                        {title}
                                    </h4>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                                        {String(value)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
                <button
                    type="button"
                    disabled={!canGenerate || generating}
                    className="mt-4 rounded-lg bg-[#0077FF] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                    onClick={() => void handleGenerateSummary()}
                >
                    {generating
                        ? 'Generando…'
                        : artifact
                          ? 'Regenerar análisis'
                          : 'Generar análisis'}
                </button>
            </div>
        </section>
    );
}
