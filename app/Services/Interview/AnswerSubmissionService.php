<?php

namespace App\Services\Interview;

use App\Enums\AiMessageSource;
use App\Enums\AiMessageType;
use App\Enums\InterviewStatus;
use App\Enums\InviteStatus;
use App\Exceptions\InterviewFlowException;
use App\Models\AiMessage;
use App\Models\Answer;
use App\Models\Interview;
use App\Services\Llm\LlmGateway;
use App\Services\Llm\MicroReplyRequest;
use Illuminate\Support\Facades\DB;

class AnswerSubmissionService
{
    public function __construct(
        private readonly LlmGateway $llm,
        private readonly InterviewQuestionCatalog $catalog,
        private readonly QuestionLabelResolver $labels,
        private readonly TalkBootstrapBuilder $bootstrap,
    ) {}

    /**
     * @return array{microReply: array{text: string, sentimentId: string}, progress: array<string, mixed>}
     */
    public function submit(
        Interview $interview,
        string $questionCode,
        string $answer,
        bool $skipped,
    ): array {
        $interview->loadMissing('invite.interviewTemplate.phases.questions', 'answers');

        $this->assertCanMutate($interview);

        if ($interview->register === null) {
            throw InterviewFlowException::unprocessable('Register must be set before answering.');
        }

        $template = $interview->invite->interviewTemplate;
        $questionIndex = $this->catalog->indexForCode($template, $questionCode);

        if ($questionIndex === null) {
            throw InterviewFlowException::unprocessable('Unknown question code.');
        }

        $body = $skipped ? null : trim($answer);
        if (! $skipped && ($body === null || $body === '')) {
            $skipped = true;
            $body = null;
        }

        return DB::transaction(function () use (
            $interview,
            $questionCode,
            $body,
            $skipped,
            $template,
            $questionIndex,
        ) {
            if ($interview->status === InterviewStatus::NotStarted) {
                $interview->update([
                    'status' => InterviewStatus::InProgress,
                    'started_at' => now(),
                ]);
            }

            Answer::query()->updateOrCreate(
                [
                    'interview_id' => $interview->id,
                    'question_code' => $questionCode,
                ],
                [
                    'body' => $body,
                    'skipped' => $skipped,
                ],
            );

            $questionLabel = $this->labels->labelForCode(
                $template,
                $questionCode,
                $interview->register,
            );

            $micro = $this->llm->microReply(new MicroReplyRequest(
                register: $interview->register,
                answerBody: $body ?? '',
                skipped: $skipped,
                questionIndex: $questionIndex,
                template: $template,
                useLlmPool: $this->llm->llmEnabled(),
                questionCode: $questionCode,
                questionLabel: $questionLabel,
            ));

            $sequence = (int) AiMessage::query()
                ->where('interview_id', $interview->id)
                ->max('sequence') + 1;

            AiMessage::query()->create([
                'interview_id' => $interview->id,
                'type' => AiMessageType::MicroReply,
                'question_code' => $questionCode,
                'content' => $micro->text,
                'sequence' => $sequence,
                'sentiment_id' => $micro->sentimentId,
                'register' => $interview->register,
                'source' => $micro->fromTemplate
                    ? AiMessageSource::Template
                    : AiMessageSource::Llm,
            ]);

            $nextCode = $this->catalog->nextCodeAfter($template, $questionCode);
            $interview->update(['current_question_code' => $nextCode]);
            $interview->refresh();

            $snapshot = $this->bootstrap->build($interview);

            return [
                'microReply' => [
                    'text' => $micro->text,
                    'sentimentId' => $micro->sentimentId,
                ],
                'progress' => $snapshot['progress'],
            ];
        });
    }

    private function assertCanMutate(Interview $interview): void
    {
        if ($interview->invite->status === InviteStatus::Revoked) {
            throw InterviewFlowException::conflict('This invite has been revoked.');
        }

        if ($interview->status === InterviewStatus::Completed) {
            throw InterviewFlowException::conflict('This interview is already completed.');
        }
    }
}
