<?php

namespace App\Services\Interview;

use App\Enums\AiMessageSource;
use App\Enums\AiMessageType;
use App\Enums\InterviewStatus;
use App\Enums\InviteStatus;
use App\Events\InterviewCompleted;
use App\Exceptions\InterviewFlowException;
use App\Models\AiMessage;
use App\Models\Interview;
use App\Services\Llm\FarewellRequest;
use App\Services\Llm\LlmGateway;
use Illuminate\Support\Facades\DB;

class InterviewCompletionService
{
    public function __construct(
        private readonly LlmGateway $llm,
        private readonly InterviewQuestionCatalog $catalog,
        private readonly TalkBootstrapBuilder $bootstrap,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function complete(Interview $interview): array
    {
        $interview->loadMissing(
            'invite.interviewTemplate.phases.questions',
            'answers',
            'aiMessages',
        );

        if ($interview->invite->status === InviteStatus::Revoked) {
            throw InterviewFlowException::conflict('This invite has been revoked.');
        }

        if ($interview->register === null) {
            throw InterviewFlowException::unprocessable('Register must be set before completing.');
        }

        if ($interview->status === InterviewStatus::Completed) {
            return $this->bootstrap->build($interview->fresh());
        }

        $template = $interview->invite->interviewTemplate;

        if (! $this->catalog->allAnswered($interview, $template)) {
            throw InterviewFlowException::unprocessable('All questions must be answered or skipped.');
        }

        return DB::transaction(function () use ($interview, $template) {
            $hasFarewell = $interview->aiMessages
                ->contains(fn (AiMessage $message) => $message->type === AiMessageType::Farewell);

            if (! $hasFarewell) {
                $text = $this->llm->farewell(new FarewellRequest(
                    register: $interview->register,
                    invite: $interview->invite,
                    template: $template,
                ));

                $sequence = (int) AiMessage::query()
                    ->where('interview_id', $interview->id)
                    ->max('sequence') + 1;

                AiMessage::query()->create([
                    'interview_id' => $interview->id,
                    'type' => AiMessageType::Farewell,
                    'question_code' => null,
                    'content' => $text,
                    'sequence' => $sequence,
                    'sentiment_id' => null,
                    'register' => $interview->register,
                    'source' => AiMessageSource::Template,
                ]);
            }

            $interview->update([
                'status' => InterviewStatus::Completed,
                'completed_at' => now(),
                'current_question_code' => null,
            ]);

            $interview->refresh();

            event(new InterviewCompleted($interview));

            return $this->bootstrap->build($interview);
        });
    }
}
