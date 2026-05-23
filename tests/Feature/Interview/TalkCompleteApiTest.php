<?php

namespace Tests\Feature\Interview;

use App\Enums\AiMessageType;
use App\Enums\InterviewStatus;
use App\Events\InterviewCompleted;
use App\Models\AiMessage;
use App\Models\Interview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class TalkCompleteApiTest extends TestCase
{
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_complete_interview_after_all_answers(): void
    {
        Event::fake([InterviewCompleted::class]);

        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        foreach ($this->seededQuestionCodes() as $code) {
            $this->postAnswersApi([
                'questionCode' => $code,
                'answer' => 'Respuesta de prueba.',
                'skipped' => false,
            ], $session)->assertOk();
        }

        $complete = $this->postTalkCompleteApi($session);
        $complete->assertOk();
        $complete->assertJsonPath('status', 'completed');
        $complete->assertJsonCount(0, 'content.questions');

        $interview = Interview::query()->findOrFail($session->interview_id);
        $this->assertSame(InterviewStatus::Completed, $interview->status);
        $this->assertNotNull($interview->completed_at);

        $this->assertTrue(
            AiMessage::query()
                ->where('interview_id', $interview->id)
                ->where('type', AiMessageType::Farewell->value)
                ->exists(),
        );

        Event::assertDispatched(InterviewCompleted::class);

        $this->getTalkApi($session)
            ->assertJsonPath('status', 'completed')
            ->assertJsonCount(0, 'content.questions');

        $this->postAnswersApi([
            'questionCode' => '1.1',
            'answer' => 'late',
            'skipped' => false,
        ], $session)->assertStatus(409);
    }

    public function test_second_complete_is_idempotent(): void
    {
        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'usted'], $session)->assertOk();

        foreach ($this->seededQuestionCodes() as $code) {
            $this->postAnswersApi([
                'questionCode' => $code,
                'answer' => 'Respuesta.',
                'skipped' => false,
            ], $session)->assertOk();
        }

        $this->postTalkCompleteApi($session)->assertOk();
        $this->postTalkCompleteApi($session)->assertOk()->assertJsonPath('status', 'completed');
    }

    public function test_complete_without_all_answers_returns_unprocessable(): void
    {
        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        $this->postTalkCompleteApi($session)->assertStatus(422);
    }
}
