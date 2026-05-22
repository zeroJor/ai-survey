import { useCallback, useMemo, useState } from "react";
import interview from "../content/interview.json";
import { defaultInvite, fillTemplate } from "../data/mockInvite";
import type {
  AnswerRecord,
  InterviewContent,
  Register,
  Scenario,
} from "../types";
import {
  gestureForAnswer,
  type AssistantGesture,
} from "../lib/assistantGestures";
import {
  confirmationHoldMs,
  microReplyLoadMs,
  phaseIntroHoldMs,
} from "../lib/timing";
import {
  getInitialAnswers,
  getInitialQuestionIndex,
  getInitialRegister,
  simulateSlowReply,
  useLlmMode,
} from "./scenario";

export const QUESTION_SECTION_COUNT = 5;

const content = interview as InterviewContent;
const questionList = content.questions;

type FlowStep =
  | "assistantIntro"
  | "privacy"
  | "tone"
  | "phaseTransition"
  | "question"
  | "microReply"
  | "farewell"
  | "revoked";

function pickMicroReply(
  register: Register,
  llmOn: boolean,
  index: number,
): string {
  const pool = llmOn
    ? register === "tu"
      ? content.copy.microRepliesTu
      : content.copy.microRepliesUsted
    : register === "tu"
      ? content.copy.microRepliesTemplateTu
      : content.copy.microRepliesTemplateUsted;
  return pool[index % pool.length];
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initialFlowStep(scenario: Scenario): FlowStep {
  if (scenario === "revoked") return "revoked";
  if (scenario === "completed") return "farewell";
  if (scenario === "in_progress") return "question";
  return "assistantIntro";
}

export function useInterviewFlow(scenario: Scenario) {
  const llmOn = useLlmMode(scenario);

  const [flowStep, setFlowStep] = useState<FlowStep>(() =>
    initialFlowStep(scenario),
  );
  const [register, setRegister] = useState<Register | null>(
    getInitialRegister(scenario),
  );
  const [questionIndex, setQuestionIndex] = useState(
    getInitialQuestionIndex(scenario),
  );
  const [answers, setAnswers] = useState<AnswerRecord[]>(
    getInitialAnswers(scenario),
  );
  const [draftBody, setDraftBody] = useState(
    scenario === "long_answer"
      ? "Esta es una respuesta larga de prueba para ver cómo se comporta el campo de texto cuando el cliente escribe varios párrafos sobre su negocio, sus clientes y lo que espera de la nueva página web."
      : "",
  );
  const [draftSkipped, setDraftSkipped] = useState(scenario === "skip_answer");
  const [microReply, setMicroReply] = useState<string | null>(null);
  const [microReplyGesture, setMicroReplyGesture] =
    useState<AssistantGesture | null>(null);
  const [microReplyLoading, setMicroReplyLoading] = useState(false);
  const [toneSelected, setToneSelected] = useState<Register | null>(
    getInitialRegister(scenario),
  );
  const [pendingPhaseCode, setPendingPhaseCode] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setFlowStep("farewell");
      setMicroReply(null);
      setMicroReplyGesture(null);
      setMicroReplyLoading(false);
      return;
    }

    setQuestionIndex(nextIndex);
    setFlowStep("question");
    setDraftBody("");
    setDraftSkipped(false);
    setMicroReply(null);
    setMicroReplyGesture(null);
    setMicroReplyLoading(false);
  }, []);

  const confirmAssistantIntro = useCallback(() => {
    setFlowStep("privacy");
  }, []);

  const confirmPrivacy = useCallback(() => {
    setFlowStep("tone");
  }, []);

  const selectTone = useCallback((value: Register) => {
    setToneSelected(value);
  }, []);

  const restoreDraftForQuestion = useCallback(
    (index: number) => {
      const question = questionList[index];
      if (!question) {
        setDraftBody("");
        setDraftSkipped(false);
        return;
      }
      const saved = answers.find((a) => a.questionCode === question.code);
      setDraftBody(saved?.body ?? "");
      setDraftSkipped(saved?.skipped ?? false);
    },
    [answers],
  );

  const showPhaseIntro = useCallback(async (phaseCode: string) => {
    const phase = content.phases.find((p) => p.code === phaseCode);
    const title = phase?.title ?? "";
    setPendingPhaseCode(phaseCode);
    setFlowStep("phaseTransition");
    await delay(phaseIntroHoldMs(title));
    setPendingPhaseCode(null);
  }, []);

  const confirmTone = useCallback(async () => {
    if (!toneSelected) return;
    const chosen: Register = toneSelected;
    setRegister(chosen);
    await showPhaseIntro("1");
    setQuestionIndex(0);
    setFlowStep("question");
    restoreDraftForQuestion(0);
  }, [toneSelected, showPhaseIntro, restoreDraftForQuestion]);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !register || isSubmitting) return;

    setIsSubmitting(true);

    const trimmed = draftBody.trim();
    const skipped = draftSkipped || trimmed.length === 0;
    const record: AnswerRecord = {
      questionCode: currentQuestion.code,
      body: skipped ? "" : trimmed,
      skipped,
    };

    setAnswers((prev) => {
      const next = prev.filter((a) => a.questionCode !== record.questionCode);
      return [...next, record];
    });

    const gesture = gestureForAnswer(record);

    setFlowStep("microReply");
    setMicroReplyLoading(true);
    setMicroReply(null);
    setMicroReplyGesture(gesture);

    const loadMs = microReplyLoadMs(simulateSlowReply(scenario));
    await delay(loadMs);

    setMicroReplyLoading(false);
    const reply = pickMicroReply(register, llmOn, questionIndex);
    setMicroReply(reply);
    await delay(confirmationHoldMs(reply));

    const nextIndex = questionIndex + 1;
    if (nextIndex < questionList.length) {
      const nextPhase = questionList[nextIndex].phaseCode;
      if (nextPhase !== currentQuestion.phaseCode) {
        await showPhaseIntro(nextPhase);
      }
    }

    goToNextQuestion(questionIndex);
    setIsSubmitting(false);
  }, [
    currentQuestion,
    register,
    draftBody,
    draftSkipped,
    questionIndex,
    llmOn,
    scenario,
    goToNextQuestion,
    showPhaseIntro,
    isSubmitting,
  ]);

  const farewellText = useMemo(() => {
    const reg = register ?? "usted";
    const template =
      reg === "tu" ? content.copy.farewellTu : content.copy.farewellUsted;
    return fillTemplate(template, defaultInvite);
  }, [register]);

  return {
    content,
    invite: defaultInvite,
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
    llmOn,
    questionList,
  };
}
