import { stripHighlightMarkers } from "./text";

/** Stagger between letters — keep in sync with AnimatedReplyText */
export const CONFIRM_LETTER_STAGGER_MS = 22;

const SPRING_SETTLE_MS = 360;
const READ_BASE_MS = 1100;
const READ_PER_CHAR_MS = 28;
const MIN_HOLD_MS = 2000;
const MAX_HOLD_MS = 5000;

/** Prototype: fixed backend wait before micro-reply copy appears. */
export const MICRO_REPLY_LOAD_MS = 1000;
export const MICRO_REPLY_LOAD_SLOW_MS = 1800;

export function microReplyLoadMs(slow: boolean): number {
  return slow ? MICRO_REPLY_LOAD_SLOW_MS : MICRO_REPLY_LOAD_MS;
}

const PHASE_INTRO_BASE_MS = 2000;
const PHASE_INTRO_PER_CHAR_MS = 38;

/** Welcome screen — avatar + intro copy before privacy */
export function assistantIntroHoldMs(text: string): number {
  const len = [...stripHighlightMarkers(text)].length;
  return Math.min(5000, Math.max(2800, PHASE_INTRO_BASE_MS + len * PHASE_INTRO_PER_CHAR_MS));
}

/** Centered section title before first question in that section */
export function phaseIntroHoldMs(title: string): number {
  const len = [...stripHighlightMarkers(title)].length;
  return Math.min(4500, Math.max(2400, PHASE_INTRO_BASE_MS + len * PHASE_INTRO_PER_CHAR_MS));
}

/** How long to keep confirmation copy on screen (animation + reading). */
export function confirmationHoldMs(text: string): number {
  const len = [...stripHighlightMarkers(text)].length;
  const animMs = len * CONFIRM_LETTER_STAGGER_MS + SPRING_SETTLE_MS;
  const readMs = READ_BASE_MS + len * READ_PER_CHAR_MS;
  return Math.min(MAX_HOLD_MS, Math.max(MIN_HOLD_MS, animMs + readMs));
}
