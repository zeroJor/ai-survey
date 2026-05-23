import logoIdwasoft from '@/assets/logo-idwasoft.svg';
import patternDots from '@/assets/pattern.svg';
import { fetchTalk, TalkApiError } from '@/lib/api';
import { assistantPortraitUrls } from '@/lib/assistantGestures';
import type { TalkBootstrap } from '@/types/talk';
import { APP_BOOTSTRAP_MS } from '@/lib/timing';

const STATIC_ASSETS = [logoIdwasoft, patternDots] as const;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
    });
}

export function preloadInterviewAssets(): Promise<void> {
    const urls = [
        ...new Set([...assistantPortraitUrls(), ...STATIC_ASSETS]),
    ];
    return Promise.all(urls.map((src) => preloadImage(src))).then(() => undefined);
}

export function applyBranding(branding: TalkBootstrap['branding']): void {
    const root = document.documentElement;
    root.style.setProperty(
        '--idwa-primary',
        branding.primaryColor ?? '#00B4FF',
    );
    root.style.setProperty(
        '--idwa-accent',
        branding.accentColor ?? '#0077FF',
    );
}

export type BootstrapResult =
    | { ok: true; data: TalkBootstrap }
    | { ok: false; unauthorized: boolean; error?: Error };

export async function runAppBootstrap(): Promise<BootstrapResult> {
    const started = performance.now();

    try {
        const [data] = await Promise.all([
            fetchTalk(),
            preloadInterviewAssets(),
        ]);

        applyBranding(data.branding);

        const remaining = APP_BOOTSTRAP_MS - (performance.now() - started);
        if (remaining > 0) {
            await delay(remaining);
        }

        return { ok: true, data };
    } catch (error) {
        if (error instanceof TalkApiError && error.status === 401) {
            return { ok: false, unauthorized: true };
        }

        return {
            ok: false,
            unauthorized: false,
            error: error instanceof Error ? error : new Error('Bootstrap failed'),
        };
    }
}
