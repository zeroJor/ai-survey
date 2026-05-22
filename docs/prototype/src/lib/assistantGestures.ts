import type { AnswerRecord } from "../types";

export type AssistantGestureId =
  | "atenta"
  | "smile"
  | "think"
  | "nod"
  | "sorprendida"
  | "complice"
  | "risa"
  | "seria"
  | "enSerio"
  | "sarcasmo";

/** Default Lisa portrait (until a dedicated asset exists per sentiment). */
export const LISA_PORTRAIT_SRC = "/assets/assistant/lisa.png";

const LISA_THINK_SRC = "/assets/assistant/lisa-think.png";
const LISA_SORPRENDIDA_SRC = "/assets/assistant/lisa-sorprendida.png";
const LISA_ATENTA_SRC = "/assets/assistant/lisa-atenta.png";
const LISA_COMPLICE_SRC = "/assets/assistant/lisa-complice.png";
const LISA_RISA_SRC = "/assets/assistant/lisa-risa.png";
const LISA_SERIA_SRC = "/assets/assistant/lisa-seria.png";
const LISA_EN_SERIO_SRC = "/assets/assistant/lisa-en-serio.png";
const LISA_SARCASMO_SRC = "/assets/assistant/lisa-sarcasmo.png";
export const LISA_FAREWELL_SRC = "/assets/assistant/lisa-farewell.png";

/** Fixed portrait for farewell (not part of micro-reply rotation). */
export const FAREWELL_GESTURE: AssistantGesture = {
  id: "smile",
  src: LISA_FAREWELL_SRC,
  label: "Lisa — despedida",
};

/** One or more images per sentiment — random pick when the pool has several files. */
const SENTIMENT_ASSET_POOLS: Record<AssistantGestureId, readonly string[]> = {
  atenta: [LISA_ATENTA_SRC],
  smile: [LISA_PORTRAIT_SRC],
  think: [LISA_THINK_SRC],
  nod: [LISA_SERIA_SRC],
  sorprendida: [LISA_SORPRENDIDA_SRC],
  complice: [LISA_COMPLICE_SRC],
  risa: [LISA_RISA_SRC],
  seria: [LISA_SERIA_SRC],
  enSerio: [LISA_EN_SERIO_SRC],
  sarcasmo: [LISA_SARCASMO_SRC],
};

export interface AssistantGesture {
  id: AssistantGestureId;
  src: string;
  label: string;
}

const GESTURE_LABELS: Record<AssistantGestureId, string> = {
  atenta: "Lisa — seria y atenta",
  smile: "Lisa — sonrisa amable",
  think: "Lisa — pensativa",
  nod: "Lisa — de acuerdo, sigamos",
  sorprendida: "Lisa — sorprendida",
  complice: "Lisa — guiño cómplice",
  risa: "Lisa — qué risa",
  seria: "Lisa — neutral y seria",
  enSerio: "Lisa — ¿es en serio?",
  sarcasmo: "Lisa — harta / sarcasmo",
};

export const ASSISTANT_GESTURES: readonly AssistantGesture[] = (
  Object.keys(GESTURE_LABELS) as AssistantGestureId[]
).map((id) => ({
  id,
  src: SENTIMENT_ASSET_POOLS[id][0]!,
  label: GESTURE_LABELS[id],
}));

/** Unique Lisa portrait URLs for bootstrap preload. */
export function assistantPortraitUrls(): readonly string[] {
  const urls = new Set<string>();
  for (const pool of Object.values(SENTIMENT_ASSET_POOLS)) {
    for (const src of pool) urls.add(src);
  }
  urls.add(LISA_FAREWELL_SRC);
  return [...urls];
}

function pickSentimentAsset(id: AssistantGestureId): string {
  const pool = SENTIMENT_ASSET_POOLS[id];
  if (pool.length === 1) return pool[0]!;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Sentiment + random asset variant when the pool has more than one file. */
export function gestureById(id: AssistantGestureId): AssistantGesture {
  return {
    id,
    label: GESTURE_LABELS[id],
    src: pickSentimentAsset(id),
  };
}

/** Prototype only — uniform random sentiment to preview all portraits. */
export function pickRandomGesture(): AssistantGesture {
  const index = Math.floor(Math.random() * ASSISTANT_GESTURES.length);
  const id = ASSISTANT_GESTURES[index]!.id;
  return gestureById(id);
}

/**
 * Prototype: random portrait each micro-reply (see assistant-expression.md §3.4).
 * Production: LLM or rules return `sentimentId` from the catalog.
 */
export function gestureForAnswer(
  _answer: Pick<AnswerRecord, "body" | "skipped">,
): AssistantGesture {
  return pickRandomGesture();
}
