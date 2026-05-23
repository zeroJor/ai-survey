<?php

namespace Tests\Feature\Llm;

use App\Enums\AiMessageSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\FakesGeminiApi;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class MicroReplyLlmTest extends TestCase
{
    use FakesGeminiApi;
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_llm_enabled_uses_gemini_and_persists_llm_source(): void
    {
        $this->enableLlmForTests();
        $this->fakeGeminiJsonResponse([
            'text' => 'Qué buen detalle con las flores.',
            'sentimentId' => 'smile',
        ]);

        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        $codes = $this->seededQuestionCodes();
        $response = $this->postAnswersApi([
            'questionCode' => $codes[0],
            'answer' => 'Vendemos flores para eventos.',
            'skipped' => false,
        ], $session);

        $response->assertOk();
        $response->assertJsonPath('microReply.sentimentId', 'smile');

        $this->assertDatabaseHas('ai_messages', [
            'interview_id' => $session->interview_id,
            'question_code' => $codes[0],
            'source' => AiMessageSource::Llm->value,
            'content' => 'Qué buen detalle con las flores.',
        ]);

        Http::assertSentCount(1);
    }

    public function test_invalid_sentiment_id_from_gemini_is_normalized_to_atenta(): void
    {
        $this->enableLlmForTests();
        $this->fakeGeminiJsonResponse([
            'text' => 'Entendido.',
            'sentimentId' => 'not-a-real-id',
        ]);

        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        $codes = $this->seededQuestionCodes();
        $response = $this->postAnswersApi([
            'questionCode' => $codes[0],
            'answer' => 'Respuesta.',
            'skipped' => false,
        ], $session);

        $response->assertOk();
        $response->assertJsonPath('microReply.sentimentId', 'atenta');
    }

    public function test_skip_answer_still_succeeds_with_llm(): void
    {
        $this->enableLlmForTests();
        $this->fakeGeminiJsonResponse([
            'text' => 'Sin problema, seguimos.',
            'sentimentId' => 'atenta',
        ]);

        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        $codes = $this->seededQuestionCodes();
        $response = $this->postAnswersApi([
            'questionCode' => $codes[0],
            'answer' => '',
            'skipped' => true,
        ], $session);

        $response->assertOk();
        $response->assertJsonPath('microReply.sentimentId', 'atenta');
        $this->assertStringNotContainsString(
            'Prefiero no contestar',
            (string) $response->json('microReply.text'),
        );
    }

    public function test_llm_disabled_does_not_call_gemini(): void
    {
        $this->disableLlmForTests();
        Http::fake();

        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        $codes = $this->seededQuestionCodes();
        $this->postAnswersApi([
            'questionCode' => $codes[0],
            'answer' => 'Respuesta de prueba.',
            'skipped' => false,
        ], $session)->assertOk();

        Http::assertNothingSent();

        $this->assertDatabaseHas('ai_messages', [
            'interview_id' => $session->interview_id,
            'question_code' => $codes[0],
            'source' => AiMessageSource::Template->value,
        ]);
    }

    public function test_gemini_error_falls_back_to_template_and_saves_answer(): void
    {
        $this->enableLlmForTests();
        $this->fakeGeminiHttpError();

        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        $codes = $this->seededQuestionCodes();
        $response = $this->postAnswersApi([
            'questionCode' => $codes[0],
            'answer' => 'Respuesta guardada.',
            'skipped' => false,
        ], $session);

        $response->assertOk();

        $this->assertDatabaseHas('answers', [
            'interview_id' => $session->interview_id,
            'question_code' => $codes[0],
            'body' => 'Respuesta guardada.',
        ]);

        $this->assertDatabaseHas('ai_messages', [
            'interview_id' => $session->interview_id,
            'question_code' => $codes[0],
            'source' => AiMessageSource::Template->value,
        ]);
    }
}
