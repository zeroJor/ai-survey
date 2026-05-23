import type { Register, Scenario } from '@/types/talk';

export function parseScenario(search: string): Scenario {
    const value = new URLSearchParams(search).get('scenario');
    const allowed: Scenario[] = [
        'default',
        'in_progress',
        'completed',
        'revoked',
        'loading_answer',
        'llm_off',
        'long_answer',
        'skip_answer',
    ];
    if (value && allowed.includes(value as Scenario)) {
        return value as Scenario;
    }
    return 'default';
}

/** Dev-only: when ?scenario=in_progress without API progress. */
export function devMockAnswers(
    questions: { code: string }[],
): { answers: { questionCode: string; body: string; skipped: boolean }[]; questionIndex: number; register: Register } {
    return {
        answers: questions.slice(0, 5).map((q) => ({
            questionCode: q.code,
            body: 'Respuesta de ejemplo para retomar la entrevista.',
            skipped: false,
        })),
        questionIndex: 5,
        register: 'usted',
    };
}

export function useLlmMode(scenario: Scenario): boolean {
    return scenario !== 'llm_off';
}

export function simulateSlowReply(scenario: Scenario): boolean {
    return scenario === 'loading_answer';
}
