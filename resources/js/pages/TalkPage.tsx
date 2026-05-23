import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BootstrapPhase } from '@/components/BootstrapAuraDock';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { useAdvanceHotkey } from '@/hooks/useAdvanceHotkey';
import { DevScenarioSwitcher } from '@/components/DevScenarioSwitcher';
import { InterviewShell } from '@/components/InterviewShell';
import { MicroReplyBubble } from '@/components/MicroReplyBubble';
import { QuestionCard } from '@/components/QuestionCard';
import { StepTransition } from '@/components/StepTransition';
import { TalkBootstrapProvider } from '@/context/TalkBootstrapContext';
import { useInterviewFlow } from '@/flow/useInterviewFlow';
import { parseScenario } from '@/flow/scenario';
import { FarewellScreen } from '@/screens/FarewellScreen';
import { PrivacyScreen } from '@/screens/PrivacyScreen';
import { RevokedScreen } from '@/screens/RevokedScreen';
import { AssistantIntroScreen } from '@/screens/AssistantIntroScreen';
import { PhaseIntroScreen } from '@/screens/PhaseIntroScreen';
import { ToneScreen } from '@/screens/ToneScreen';
import { phaseIntroHoldMs } from '@/lib/timing';
import { fillTemplate } from '@/data/mockInvite';
import { EASE_OUT } from '@/lib/motion';
import { createSplashBootstrap } from '@/lib/splashBootstrap';
import type { Register, Scenario } from '@/types/talk';

const REVOKED_FALLBACK_COPY = {
    revokedTitle: 'Este enlace ya no está disponible',
    revokedBody:
        'Si cree que se trata de un error, escríbanos y con gusto le ayudamos.',
};

function usesBootstrapDock(scenario: Scenario): boolean {
    return (
        scenario === 'default' ||
        scenario === 'long_answer' ||
        scenario === 'skip_answer'
    );
}

function TalkPageContent({
    scenario,
    bootstrapReady,
}: {
    scenario: Scenario;
    bootstrapReady: boolean;
}) {
    const reduceMotion = useReducedMotion();
    const bootstrapDock = usesBootstrapDock(scenario);

    const [bootstrapPhase, setBootstrapPhase] =
        useState<BootstrapPhase>('loading');

    const handleDocked = useCallback(() => setBootstrapPhase('ready'), []);

    const flow = useInterviewFlow(scenario);
    const {
        content,
        invite,
        flowStep,
        register,
        toneSelected,
        currentQuestion,
        progressPercent,
        draftBody,
        setDraftBody,
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
        patchError,
        answerError,
        completeError,
    } = flow;

    useEffect(() => {
        if (!bootstrapReady) {
            return;
        }
        if (!bootstrapDock || flowStep !== 'assistantIntro') {
            setBootstrapPhase('ready');
            return;
        }
        if (bootstrapPhase === 'loading') {
            setBootstrapPhase('docking');
        }
    }, [bootstrapReady, bootstrapDock, bootstrapPhase, flowStep]);

    const interviewProgressPercent = useMemo(() => {
        switch (flowStep) {
            case 'assistantIntro':
                return 0;
            case 'privacy':
                return 4;
            case 'tone':
                return 8;
            case 'question':
            case 'microReply':
            case 'phaseTransition':
                return Math.min(99, Math.round(8 + progressPercent * 0.92));
            case 'farewell':
                return 100;
            default:
                return 0;
        }
    }, [flowStep, progressPercent]);

    const reg: Register = register ?? 'usted';

    const phaseIntroTitle =
        pendingPhaseCode != null
            ? content.phases.find((p) => p.code === pendingPhaseCode)?.title ?? ''
            : '';

    const questionLabel = currentQuestion
        ? reg === 'tu'
            ? currentQuestion.labelTu
            : currentQuestion.labelUsted
        : undefined;

    const questionHint = currentQuestion
        ? reg === 'tu'
            ? currentQuestion.hintTu
            : currentQuestion.hintUsted
        : undefined;

    const assistantIntroMessage = fillTemplate(
        content.copy.assistantIntro,
        invite,
    );

    const advanceEnabled =
        bootstrapReady &&
        !isSubmitting &&
        flowStep !== 'microReply' &&
        flowStep !== 'farewell' &&
        flowStep !== 'revoked' &&
        (flowStep === 'assistantIntro' ||
            flowStep === 'privacy' ||
            flowStep === 'tone' ||
            (flowStep === 'question' && !!currentQuestion));

    const handleAdvance = useCallback(() => {
        if (flowStep === 'assistantIntro') {
            confirmAssistantIntro();
        } else if (flowStep === 'privacy') {
            confirmPrivacy();
        } else if (flowStep === 'tone') {
            void confirmTone();
        } else if (flowStep === 'question') {
            void submitAnswer();
        }
    }, [
        flowStep,
        confirmAssistantIntro,
        confirmPrivacy,
        confirmTone,
        submitAnswer,
    ]);

    useAdvanceHotkey(handleAdvance, advanceEnabled);

    const stepKey =
        flowStep === 'phaseTransition'
            ? `phase-${pendingPhaseCode}`
            : flowStep === 'question' && currentQuestion
              ? `q-${currentQuestion.code}`
              : flowStep;

    const showBackdrop =
        bootstrapDock &&
        (bootstrapPhase === 'loading' || bootstrapPhase === 'docking');

    const introContentVisible =
        !bootstrapDock || bootstrapPhase === 'ready';

    const interview = (
        <>
            <InterviewShell
                progressPercent={interviewProgressPercent}
                showProgressLine={flowStep !== 'revoked'}
            >
                {(patchError || answerError || completeError) && (
                    <p className="mx-auto mb-4 max-w-lg text-center text-sm text-red-600">
                        {patchError ?? answerError ?? completeError}
                    </p>
                )}
                <StepTransition stepKey={stepKey}>
                    {flowStep === 'assistantIntro' && (
                        <AssistantIntroScreen
                            message={assistantIntroMessage}
                            ctaLabel={content.copy.assistantIntroCta}
                            onStart={confirmAssistantIntro}
                            bootstrapPhase={
                                bootstrapDock ? bootstrapPhase : 'ready'
                            }
                            onDocked={handleDocked}
                        />
                    )}

                    {flowStep === 'privacy' && (
                        <PrivacyScreen
                            content={content}
                            onContinue={confirmPrivacy}
                        />
                    )}

                    {flowStep === 'tone' && (
                        <ToneScreen
                            content={content}
                            selected={toneSelected}
                            onSelect={selectTone}
                            onContinue={() => void confirmTone()}
                        />
                    )}

                    {flowStep === 'phaseTransition' && phaseIntroTitle && (
                        <PhaseIntroScreen
                            title={phaseIntroTitle}
                            holdMs={phaseIntroHoldMs(phaseIntroTitle)}
                        />
                    )}

                    {flowStep === 'question' &&
                        currentQuestion &&
                        questionLabel && (
                            <QuestionCard
                                label={questionLabel}
                                hint={questionHint}
                                body={draftBody}
                                skipLabel={content.copy.skipLabel}
                                continueLabel={content.copy.continueLabel}
                                onBodyChange={(value) => {
                                    setDraftBody(value);
                                    if (value.trim()) {
                                        setDraftSkipped(false);
                                    }
                                }}
                                onContinue={() => void submitAnswer()}
                                continueDisabled={isSubmitting}
                            />
                        )}

                    {flowStep === 'microReply' && (
                        <MicroReplyBubble
                            gesture={microReplyGesture}
                            loading={microReplyLoading}
                            message={microReply}
                        />
                    )}

                    {flowStep === 'farewell' && (
                        <FarewellScreen message={farewellText} />
                    )}

                    {flowStep === 'revoked' && (
                        <RevokedScreen content={content} />
                    )}
                </StepTransition>
            </InterviewShell>

            {import.meta.env.DEV && (
                <DevScenarioSwitcher current={scenario} />
            )}
        </>
    );

    if (bootstrapDock && flowStep !== 'assistantIntro') {
        return interview;
    }

    return (
        <>
            {showBackdrop && (
                <motion.div
                    className="bootstrap-backdrop"
                    aria-hidden
                    initial={false}
                    animate={{ opacity: bootstrapPhase === 'loading' ? 1 : 0 }}
                    transition={{
                        duration: reduceMotion ? 0.15 : 0.85,
                        ease: EASE_OUT,
                    }}
                />
            )}
            <div
                className={[
                    'app-reveal',
                    !introContentVisible ? 'app-reveal--bootstrap-active' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {interview}
            </div>
        </>
    );
}

function UnauthorizedView() {
    const content = {
        version: '0',
        phases: [],
        questions: [],
        copy: {
            ...REVOKED_FALLBACK_COPY,
            assistantIntro: '',
            assistantIntroCta: '',
            privacyTitle: '',
            privacyBody: '',
            privacyLinkLabel: '',
            privacyLinkUrl: '',
            privacyDuration: '',
            privacyDurationNote: '',
            toneLead: '',
            toneOptionTu: '',
            toneOptionUsted: '',
            tonePreviewTu: '',
            tonePreviewUsted: '',
            phaseTransitions: {},
            farewellTu: '',
            farewellUsted: '',
            skipLabel: '',
            continueLabel: '',
            microRepliesTu: [],
            microRepliesUsted: [],
            microRepliesTemplateTu: [],
            microRepliesTemplateUsted: [],
        },
    };

    return (
        <InterviewShell progressPercent={0} showProgressLine={false}>
            <RevokedScreen content={content} />
        </InterviewShell>
    );
}

export default function TalkPage() {
    const scenario = useMemo(
        () => parseScenario(window.location.search),
        [],
    );
    const splashBootstrap = useMemo(() => createSplashBootstrap(), []);
    const { ready, bootstrap, unauthorized, error } = useAppBootstrap();

    if (ready && unauthorized) {
        return <UnauthorizedView />;
    }

    if (ready && (error || !bootstrap)) {
        return (
            <InterviewShell progressPercent={0} showProgressLine={false}>
                <p className="mx-auto max-w-md text-center text-idwa-muted">
                    No pudimos cargar la entrevista. Recarga la página o abre de
                    nuevo el enlace que te enviamos.
                </p>
            </InterviewShell>
        );
    }

    return (
        <TalkBootstrapProvider
            initialBootstrap={bootstrap ?? splashBootstrap}
            bootstrapReady={ready}
        >
            <TalkPageContent scenario={scenario} bootstrapReady={ready} />
        </TalkBootstrapProvider>
    );
}
