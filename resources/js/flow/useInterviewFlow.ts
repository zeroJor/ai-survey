import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fillTemplate } from '@/data/mockInvite';
import { useTalkBootstrap } from '@/context/TalkBootstrapContext';
import {
    mergeBootstrapProgress,
    patchTalk,
    postAnswer,
    postTalkComplete,
    TalkApiError,
} from '@/lib/api';
import {
    gestureById,
    microReplyLoadingGesture,
    type AssistantGesture,
    type AssistantGestureId,
} from '@/lib/assistantGestures';
import {
    initialFlowState,
    progressToAnswers,
    type FlowStep,
} from '@/lib/flowInit';
import {
    confirmationHoldMs,
    microReplyLoadMs,
    phaseIntroHoldMs,
} from '@/lib/timing';
import type {
    AnswerRecord,
    Register,
    Scenario,
    TalkBootstrap,
} from '@/types/talk';
import { simulateSlowReply } from './scenario';

export const QUESTION_SECTION_COUNT = 5;

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGestureId(value: string): value is AssistantGestureId {
    return [
        'atenta',
        'smile',
        'think',
        'nod',
        'sorprendida',
        'complice',
        'risa',
        'seria',
        'enSerio',
        'sarcasmo',
    ].includes(value);
}

export function useInterviewFlow(scenario: Scenario) {
    const { bootstrap, setBootstrap } = useTalkBootstrap();
    if (!bootstrap) {
        throw new Error('useInterviewFlow requires bootstrap');
    }

    const content = bootstrap.content;
    const invite = bootstrap.invite;
    const questionList = content.questions;
    const initial = useMemo(
        () => initialFlowState(bootstrap, scenario),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
        [],
    );

    const [flowStep, setFlowStep] = useState<FlowStep>(initial.flowStep);
    const [register, setRegister] = useState<Register | null>(initial.register);
    const [questionIndex, setQuestionIndex] = useState(initial.questionIndex);
    const [answers, setAnswers] = useState<AnswerRecord[]>(initial.answers);
    const [draftBody, setDraftBody] = useState(
        scenario === 'long_answer'
            ? 'Esta es una respuesta larga de prueba para ver cómo se comporta el campo de texto cuando el cliente escribe varios párrafos sobre su negocio, sus clientes y lo que espera de la nueva página web.'
            : '',
    );
    const [draftSkipped, setDraftSkipped] = useState(scenario === 'skip_answer');
    const [microReply, setMicroReply] = useState<string | null>(null);
    const [microReplyGesture, setMicroReplyGesture] =
        useState<AssistantGesture | null>(null);
    const [microReplyLoading, setMicroReplyLoading] = useState(false);
    const [toneSelected, setToneSelected] = useState<Register | null>(
        initial.toneSelected,
    );
    const [pendingPhaseCode, setPendingPhaseCode] = useState<string | null>(
        null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [patchError, setPatchError] = useState<string | null>(null);
    const [answerError, setAnswerError] = useState<string | null>(null);
    const [completeError, setCompleteError] = useState<string | null>(null);
    const completeRequested = useRef(false);

    const currentQuestion = questionList[questionIndex] ?? null;
    const currentPhase = currentQuestion
        ? content.phases.find((p) => p.code === currentQuestion.phaseCode)
        : content.phases[0];

    const answeredCount = answers.length;
    const progressPercent =
        questionList.length > 0
            ? Math.round((answeredCount / questionList.length) * 100)
            : 0;

    const goToNextQuestion = useCallback((fromIndex: number) => {
        const nextIndex = fromIndex + 1;

        if (nextIndex >= questionList.length) {
            setQuestionIndex(nextIndex);
            setFlowStep('farewell');
            setMicroReply(null);
            setMicroReplyGesture(null);
            setMicroReplyLoading(false);
            return;
        }

        setQuestionIndex(nextIndex);
        setFlowStep('question');
        setDraftBody('');
        setDraftSkipped(false);
        setMicroReply(null);
        setMicroReplyGesture(null);
        setMicroReplyLoading(false);
    }, [questionList.length]);

    const confirmAssistantIntro = useCallback(() => {
        setFlowStep('privacy');
    }, []);

    const confirmPrivacy = useCallback(() => {
        setFlowStep('tone');
    }, []);

    const selectTone = useCallback((value: Register) => {
        setToneSelected(value);
    }, []);

    const restoreDraftForQuestion = useCallback(
        (index: number) => {
            const question = questionList[index];
            if (!question) {
                setDraftBody('');
                setDraftSkipped(false);
                return;
            }
            const saved = answers.find((a) => a.questionCode === question.code);
            setDraftBody(saved?.body ?? '');
            setDraftSkipped(saved?.skipped ?? false);
        },
        [answers, questionList],
    );

    const showPhaseIntro = useCallback(
        async (phaseCode: string) => {
            const phase = content.phases.find((p) => p.code === phaseCode);
            const title = phase?.title ?? '';
            setPendingPhaseCode(phaseCode);
            setFlowStep('phaseTransition');
            await delay(phaseIntroHoldMs(title));
            setPendingPhaseCode(null);
        },
        [content.phases],
    );

    const persistRegister = useCallback(
        async (chosen: Register): Promise<TalkBootstrap | null> => {
            try {
                setPatchError(null);
                const updated = await patchTalk({ register: chosen });
                setBootstrap(updated);
                return updated;
            } catch {
                setPatchError('No pudimos guardar tu preferencia. Intenta de nuevo.');
                return null;
            }
        },
        [setBootstrap],
    );

    const confirmTone = useCallback(async () => {
        const chosen: Register = toneSelected ?? 'usted';
        setRegister(chosen);
        setToneSelected(chosen);

        await persistRegister(chosen);

        await showPhaseIntro('1');
        setQuestionIndex(0);
        setFlowStep('question');
        restoreDraftForQuestion(0);
    }, [
        toneSelected,
        persistRegister,
        showPhaseIntro,
        restoreDraftForQuestion,
    ]);

    const submitAnswer = useCallback(async () => {
        if (!currentQuestion || !register || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setAnswerError(null);

        const trimmed = draftBody.trim();
        const skipped = draftSkipped || trimmed.length === 0;
        const record: AnswerRecord = {
            questionCode: currentQuestion.code,
            body: skipped ? '' : trimmed,
            skipped,
        };

        setFlowStep('microReply');
        setMicroReplyLoading(true);
        setMicroReply(null);
        setMicroReplyGesture(microReplyLoadingGesture());

        const loadMs = microReplyLoadMs(simulateSlowReply(scenario));
        const slowDelay = loadMs > 0 ? delay(loadMs) : Promise.resolve();

        try {
            const [response] = await Promise.all([
                postAnswer({
                    questionCode: record.questionCode,
                    answer: record.body,
                    skipped: record.skipped,
                }),
                slowDelay,
            ]);

            setAnswers(progressToAnswers(response.progress));
            setBootstrap((prev) =>
                prev
                    ? mergeBootstrapProgress(prev, response.progress)
                    : prev,
            );

            const sentimentId = isGestureId(response.microReply.sentimentId)
                ? response.microReply.sentimentId
                : 'atenta';

            setMicroReplyLoading(false);
            setMicroReply(response.microReply.text);
            setMicroReplyGesture(gestureById(sentimentId));

            await delay(confirmationHoldMs(response.microReply.text));

            const nextIndex = questionIndex + 1;
            if (nextIndex < questionList.length) {
                const nextPhase = questionList[nextIndex].phaseCode;
                if (nextPhase !== currentQuestion.phaseCode) {
                    await showPhaseIntro(nextPhase);
                }
            }

            goToNextQuestion(questionIndex);
        } catch (error) {
            setMicroReplyLoading(false);
            setFlowStep('question');
            setAnswerError(
                error instanceof TalkApiError
                    ? error.message
                    : 'No pudimos guardar tu respuesta. Intenta de nuevo.',
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [
        currentQuestion,
        register,
        draftBody,
        draftSkipped,
        questionIndex,
        scenario,
        goToNextQuestion,
        showPhaseIntro,
        isSubmitting,
        questionList,
        setBootstrap,
    ]);

    useEffect(() => {
        if (flowStep !== 'farewell' || bootstrap.status === 'completed') {
            return;
        }

        if (completeRequested.current) {
            return;
        }

        completeRequested.current = true;

        void (async () => {
            try {
                setCompleteError(null);
                const updated = await postTalkComplete();
                setBootstrap(updated);
            } catch (error) {
                completeRequested.current = false;
                setCompleteError(
                    error instanceof TalkApiError
                        ? error.message
                        : 'No pudimos finalizar la entrevista. Intenta de nuevo.',
                );
            }
        })();
    }, [flowStep, bootstrap.status, setBootstrap]);

    const farewellText = useMemo(() => {
        const reg = register ?? bootstrap.register ?? 'usted';
        const template =
            reg === 'tu' ? content.copy.farewellTu : content.copy.farewellUsted;
        return fillTemplate(template, invite);
    }, [
        register,
        bootstrap.register,
        content.copy.farewellTu,
        content.copy.farewellUsted,
        invite,
    ]);

    return {
        content,
        invite,
        fillTemplate,
        flowStep,
        register,
        toneSelected,
        questionIndex,
        currentQuestion,
        currentPhase,
        progressPercent,
        answers,
        draftBody,
        setDraftBody,
        draftSkipped,
        setDraftSkipped,
        microReply,
        microReplyGesture,
        microReplyLoading,
        pendingPhaseCode,
        confirmAssistantIntro,
        confirmPrivacy,
        selectTone,
        confirmTone,
        submitAnswer,
        isSubmitting,
        farewellText,
        totalQuestions: questionList.length,
        questionList,
        patchError,
        answerError,
        completeError,
        interviewStatus: bootstrap.status,
    };
}
