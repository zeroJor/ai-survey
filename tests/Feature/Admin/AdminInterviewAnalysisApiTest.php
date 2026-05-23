<?php

namespace Tests\Feature\Admin;

use App\Enums\InterviewStatus;
use App\Models\Interview;
use App\Models\InterviewArtifact;
use App\Models\Invite;
use App\Models\Settings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\FakesGeminiApi;
use Tests\Concerns\InteractsWithAdmin;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class AdminInterviewAnalysisApiTest extends TestCase
{
    use FakesGeminiApi;
    use InteractsWithAdmin;
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_generate_summary_persists_artifact_sections(): void
    {
        $this->enableLlmForTests();
        $this->fakeGeminiJsonResponse([
            'psychologicalProfile' => 'Perfil A',
            'clientNeeds' => 'Necesidades B',
            'businessContext' => 'Contexto C',
            'salesStrategies' => 'Estrategias D',
            'recommendedNextSteps' => 'Pasos E',
            'risks' => 'Riesgos F',
            'keyQuotes' => ['Cita 1'],
        ]);

        $invite = Invite::factory()->create();
        $interview = Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
            'register' => 'tu',
        ]);

        $response = $this->actingAsAdmin()->postJson(
            "/api/admin/interviews/{$interview->id}/generate-summary",
        );

        $response->assertOk();
        $response->assertJsonPath('artifact.analysis.psychologicalProfile', 'Perfil A');
        $response->assertJsonPath('artifact.analysis.keyQuotes.0', 'Cita 1');

        $this->assertDatabaseHas('interview_artifacts', [
            'interview_id' => $interview->id,
        ]);

        $review = $this->actingAsAdmin()->getJson("/api/admin/interviews/{$interview->id}");
        $review->assertOk();
        $review->assertJsonPath('artifact.analysis.clientNeeds', 'Necesidades B');
    }

    public function test_regenerate_overwrites_artifact(): void
    {
        $this->enableLlmForTests();

        $invite = Invite::factory()->create();
        $interview = Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
            'register' => 'tu',
        ]);

        InterviewArtifact::query()->create([
            'interview_id' => $interview->id,
            'analysis_json' => ['psychologicalProfile' => 'viejo'],
            'schema_version' => '1',
            'generated_at' => now()->subDay(),
        ]);

        $this->fakeGeminiJsonResponse([
            'psychologicalProfile' => 'nuevo',
            'clientNeeds' => 'n',
            'businessContext' => 'n',
            'salesStrategies' => 'n',
            'recommendedNextSteps' => 'n',
            'risks' => 'n',
            'keyQuotes' => [],
        ]);

        $this->actingAsAdmin()->postJson(
            "/api/admin/interviews/{$interview->id}/generate-summary",
        )->assertOk();

        $this->assertSame(1, InterviewArtifact::query()->where('interview_id', $interview->id)->count());
        $this->assertSame(
            'nuevo',
            InterviewArtifact::query()->where('interview_id', $interview->id)->value('analysis_json')['psychologicalProfile'] ?? null,
        );
    }

    public function test_generate_requires_completed_interview(): void
    {
        $this->enableLlmForTests();

        $invite = Invite::factory()->create();
        $interview = Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::InProgress,
            'register' => 'tu',
        ]);

        $this->actingAsAdmin()->postJson(
            "/api/admin/interviews/{$interview->id}/generate-summary",
        )->assertStatus(422);
    }

    public function test_generate_forbidden_when_llm_disabled(): void
    {
        $this->disableLlmForTests();
        Http::fake();

        $invite = Invite::factory()->create();
        $interview = Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
            'register' => 'tu',
        ]);

        $this->actingAsAdmin()->postJson(
            "/api/admin/interviews/{$interview->id}/generate-summary",
        )->assertForbidden();

        Http::assertNothingSent();
    }
}
