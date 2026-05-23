<?php

namespace Tests\Feature\Interview;

use App\Enums\AiMessageSource;
use App\Enums\AiMessageType;
use App\Enums\InterviewStatus;
use App\Models\AiMessage;
use App\Models\Answer;
use App\Models\Interview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class AnswersApiTest extends TestCase
{
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_post_answer_persists_answer_and_micro_reply(): void
    {
        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        $codes = $this->seededQuestionCodes();
        $this->assertNotEmpty($codes);

        $response = $this->postAnswersApi([
            'questionCode' => $codes[0],
            'answer' => 'Vendemos flores para eventos.',
            'skipped' => false,
        ], $session);

        $response->assertOk();
        $response->assertJsonStructure([
            'microReply' => ['text', 'sentimentId'],
            'progress' => ['answers', 'currentQuestionCode'],
        ]);

        $interview = Interview::query()->findOrFail($session->interview_id);

        $this->assertDatabaseHas('answers', [
            'interview_id' => $interview->id,
            'question_code' => $codes[0],
            'skipped' => false,
        ]);

        $this->assertDatabaseHas('ai_messages', [
            'interview_id' => $interview->id,
            'type' => AiMessageType::MicroReply->value,
            'source' => AiMessageSource::Template->value,
            'question_code' => $codes[0],
        ]);

        $talk = $this->getTalkApi($session);
        $talk->assertOk();
        $answers = $talk->json('progress.answers');
        $this->assertIsArray($answers);
        $this->assertFalse($answers[$codes[0]]['skipped'] ?? true);
        $talk->assertJsonPath('progress.currentQuestionCode', $codes[1] ?? null);
    }

    public function test_skip_answer_uses_atenta_sentiment(): void
    {
        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'usted'], $session)->assertOk();

        $code = $this->seededQuestionCodes()[0];

        $response = $this->postAnswersApi([
            'questionCode' => $code,
            'answer' => '',
            'skipped' => true,
        ], $session);

        $response->assertOk();
        $response->assertJsonPath('microReply.sentimentId', 'atenta');

        $interview = Interview::query()->findOrFail($session->interview_id);

        $this->assertTrue(
            Answer::query()
                ->where('interview_id', $interview->id)
                ->where('question_code', $code)
                ->value('skipped'),
        );
    }

    public function test_post_answer_without_session_returns_unauthorized(): void
    {
        $this->postJson('/api/answers', [
            'questionCode' => '1.1',
            'answer' => 'test',
            'skipped' => false,
        ])->assertUnauthorized();
    }

    public function test_post_answer_when_completed_returns_conflict(): void
    {
        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        Interview::query()
            ->whereKey($session->interview_id)
            ->update(['status' => InterviewStatus::Completed]);

        $this->ensureCsrfForSession($session);

        $this->postAnswersApi([
            'questionCode' => '1.1',
            'answer' => 'test',
            'skipped' => false,
        ], $session)->assertStatus(409);
    }
}
