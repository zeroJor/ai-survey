<?php

namespace App\Services\Interview;

use App\Enums\InterviewStatus;
use App\Enums\InviteStatus;
use App\Enums\Register;
use App\Models\Interview;
use App\Models\InterviewTemplate;
use App\Models\Settings;
use Illuminate\Support\Collection;

class TalkBootstrapBuilder
{
    /** @var array<string, string> */
    private const COPY_KEY_MAP = [
        'assistant_intro' => 'assistantIntro',
        'assistant_intro_cta' => 'assistantIntroCta',
        'privacy_title' => 'privacyTitle',
        'privacy_body' => 'privacyBody',
        'privacy_link_label' => 'privacyLinkLabel',
        'privacy_link_url' => 'privacyLinkUrl',
        'privacy_duration' => 'privacyDuration',
        'privacy_duration_note' => 'privacyDurationNote',
        'tone_lead' => 'toneLead',
        'tone_option_tu' => 'toneOptionTu',
        'tone_option_usted' => 'toneOptionUsted',
        'tone_preview_tu' => 'tonePreviewTu',
        'tone_preview_usted' => 'tonePreviewUsted',
        'skip_label' => 'skipLabel',
        'continue_label' => 'continueLabel',
        'revoked_title' => 'revokedTitle',
        'revoked_body' => 'revokedBody',
        'micro_reply_templates_tu' => 'microRepliesTu',
        'micro_reply_templates_usted' => 'microRepliesUsted',
        'micro_reply_fallback_templates_tu' => 'microRepliesTemplateTu',
        'micro_reply_fallback_templates_usted' => 'microRepliesTemplateUsted',
    ];

    /** @var list<string> */
    private const JSON_COPY_KEYS = [
        'micro_reply_templates_tu',
        'micro_reply_templates_usted',
        'micro_reply_fallback_templates_tu',
        'micro_reply_fallback_templates_usted',
    ];

    public function build(Interview $interview): array
    {
        $interview->loadMissing([
            'invite.interviewTemplate.phases.questions.texts',
            'invite.interviewTemplate.templateCopies',
            'answers',
        ]);

        $invite = $interview->invite;
        $template = $invite->interviewTemplate;
        $settings = Settings::query()->find(1);
        $status = $this->resolveStatus($interview);
        $copies = $template->templateCopies->groupBy('key');

        $copy = $this->buildCopy($copies, $settings);
        $phases = $this->buildPhases($template, $copies);
        $questions = $status === 'completed'
            ? []
            : $this->buildQuestions($template);

        return [
            'status' => $status,
            'invite' => [
                'contactName' => $invite->contact_name,
                'businessName' => $invite->business_name,
                'businessAbout' => $invite->business_about,
            ],
            'register' => $interview->register?->value,
            'contentVersion' => $template->version,
            'content' => [
                'version' => $template->version,
                'phases' => $phases,
                'questions' => $questions,
                'copy' => $copy,
            ],
            'progress' => [
                'answers' => $this->buildAnswersMap($interview),
                'currentQuestionCode' => $interview->current_question_code,
            ],
            'branding' => $this->buildBranding($settings),
        ];
    }

    private function resolveStatus(Interview $interview): string
    {
        if ($interview->invite->status === InviteStatus::Revoked) {
            return 'revoked';
        }

        return match ($interview->status) {
            InterviewStatus::Completed => 'completed',
            InterviewStatus::InProgress => 'in_progress',
            InterviewStatus::NotStarted => 'not_started',
        };
    }

    /**
     * @param  Collection<string, Collection<int, \App\Models\TemplateCopy>>  $copies
     * @return list<array<string, mixed>>
     */
    private function buildPhases(InterviewTemplate $template, Collection $copies): array
    {
        return $template->phases->map(function ($phase) use ($copies) {
            $code = $phase->code;
            $payload = [
                'code' => $code,
                'title' => $this->copyBody($copies, "phase_{$code}_title"),
                'objective' => $this->copyBody($copies, "phase_{$code}_objective"),
            ];

            if ($code === '0') {
                $intro = $this->copyBody($copies, 'phase_0_intro');
                if ($intro !== null) {
                    $payload['intro'] = $intro;
                }
            }

            return $payload;
        })->values()->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildQuestions(InterviewTemplate $template): array
    {
        $phaseCodes = $template->phases->pluck('code', 'id');

        return $template->phases
            ->flatMap(fn ($phase) => $phase->questions)
            ->sortBy('sort_order')
            ->values()
            ->map(function ($question) use ($phaseCodes) {
                $texts = $question->texts->keyBy(fn ($text) => $text->register->value);

                return [
                    'code' => $question->code,
                    'phaseCode' => (string) $phaseCodes[$question->phase_id],
                    'labelTu' => $texts[Register::Tu->value]->body ?? '',
                    'labelUsted' => $texts[Register::Usted->value]->body ?? '',
                ];
            })
            ->all();
    }

    /**
     * @param  Collection<string, Collection<int, \App\Models\TemplateCopy>>  $copies
     * @return array<string, mixed>
     */
    private function buildCopy(Collection $copies, ?Settings $settings): array
    {
        $copy = [];

        foreach (self::COPY_KEY_MAP as $dbKey => $jsonKey) {
            $body = $this->copyBody($copies, $dbKey);
            if ($body === null) {
                continue;
            }

            if (in_array($dbKey, self::JSON_COPY_KEYS, true)) {
                $decoded = json_decode($body, true);
                $copy[$jsonKey] = is_array($decoded) ? $decoded : [];
            } else {
                $copy[$jsonKey] = $body;
            }
        }

        $farewellTu = $copies->get('farewell')?->firstWhere('register', Register::Tu);
        $farewellUsted = $copies->get('farewell')?->firstWhere('register', Register::Usted);
        if ($farewellTu !== null) {
            $copy['farewellTu'] = $farewellTu->body;
        }
        if ($farewellUsted !== null) {
            $copy['farewellUsted'] = $farewellUsted->body;
        }

        $phaseTransitions = [];
        foreach ($copies as $key => $rows) {
            if (preg_match('/^phase_transition_(\d+)$/', $key, $matches)) {
                $phaseTransitions[$matches[1]] = $rows->first()?->body ?? '';
            }
        }
        $copy['phaseTransitions'] = $phaseTransitions;

        if ($settings?->privacy_notice_url && ! isset($copy['privacyLinkUrl'])) {
            $copy['privacyLinkUrl'] = $settings->privacy_notice_url;
        }

        return $copy;
    }

    /**
     * @param  Collection<string, Collection<int, \App\Models\TemplateCopy>>  $copies
     */
    private function copyBody(Collection $copies, string $key): ?string
    {
        return $copies->get($key)?->firstWhere('register', Register::Neutral)?->body;
    }

    /**
     * @return array<string, array{body: string|null, skipped: bool}>
     */
    private function buildAnswersMap(Interview $interview): array
    {
        $map = [];

        foreach ($interview->answers as $answer) {
            $map[$answer->question_code] = [
                'body' => $answer->body,
                'skipped' => $answer->skipped,
            ];
        }

        return $map;
    }

    /**
     * @return array<string, mixed>
     */
    private function buildBranding(?Settings $settings): array
    {
        return [
            'displayName' => $settings?->display_name,
            'logoUrl' => $settings?->logo_url,
            'logoAlt' => $settings?->logo_alt,
            'primaryColor' => $settings?->primary_color,
            'accentColor' => $settings?->accent_color,
            'privacyNoticeUrl' => $settings?->privacy_notice_url,
            'tagline' => $settings?->tagline,
        ];
    }
}
