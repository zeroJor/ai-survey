import { devMockAnswers } from '@/flow/scenario';
import type {
    AnswerRecord,
    InterviewStatus,
    Register,
    Scenario,
    TalkBootstrap,
    TalkProgress,
} from '@/types/talk';

export type FlowStep =
    | 'assistantIntro'
    | 'privacy'
    | 'tone'
    | 'phaseTransition'
    | 'question'
    | 'microReply'
    | 'farewell'
    | 'revoked';

export function progressToAnswers(progress: TalkProgress): AnswerRecord[] {
    return Object.entries(progress.answers).map(([questionCode, answer]) => ({
        questionCode,
        body: answer.body ?? '',
        skipped: answer.skipped,
    }));
}

export function questionIndexFromCode(
    questions: { code: string }[],
    code: string | null,
): number {
    if (!code) {
        return 0;
    }
    const index = questions.findIndex((q) => q.code === code);
    return index >= 0 ? index : 0;
}

function apiStatusToFlowStep(
    status: InterviewStatus,
    scenario: Scenario,
): FlowStep {
    if (status === 'revoked') {
        return 'revoked';
    }
    if (status === 'completed') {
        return 'farewell';
    }
    if (status === 'in_progress') {
        return 'question';
    }

    if (import.meta.env.DEV && scenario === 'revoked') {
        return 'revoked';
    }
    if (scenario === 'completed') {
        return 'farewell';
    }
    if (scenario === 'in_progress') {
        return 'question';
    }

    return 'assistantIntro';
}

export function initialFlowState(
    bootstrap: TalkBootstrap,
    scenario: Scenario,
): {
    flowStep: FlowStep;
    register: Register | null;
    questionIndex: number;
    answers: AnswerRecord[];
    toneSelected: Register | null;
} {
    const { content, progress, register, status } = bootstrap;
    const flowStep = apiStatusToFlowStep(status, scenario);

    let answers = progressToAnswers(progress);

    let questionIndex = 0;
    let effectiveRegister: Register | null =
        register ??
        (scenario === 'completed' ? 'usted' : null);

    if (
        import.meta.env.DEV &&
        scenario === 'in_progress' &&
        status === 'not_started' &&
        answers.length === 0
    ) {
        const mock = devMockAnswers(content.questions);
        answers = mock.answers;
        questionIndex = mock.questionIndex;
        effectiveRegister = mock.register;
    } else if (flowStep === 'question') {
        questionIndex = questionIndexFromCode(
            content.questions,
            progress.currentQuestionCode,
        );
        if (answers.length > 0) {
            const answeredCodes = new Set(answers.map((a) => a.questionCode));
            const firstUnanswered = content.questions.findIndex(
                (q) => !answeredCodes.has(q.code),
            );
            if (firstUnanswered >= 0) {
                questionIndex = firstUnanswered;
            }
        }
        if (status === 'in_progress' && register) {
            effectiveRegister = register;
        }
    }

    return {
        flowStep,
        register: effectiveRegister,
        questionIndex,
        answers,
        toneSelected: effectiveRegister,
    };
}
