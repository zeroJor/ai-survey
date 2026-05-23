import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';
import type { TalkBootstrap } from '@/types/talk';

interface TalkBootstrapContextValue {
    bootstrap: TalkBootstrap;
    setBootstrap: Dispatch<SetStateAction<TalkBootstrap>>;
    bootstrapReady: boolean;
    unauthorized: boolean;
    bootstrapError: Error | null;
}

const TalkBootstrapContext = createContext<TalkBootstrapContextValue | null>(
    null,
);

export function TalkBootstrapProvider({
    children,
    initialBootstrap,
    bootstrapReady = false,
    unauthorized = false,
    bootstrapError = null,
}: {
    children: ReactNode;
    initialBootstrap: TalkBootstrap;
    bootstrapReady?: boolean;
    unauthorized?: boolean;
    bootstrapError?: Error | null;
}) {
    const [bootstrap, setBootstrapState] =
        useState<TalkBootstrap>(initialBootstrap);

    useEffect(() => {
        setBootstrapState(initialBootstrap);
    }, [initialBootstrap]);

    const setBootstrap = useCallback(
        (data: SetStateAction<TalkBootstrap>) => {
            setBootstrapState(data);
        },
        [],
    );

    const value = useMemo(
        () => ({
            bootstrap,
            setBootstrap,
            bootstrapReady,
            unauthorized,
            bootstrapError,
        }),
        [bootstrap, setBootstrap, bootstrapReady, unauthorized, bootstrapError],
    );

    return (
        <TalkBootstrapContext.Provider value={value}>
            {children}
        </TalkBootstrapContext.Provider>
    );
}

export function useTalkBootstrap(): TalkBootstrapContextValue {
    const ctx = useContext(TalkBootstrapContext);
    if (!ctx) {
        throw new Error('useTalkBootstrap must be used within TalkBootstrapProvider');
    }
    return ctx;
}
