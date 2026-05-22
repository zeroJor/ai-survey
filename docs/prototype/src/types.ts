export type Register = "tu" | "usted";

export type Scenario =
  | "default"
  | "in_progress"
  | "completed"
  | "revoked"
  | "loading_answer"
  | "llm_off"
  | "long_answer"
  | "skip_answer";

export type StepKind =
  | "assistantIntro"
  | "privacy"
  | "tone"
  | "phaseTransition"
  | "question"
  | "microReply"
  | "farewell"
  | "revoked";

export interface Invite {
  contactName: string;
  businessName: string;
}

export interface Phase {
  code: string;
  title: string;
  objective: string;
  intro?: string;
}

export interface Question {
  code: string;
  phaseCode: string;
  labelTu: string;
  labelUsted: string;
  hintTu?: string;
  hintUsted?: string;
}

export interface InterviewContent {
  version: string;
  phases: Phase[];
  questions: Question[];
  copy: {
    assistantIntro: string;
    assistantIntroCta: string;
    privacyTitle: string;
    privacyBody: string;
    privacyLinkLabel: string;
    privacyLinkUrl: string;
    privacyDuration: string;
    privacyDurationNote: string;
    toneLead: string;
    toneOptionTu: string;
    toneOptionUsted: string;
    tonePreviewTu: string;
    tonePreviewUsted: string;
    phaseTransitions: Record<string, string>;
    farewellTu: string;
    farewellUsted: string;
    revokedTitle: string;
    revokedBody: string;
    skipLabel: string;
    continueLabel: string;
    microRepliesTu: string[];
    microRepliesUsted: string[];
    microRepliesTemplateTu: string[];
    microRepliesTemplateUsted: string[];
  };
}

export interface AnswerRecord {
  questionCode: string;
  body: string;
  skipped: boolean;
}
