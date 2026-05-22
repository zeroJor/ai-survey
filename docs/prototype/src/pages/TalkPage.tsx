import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InitialLoader } from "../components/InitialLoader";
import { useAppBootstrap } from "../hooks/useAppBootstrap";
import { useAdvanceHotkey } from "../hooks/useAdvanceHotkey";
import { useLocation } from "react-router-dom";
import { BackEdgeControl } from "../components/BackEdgeControl";
import { DevScenarioSwitcher } from "../components/DevScenarioSwitcher";
import { InterviewShell } from "../components/InterviewShell";
import { MicroReplyBubble } from "../components/MicroReplyBubble";
import { QuestionCard } from "../components/QuestionCard";
import { StepTransition } from "../components/StepTransition";
import { useInterviewFlow } from "../flow/useInterviewFlow";
import { parseScenario } from "../flow/scenario";
import { FarewellScreen } from "../screens/FarewellScreen";
import { PrivacyScreen } from "../screens/PrivacyScreen";
import { RevokedScreen } from "../screens/RevokedScreen";
import { AssistantIntroScreen } from "../screens/AssistantIntroScreen";
import { PhaseIntroScreen } from "../screens/PhaseIntroScreen";
import { ToneScreen } from "../screens/ToneScreen";
import { phaseIntroHoldMs } from "../lib/timing";
import { fillTemplate } from "../data/mockInvite";
import type { Register } from "../types";

const APP_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export function TalkPage() {
  const reduceMotion = useReducedMotion();
  const bootstrapReady = useAppBootstrap();
  const [handoff, setHandoff] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    if (bootstrapReady) setHandoff(true);
  }, [bootstrapReady]);
  const location = useLocation();
  const scenario = useMemo(
    () => parseScenario(location.search),
    [location.search],
  );
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
    goBack,
    canGoBack,
    isSubmitting,
    farewellText,
  } = flow;

  const interviewProgressPercent = useMemo(() => {
    switch (flowStep) {
      case "assistantIntro":
        return 0;
      case "privacy":
        return 4;
      case "tone":
        return 8;
      case "question":
      case "microReply":
      case "phaseTransition":
        return Math.min(99, Math.round(8 + progressPercent * 0.92));
      case "farewell":
        return 100;
      default:
        return 0;
    }
  }, [flowStep, progressPercent]);

  const reg: Register = register ?? "usted";

  const phaseIntroTitle =
    pendingPhaseCode != null
      ? content.phases.find((p) => p.code === pendingPhaseCode)?.title ?? ""
      : "";

  const questionLabel = currentQuestion
    ? reg === "tu"
      ? currentQuestion.labelTu
      : currentQuestion.labelUsted
    : undefined;

  const questionHint = currentQuestion
    ? reg === "tu"
      ? currentQuestion.hintTu
      : currentQuestion.hintUsted
    : undefined;

  const assistantIntroMessage = fillTemplate(
    content.copy.assistantIntro,
    invite,
  );

  const advanceEnabled =
    !isSubmitting &&
    flowStep !== "microReply" &&
    flowStep !== "farewell" &&
    flowStep !== "revoked" &&
    (flowStep === "assistantIntro" ||
      flowStep === "privacy" ||
      (flowStep === "tone" && toneSelected != null) ||
      (flowStep === "question" &&
        !!currentQuestion &&
        (draftSkipped || draftBody.trim().length > 0)));

  const handleAdvance = useCallback(() => {
    if (flowStep === "assistantIntro") confirmAssistantIntro();
    else if (flowStep === "privacy") confirmPrivacy();
    else if (flowStep === "tone") confirmTone();
    else if (flowStep === "question") void submitAnswer();
  }, [flowStep, confirmAssistantIntro, confirmPrivacy, confirmTone, submitAnswer]);

  useAdvanceHotkey(handleAdvance, advanceEnabled);

  const stepKey =
    flowStep === "phaseTransition"
      ? `phase-${pendingPhaseCode}`
      : flowStep === "question" && currentQuestion
        ? `q-${currentQuestion.code}`
        : flowStep;

  const auraHandoff = handoff && flowStep === "assistantIntro";

  const interview = (
    <>
      <BackEdgeControl visible={canGoBack} onBack={goBack} />
      <InterviewShell
        progressPercent={interviewProgressPercent}
        showProgressLine={flowStep !== "revoked"}
      >
        <StepTransition stepKey={stepKey}>
          {flowStep === "assistantIntro" && (
            <AssistantIntroScreen
              message={assistantIntroMessage}
              ctaLabel={content.copy.assistantIntroCta}
              onStart={confirmAssistantIntro}
              bootstrapHandoff={auraHandoff && !loaderDone}
            />
          )}

          {flowStep === "privacy" && (
            <PrivacyScreen content={content} onContinue={confirmPrivacy} />
          )}

          {flowStep === "tone" && (
            <ToneScreen
              content={content}
              selected={toneSelected}
              onSelect={selectTone}
              onContinue={confirmTone}
            />
          )}

          {flowStep === "phaseTransition" && phaseIntroTitle && (
            <PhaseIntroScreen
              title={phaseIntroTitle}
              holdMs={phaseIntroHoldMs(phaseIntroTitle)}
            />
          )}

          {flowStep === "question" && currentQuestion && questionLabel && (
            <QuestionCard
              label={questionLabel}
              hint={questionHint}
              body={draftBody}
              skipped={draftSkipped}
              skipLabel={content.copy.skipLabel}
              continueLabel={content.copy.continueLabel}
              onBodyChange={setDraftBody}
              onSkip={() => {
                setDraftSkipped(true);
                setDraftBody("");
              }}
              onContinue={() => void submitAnswer()}
              continueDisabled={
                isSubmitting ||
                (!draftSkipped && draftBody.trim().length === 0)
              }
            />
          )}

          {flowStep === "microReply" && (
            <MicroReplyBubble
              gesture={microReplyGesture}
              loading={microReplyLoading}
              message={microReply}
            />
          )}

          {flowStep === "farewell" && <FarewellScreen message={farewellText} />}

          {flowStep === "revoked" && <RevokedScreen content={content} />}
        </StepTransition>
      </InterviewShell>

      <DevScenarioSwitcher current={scenario} />
    </>
  );

  if (!handoff) {
    return (
      <InitialLoader
        exiting={false}
        auraHandoff={false}
        onExited={() => setLoaderDone(true)}
      />
    );
  }

  return (
    <LayoutGroup id="bootstrap-handoff">
      <motion.div
        className="app-reveal"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: reduceMotion ? 0.2 : 0.88,
          delay: reduceMotion ? 0 : 0.1,
          ease: APP_REVEAL_EASE,
        }}
      >
        {interview}
      </motion.div>
      {!loaderDone && (
        <InitialLoader
          exiting
          auraHandoff={auraHandoff}
          onExited={() => setLoaderDone(true)}
        />
      )}
    </LayoutGroup>
  );
}
