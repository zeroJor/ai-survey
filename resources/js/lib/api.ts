import type { PostAnswerResponse, TalkBootstrap } from '@/types/talk';

const CSRF_COOKIE = 'XSRF-TOKEN';

export class TalkApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = 'TalkApiError';
    }
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

function csrfToken(): string | null {
    const raw = getCookie(CSRF_COOKIE);
    if (!raw) {
        return null;
    }
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

async function parseJson<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) {
        return {} as T;
    }
    return JSON.parse(text) as T;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
        return parseJson<T>(response);
    }

    const body = await response.text();
    let message = 'Request failed.';
    try {
        const parsed = JSON.parse(body) as { message?: string };
        if (parsed.message) {
            message = parsed.message;
        }
    } catch {
        // ignore
    }

    throw new TalkApiError(message, response.status);
}

export async function ensureCsrfCookie(): Promise<void> {
    await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
    });
}

export async function apiGet<T>(path: string): Promise<T> {
    const response = await fetch(`/api${path}`, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
        },
    });

    return handleResponse<T>(response);
}

export async function fetchTalk(): Promise<TalkBootstrap> {
    return apiGet<TalkBootstrap>('/talk');
}

function mergeBootstrapProgress(
    bootstrap: TalkBootstrap,
    progress: TalkBootstrap['progress'],
): TalkBootstrap {
    return {
        ...bootstrap,
        progress,
    };
}

export async function postAnswer(body: {
    questionCode: string;
    answer: string;
    skipped: boolean;
}): Promise<PostAnswerResponse> {
    await ensureCsrfCookie();
    const { data } = await apiMutate<PostAnswerResponse>(
        '/answers',
        'POST',
        body,
    );
    return data;
}

export async function postTalkComplete(): Promise<TalkBootstrap> {
    await ensureCsrfCookie();
    const { data } = await apiMutate<TalkBootstrap>(
        '/talk/complete',
        'POST',
    );
    return data;
}

export { mergeBootstrapProgress };

export async function patchTalk(body: {
    register: 'tu' | 'usted';
}): Promise<TalkBootstrap> {
    await ensureCsrfCookie();

    const token = csrfToken();
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['X-XSRF-TOKEN'] = token;
    }

    const response = await fetch('/api/talk', {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify(body),
    });

    return handleResponse<TalkBootstrap>(response);
}

export async function apiMutate<T>(
    path: string,
    method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    body?: unknown,
): Promise<{ data: T; status: number }> {
    const token = csrfToken();
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['X-XSRF-TOKEN'] = token;
    }

    const response = await fetch(`/api${path}`, {
        method,
        credentials: 'include',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await handleResponse<T>(response);

    return {
        data,
        status: response.status,
    };
}
