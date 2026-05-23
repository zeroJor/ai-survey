<?php

namespace Tests\Feature\Admin;

use App\Enums\AiMessageSource;
use App\Enums\AiMessageType;
use App\Enums\InterviewStatus;
use App\Models\AiMessage;
use App\Models\Answer;
use App\Models\Interview;
use App\Models\Invite;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithAdmin;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class AdminInterviewReviewApiTest extends TestCase
{
    use InteractsWithAdmin;
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_review_returns_conversation_without_artifact(): void
    {
        $invite = Invite::factory()->create();
        $interview = Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
        ]);

        Answer::query()->create([
            'interview_id' => $interview->id,
            'question_code' => '1.1',
            'body' => 'Vendemos flores.',
            'skipped' => false,
        ]);

        AiMessage::query()->create([
            'interview_id' => $interview->id,
            'type' => AiMessageType::MicroReply,
            'question_code' => '1.1',
            'content' => 'Gracias.',
            'sequence' => 1,
            'sentiment_id' => 'smile',
            'source' => AiMessageSource::Template,
        ]);

        AiMessage::query()->create([
            'interview_id' => $interview->id,
            'type' => AiMessageType::Farewell,
            'question_code' => null,
            'content' => 'Hasta pronto.',
            'sequence' => 2,
            'source' => AiMessageSource::Template,
        ]);

        $response = $this->actingAsAdmin()->getJson("/api/admin/interviews/{$interview->id}");

        $response->assertOk();
        $response->assertJsonPath('artifact', null);
        $response->assertJsonPath('farewell.content', 'Hasta pronto.');
        $response->assertJsonPath('questions.0.code', '1.1');
        $response->assertJsonPath('questions.0.answer.body', 'Vendemos flores.');
        $response->assertJsonPath('questions.0.microReply.text', 'Gracias.');
    }
}
