import { ensureCsrfCookie } from '@/lib/api';
import type {
    AdminInviteDetail,
    AdminInvitesListResponse,
    AdminSettings,
    InterviewReview,
} from '@/admin/types';

const CSRF_COOKIE = 'XSRF-TOKEN';

function csrfToken(): string | null {
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`),
    );
    if (!match) {
        return null;
    }
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

export class AdminApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = 'AdminApiError';
    }
}

async function adminFetch<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const response = await fetch(path, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            ...(init.headers ?? {}),
        },
        ...init,
    });

    if (response.status === 401) {
        throw new AdminApiError('Unauthorized', 401);
    }

    const text = await response.text();
    let body: unknown = {};
    if (text) {
        body = JSON.parse(text) as unknown;
    }

    if (!response.ok) {
        const message =
            typeof body === 'object' &&
            body !== null &&
            'message' in body &&
            typeof (body as { message: unknown }).message === 'string'
                ? (body as { message: string }).message
                : 'Request failed.';
        throw new AdminApiError(message, response.status);
    }

    return body as T;
}

async function adminMutate<T>(
    path: string,
    method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    body?: unknown,
): Promise<T> {
    await ensureCsrfCookie();

    const token = csrfToken();
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['X-XSRF-TOKEN'] = token;
    }

    return adminFetch<T>(path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
    return adminFetch<AdminSettings>('/api/admin/settings');
}

export async function patchAdminSettings(
    body: Partial<AdminSettings> & {
        branding?: Partial<AdminSettings['branding']>;
    },
): Promise<AdminSettings> {
    return adminMutate<AdminSettings>('/api/admin/settings', 'PATCH', body);
}

export async function createAdminChannel(body: {
    channelKey: string;
    name: string;
    type: 'email';
    config: Record<string, unknown>;
}): Promise<AdminSettings> {
    return adminMutate<AdminSettings>('/api/admin/settings/channels', 'POST', body);
}

export async function deleteAdminChannel(
    channelKey: string,
): Promise<AdminSettings> {
    return adminMutate<AdminSettings>(
        `/api/admin/settings/channels/${encodeURIComponent(channelKey)}`,
        'DELETE',
    );
}

export async function fetchAdminInvites(params?: {
    status?: string;
    page?: number;
}): Promise<AdminInvitesListResponse> {
    const search = new URLSearchParams();
    if (params?.status) {
        search.set('status', params.status);
    }
    if (params?.page) {
        search.set('page', String(params.page));
    }
    const query = search.toString();

    return adminFetch<AdminInvitesListResponse>(
        `/api/admin/invites${query ? `?${query}` : ''}`,
    );
}

export async function createAdminInvite(body: {
    contactName: string;
    businessName: string;
    businessAbout?: string;
    clientEmail?: string;
    clientWhatsapp?: string;
}): Promise<{ invite: AdminInviteDetail; inviteUrl: string }> {
    return adminMutate('/api/admin/invites', 'POST', body);
}

export async function fetchAdminInvite(id: string): Promise<AdminInviteDetail> {
    return adminFetch<AdminInviteDetail>(`/api/admin/invites/${id}`);
}

export async function revokeAdminInvite(id: string): Promise<AdminInviteDetail> {
    return adminMutate<AdminInviteDetail>(
        `/api/admin/invites/${id}/revoke`,
        'POST',
    );
}

export async function resendInviteCopy(id: string): Promise<{
    delivery: {
        id: number;
        channelKey: string;
        status: string;
        sentAt: string | null;
    };
}> {
    return adminMutate(`/api/admin/invites/${id}/resend-copy`, 'POST');
}

export async function fetchInterviewReview(
    interviewId: string,
): Promise<InterviewReview> {
    return adminFetch<InterviewReview>(`/api/admin/interviews/${interviewId}`);
}

export async function generateInterviewSummary(
    interviewId: string,
): Promise<{ artifact: InterviewReview['artifact'] }> {
    return adminMutate(
        `/api/admin/interviews/${interviewId}/generate-summary`,
        'POST',
    );
}

export async function adminLogout(): Promise<void> {
    await adminMutate('/auth/logout', 'POST');
    window.location.href = '/admin';
}

export function redirectToGoogleLogin(): void {
    window.location.href = '/auth/google';
}
