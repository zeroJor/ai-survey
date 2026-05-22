import type { AnswerRecord, Register, Scenario } from "../types";
import interview from "../content/interview.json";

export function parseScenario(search: string): Scenario {
  const value = new URLSearchParams(search).get("scenario");
  const allowed: Scenario[] = [
    "default",
    "in_progress",
    "completed",
    "revoked",
    "loading_answer",
    "llm_off",
    "long_answer",
    "skip_answer",
  ];
  if (value && allowed.includes(value as Scenario)) {
    return value as Scenario;
  }
  return "default";
}

export function getInitialAnswers(scenario: Scenario): AnswerRecord[] {
  if (scenario !== "in_progress") return [];
  return interview.questions.slice(0, 5).map((q) => ({
    questionCode: q.code,
    body: "Respuesta de ejemplo para retomar la entrevista.",
    skipped: false,
  }));
}

export function getInitialRegister(scenario: Scenario): Register | null {
  if (scenario === "in_progress" || scenario === "completed") {
    return "usted";
  }
  return null;
}

export function getInitialQuestionIndex(scenario: Scenario): number {
  if (scenario === "in_progress") return 5;
  return 0;
}

export function useLlmMode(scenario: Scenario): boolean {
  return scenario !== "llm_off";
}

export function simulateSlowReply(scenario: Scenario): boolean {
  return scenario === "loading_answer";
}
