export interface AdminBranding {
    displayName: string | null;
    logoUrl: string | null;
    logoAlt: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    tagline: string | null;
}

export interface AdminChannel {
    channelKey: string;
    name: string;
    type: string;
    config: Record<string, unknown>;
}

export interface AdminSettings {
    studioProcess: string | null;
    llmEnabled: boolean;
    privacyNoticeUrl: string | null;
    branding: AdminBranding;
    channels: AdminChannel[];
}

export interface InviteProgress {
    answered: number;
    total: number;
}

export type InviteDisplayStatus =
    | 'revoked'
    | 'not_started'
    | 'in_progress'
    | 'completed';

export interface AdminInviteListItem {
    id: string;
    contactName: string;
    businessName: string;
    status: string;
    interviewStatus: string | null;
    displayStatus: InviteDisplayStatus;
    createdAt: string | null;
    completedAt: string | null;
    lastActivityAt: string | null;
    progress: InviteProgress;
}

export interface AdminInviteDetail extends AdminInviteListItem {
    businessAbout: string | null;
    clientEmail: string | null;
    clientWhatsapp: string | null;
    revokedAt: string | null;
    inviteUrl: string;
    interview: {
        id: string;
        status: string;
        register: string | null;
        startedAt: string | null;
        completedAt: string | null;
        progress: InviteProgress;
    } | null;
}

export interface AdminInvitesListResponse {
    data: AdminInviteListItem[];
    meta: {
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
    };
}

export interface InterviewReviewQuestion {
    code: string;
    labelNeutral: string;
    answer: { body: string | null; skipped: boolean } | null;
    microReply: {
        text: string;
        sentimentId: string | null;
        source: string | null;
    } | null;
}

export interface InterviewArtifactAnalysis {
    psychologicalProfile: string;
    clientNeeds: string;
    businessContext: string;
    salesStrategies: string;
    recommendedNextSteps: string;
    risks: string;
    keyQuotes: string[];
}

export interface InterviewReviewArtifact {
    schemaVersion: string;
    generatedAt: string | null;
    analysis: InterviewArtifactAnalysis;
}

export interface InterviewReview {
    interview: {
        id: string;
        status: string;
        register: string | null;
        startedAt: string | null;
        completedAt: string | null;
    };
    invite: {
        id: string;
        contactName: string;
        businessName: string;
        businessAbout: string | null;
        clientEmail: string | null;
        clientWhatsapp: string | null;
    };
    questions: InterviewReviewQuestion[];
    farewell: { content: string; source: string | null } | null;
    artifact: InterviewReviewArtifact | null;
}

const ARTIFACT_SECTIONS: {
    key: keyof InterviewArtifactAnalysis;
    title: string;
}[] = [
    { key: 'psychologicalProfile', title: 'Perfil psicológico' },
    { key: 'clientNeeds', title: 'Necesidades del cliente' },
    { key: 'businessContext', title: 'Contexto del negocio' },
    { key: 'salesStrategies', title: 'Estrategias comerciales' },
    { key: 'recommendedNextSteps', title: 'Próximos pasos recomendados' },
    { key: 'risks', title: 'Riesgos' },
];

export { ARTIFACT_SECTIONS };
