<?php

namespace Database\Seeders;

use App\Enums\Register;
use App\Models\InterviewTemplate;
use App\Models\Phase;
use App\Models\Question;
use App\Models\QuestionText;
use App\Models\TemplateCopy;
use Illuminate\Database\Seeder;

class InterviewTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/interview-v1.json');
        $data = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        InterviewTemplate::query()->update(['is_active' => false]);

        $template = InterviewTemplate::query()->updateOrCreate(
            ['version' => $data['version']],
            [
                'is_active' => true,
                'published_at' => now(),
            ],
        );

        foreach ($data['phases'] as $index => $phaseData) {
            Phase::query()->updateOrCreate(
                [
                    'interview_template_id' => $template->id,
                    'code' => (string) $phaseData['code'],
                ],
                ['sort_order' => $index],
            );

            if (isset($phaseData['title'])) {
                $this->upsertCopy(
                    $template->id,
                    'phase_'.$phaseData['code'].'_title',
                    Register::Neutral,
                    $phaseData['title'],
                );
            }

            if (isset($phaseData['objective'])) {
                $this->upsertCopy(
                    $template->id,
                    'phase_'.$phaseData['code'].'_objective',
                    Register::Neutral,
                    $phaseData['objective'],
                );
            }

            if ($phaseData['code'] === '0' && isset($phaseData['intro'])) {
                $this->upsertCopy($template->id, 'phase_0_intro', Register::Neutral, $phaseData['intro']);
            }
        }

        $phaseIdsByCode = Phase::query()
            ->where('interview_template_id', $template->id)
            ->pluck('id', 'code');

        foreach ($data['questions'] as $index => $questionData) {
            $phaseId = $phaseIdsByCode[(string) $questionData['phaseCode']];
            $question = Question::query()->updateOrCreate(
                [
                    'phase_id' => $phaseId,
                    'code' => $questionData['code'],
                ],
                [
                    'sort_order' => $index + 1,
                    'input_type' => 'long_text',
                ],
            );

            QuestionText::query()->updateOrCreate(
                [
                    'question_id' => $question->id,
                    'field' => 'label',
                    'register' => Register::Tu,
                ],
                ['body' => $questionData['labelTu']],
            );

            QuestionText::query()->updateOrCreate(
                [
                    'question_id' => $question->id,
                    'field' => 'label',
                    'register' => Register::Usted,
                ],
                ['body' => $questionData['labelUsted']],
            );
        }

        $this->seedTemplateCopies($template->id, $data['copy']);
    }

    private function seedTemplateCopies(int $templateId, array $copy): void
    {
        $neutral = Register::Neutral;

        $scalarCopies = [
            'assistant_intro' => $copy['assistantIntro'] ?? null,
            'assistant_intro_cta' => $copy['assistantIntroCta'] ?? null,
            'privacy_title' => $copy['privacyTitle'] ?? null,
            'privacy_body' => $copy['privacyBody'] ?? null,
            'privacy_link_label' => $copy['privacyLinkLabel'] ?? null,
            'privacy_link_url' => $copy['privacyLinkUrl'] ?? null,
            'privacy_duration' => $copy['privacyDuration'] ?? null,
            'privacy_duration_note' => $copy['privacyDurationNote'] ?? null,
            'tone_lead' => $copy['toneLead'] ?? null,
            'tone_option_tu' => $copy['toneOptionTu'] ?? null,
            'tone_option_usted' => $copy['toneOptionUsted'] ?? null,
            'tone_preview_tu' => $copy['tonePreviewTu'] ?? null,
            'tone_preview_usted' => $copy['tonePreviewUsted'] ?? null,
            'revoked_title' => $copy['revokedTitle'] ?? null,
            'revoked_body' => $copy['revokedBody'] ?? null,
            'skip_label' => $copy['skipLabel'] ?? null,
            'continue_label' => $copy['continueLabel'] ?? null,
        ];

        foreach ($scalarCopies as $key => $body) {
            if ($body !== null) {
                $this->upsertCopy($templateId, $key, $neutral, $body);
            }
        }

        if (isset($copy['farewellTu'])) {
            $this->upsertCopy($templateId, 'farewell', Register::Tu, $copy['farewellTu']);
        }
        if (isset($copy['farewellUsted'])) {
            $this->upsertCopy($templateId, 'farewell', Register::Usted, $copy['farewellUsted']);
        }

        foreach ($copy['phaseTransitions'] ?? [] as $phaseNumber => $body) {
            $this->upsertCopy($templateId, "phase_transition_{$phaseNumber}", $neutral, $body);
        }

        $jsonCopies = [
            'micro_reply_templates_tu' => $copy['microRepliesTu'] ?? null,
            'micro_reply_templates_usted' => $copy['microRepliesUsted'] ?? null,
            'micro_reply_fallback_templates_tu' => $copy['microRepliesTemplateTu'] ?? null,
            'micro_reply_fallback_templates_usted' => $copy['microRepliesTemplateUsted'] ?? null,
        ];

        foreach ($jsonCopies as $key => $items) {
            if ($items !== null) {
                $this->upsertCopy(
                    $templateId,
                    $key,
                    $neutral,
                    json_encode($items, JSON_UNESCAPED_UNICODE),
                );
            }
        }
    }

    private function upsertCopy(int $templateId, string $key, Register $register, string $body): void
    {
        TemplateCopy::query()->updateOrCreate(
            [
                'interview_template_id' => $templateId,
                'key' => $key,
                'register' => $register,
            ],
            ['body' => $body],
        );
    }
}
