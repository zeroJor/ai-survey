import { useState, type FormEvent } from 'react';
import { adminLogin, redirectToGoogleLogin } from '@/admin/lib/adminApi';

interface Props {
    googleDenied?: boolean;
    onSuccess: () => void;
}

export function AdminLoginScreen({ googleDenied = false, onSuccess }: Props) {
    const [email, setEmail] = useState('dev@idwasoft.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await adminLogin(email, password);
            onSuccess();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'No pudimos iniciar sesión.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
            <div className="w-full max-w-sm">
                <p className="text-center text-sm font-medium uppercase tracking-wide text-[#0077FF]">
                    Idwasoft Studio
                </p>
                <h1 className="mt-2 text-center text-2xl font-semibold text-[#1A1A1A]">
                    Iniciar sesión
                </h1>

                {googleDenied && (
                    <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        Tu cuenta de Google no tiene acceso. Usa un correo{' '}
                        <strong>@idwasoft.com</strong> o las credenciales de
                        desarrollo.
                    </p>
                )}

                <form className="mt-8 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
                    <div>
                        <label
                            htmlFor="admin-email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Correo
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            autoComplete="username"
                            required
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="admin-password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Contraseña
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-600" role="alert">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-[#0077FF] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {submitting ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-gray-500">
                    Local: <code className="text-gray-700">dev@idwasoft.com</code>{' '}
                    / <code className="text-gray-700">password</code> (tras seed)
                </p>

                <button
                    type="button"
                    className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
                    onClick={() => redirectToGoogleLogin()}
                >
                    Continuar con Google
                </button>
            </div>
        </main>
    );
}
