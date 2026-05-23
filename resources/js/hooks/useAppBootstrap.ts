import { useEffect, useState } from 'react';
import { runAppBootstrap, type BootstrapResult } from '@/lib/bootstrap';
import type { TalkBootstrap } from '@/types/talk';

export interface AppBootstrapState {
    ready: boolean;
    bootstrap: TalkBootstrap | null;
    unauthorized: boolean;
    error: Error | null;
}

export function useAppBootstrap(): AppBootstrapState {
    const [state, setState] = useState<AppBootstrapState>({
        ready: false,
        bootstrap: null,
        unauthorized: false,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        void runAppBootstrap().then((result: BootstrapResult) => {
            if (cancelled) {
                return;
            }

            if (result.ok) {
                setState({
                    ready: true,
                    bootstrap: result.data,
                    unauthorized: false,
                    error: null,
                });
                return;
            }

            setState({
                ready: true,
                bootstrap: null,
                unauthorized: result.unauthorized,
                error: result.error ?? null,
            });
        });

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
