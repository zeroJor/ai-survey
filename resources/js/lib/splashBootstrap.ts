import { defaultInvite } from '@/data/mockInvite';
import type { TalkBootstrap } from '@/types/talk';

const SPLASH_INTRO =
    '¡Hola, {{contactName}}!\nSoy tu asistente *Lisa*. Te acompañaré en esta plática para saber más sobre *{{businessName}}*.';

/** Minimal bootstrap so welcome + aura dock mount before GET /api/talk completes. */
export function createSplashBootstrap(): TalkBootstrap {
    return {
        status: 'not_started',
        invite: defaultInvite,
        register: null,
        contentVersion: 'splash',
        content: {
            version: 'splash',
            phases: [],
            questions: [],
            copy: {
                assistantIntro: SPLASH_INTRO,
                assistantIntroCta: 'Empecemos',
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
                revokedTitle: '',
                revokedBody: '',
                skipLabel: '',
                continueLabel: '',
                microRepliesTu: [],
                microRepliesUsted: [],
                microRepliesTemplateTu: [],
                microRepliesTemplateUsted: [],
            },
        },
        progress: {
            answers: {},
            currentQuestionCode: null,
        },
        branding: {
            displayName: 'Idwasoft',
            logoUrl: null,
            logoAlt: 'Idwasoft',
            primaryColor: '#00B4FF',
            accentColor: '#0077FF',
            privacyNoticeUrl: null,
            tagline: null,
        },
    };
}
