export type Register = 'tu' | 'usted';

export type InterviewStatus =
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'revoked';

export type Scenario =
    | 'default'
    | 'in_progress'
    | 'completed'
    | 'revoked'
    | 'loading_answer'
    | 'llm_off'
    | 'long_answer'
    | 'skip_answer';

export type StepKind =
    | 'assistantIntro'
    | 'privacy'
    | 'tone'
    | 'phaseTransition'
    | 'question'
    | 'microReply'
    | 'farewell'
    | 'revoked';

export interface Invite {
    contactName: string;
    businessName: string;
    businessAbout?: string | null;
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

export interface TalkProgress {
    answers: Record<string, { body: string | null; skipped: boolean }>;
    currentQuestionCode: string | null;
}

export interface TalkBranding {
    displayName: string | null;
    logoUrl: string | null;
    logoAlt: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    privacyNoticeUrl: string | null;
    tagline: string | null;
}

export interface MicroReplyPayload {
    text: string;
    sentimentId: string;
}

export interface PostAnswerResponse {
    microReply: MicroReplyPayload;
    progress: TalkProgress;
}

export interface TalkBootstrap {
    status: InterviewStatus;
    invite: Invite;
    register: Register | null;
    contentVersion: string;
    content: InterviewContent;
    progress: TalkProgress;
    branding: TalkBranding;
}
