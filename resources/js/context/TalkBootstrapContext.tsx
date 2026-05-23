import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';
import type { TalkBootstrap } from '@/types/talk';

interface TalkBootstrapContextValue {
    bootstrap: TalkBootstrap | null;
    setBootstrap: Dispatch<SetStateAction<TalkBootstrap | null>>;
    unauthorized: boolean;
    bootstrapError: Error | null;
}

const TalkBootstrapContext = createContext<TalkBootstrapContextValue | null>(
    null,
);

export function TalkBootstrapProvider({
    children,
    initialBootstrap,
    unauthorized = false,
    bootstrapError = null,
}: {
    children: ReactNode;
    initialBootstrap: TalkBootstrap | null;
    unauthorized?: boolean;
    bootstrapError?: Error | null;
}) {
    const [bootstrap, setBootstrapState] = useState<TalkBootstrap | null>(
        initialBootstrap,
    );

    const setBootstrap = useCallback(
        (data: SetStateAction<TalkBootstrap | null>) => {
            setBootstrapState(data);
        },
        [],
    );

    const value = useMemo(
        () => ({
            bootstrap,
            setBootstrap,
            unauthorized,
            bootstrapError,
        }),
        [bootstrap, setBootstrap, unauthorized, bootstrapError],
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
