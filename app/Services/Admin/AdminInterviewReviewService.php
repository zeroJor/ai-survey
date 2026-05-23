<?php

namespace App\Services\Admin;

use App\Enums\AiMessageType;
use App\Enums\Register;
use App\Models\Interview;
use App\Models\Question;
use App\Services\Interview\InterviewQuestionCatalog;

class AdminInterviewReviewService
{
    public function __construct(
        private readonly InterviewQuestionCatalog $catalog,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function serialize(Interview $interview): array
    {
        $interview->loadMissing([
            'invite',
            'answers',
            'aiMessages',
            'artifact',
            'invite.interviewTemplate.phases.questions.texts',
        ]);

        $invite = $interview->invite;
        $template = $invite->interviewTemplate;
        $codes = $this->catalog->orderedCodes($template);

        $questionsByCode = $template->phases
            ->flatMap(fn ($phase) => $phase->questions)
            ->keyBy('code');

        $answersByCode = $interview->answers->keyBy('question_code');
        $microReplies = $interview->aiMessages
            ->where('type', AiMessageType::MicroReply)
            ->keyBy('question_code');

        $farewellMessage = $interview->aiMessages
            ->firstWhere('type', AiMessageType::Farewell);

        $questions = [];

        foreach ($codes as $code) {
            /** @var Question|null $question */
            $question = $questionsByCode->get($code);
            $answer = $answersByCode->get($code);
            $micro = $microReplies->get($code);

            $questions[] = [
                'code' => $code,
                'labelNeutral' => $this->questionLabel($question),
                'answer' => $answer === null ? null : [
                    'body' => $answer->body,
                    'skipped' => (bool) $answer->skipped,
                ],
                'microReply' => $micro === null ? null : [
                    'text' => $micro->content,
                    'sentimentId' => $micro->sentiment_id,
                    'source' => $micro->source?->value,
                ],
            ];
        }

        return [
            'interview' => [
                'id' => $interview->id,
                'status' => $interview->status->value,
                'register' => $interview->register?->value,
                'startedAt' => $interview->started_at?->toIso8601String(),
                'completedAt' => $interview->completed_at?->toIso8601String(),
            ],
            'invite' => [
                'id' => $invite->id,
                'contactName' => $invite->contact_name,
                'businessName' => $invite->business_name,
                'businessAbout' => $invite->business_about,
                'clientEmail' => $invite->client_email,
                'clientWhatsapp' => $invite->client_whatsapp,
            ],
            'questions' => $questions,
            'farewell' => $farewellMessage === null ? null : [
                'content' => $farewellMessage->content,
                'source' => $farewellMessage->source?->value,
            ],
            'artifact' => $interview->artifact === null
                ? null
                : [
                    'schemaVersion' => $interview->artifact->schema_version,
                    'generatedAt' => $interview->artifact->generated_at?->toIso8601String(),
                    'analysis' => $interview->artifact->analysis_json,
                ],
        ];
    }

    private function questionLabel(?Question $question): string
    {
        if ($question === null) {
            return '';
        }

        foreach ([Register::Neutral, Register::Tu, Register::Usted] as $register) {
            $text = $question->texts
                ->first(fn ($row) => $row->field === 'label' && $row->register === $register);

            if ($text !== null && $text->body !== '') {
                return $text->body;
            }
        }

        return '';
    }
}
