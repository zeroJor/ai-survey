<?php

namespace Tests\Feature\Admin;

use App\Enums\InterviewStatus;
use App\Enums\InviteStatus;
use App\Models\Answer;
use App\Models\Interview;
use App\Models\Invite;
use App\Services\Interview\ActionJwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithAdmin;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class AdminInvitesApiTest extends TestCase
{
    use InteractsWithAdmin;
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_create_invite_returns_url_and_client_can_enter(): void
    {
        $response = $this->actingAsAdmin()->postJson('/api/admin/invites', [
            'contactName' => 'Ana',
            'businessName' => 'Taller Norte',
            'clientEmail' => 'ana@example.com',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['invite' => ['id'], 'inviteUrl']);

        $inviteUrl = $response->json('inviteUrl');
        $this->assertIsString($inviteUrl);

        $token = parse_url($inviteUrl, PHP_URL_QUERY);
        parse_str((string) $token, $query);
        $this->assertArrayHasKey('t', $query);

        $this->get('/invites?t='.urlencode($query['t']));
        $this->assertNotNull($this->latestInterviewSession());

        $talk = $this->getTalkApi($this->latestInterviewSession());
        $talk->assertOk();
    }

    public function test_create_requires_email_or_whatsapp(): void
    {
        $this->actingAsAdmin()->postJson('/api/admin/invites', [
            'contactName' => 'Ana',
            'businessName' => 'Taller',
        ])->assertStatus(422);
    }

    public function test_revoke_invite_blocks_client_talk(): void
    {
        $user = $this->adminUser();
        $create = $this->actingAs($user)->postJson('/api/admin/invites', [
            'contactName' => 'Luis',
            'businessName' => 'Café',
            'clientEmail' => 'luis@example.com',
        ])->assertCreated();

        $inviteId = $create->json('invite.id');
        $inviteUrl = $create->json('inviteUrl');
        parse_str((string) parse_url($inviteUrl, PHP_URL_QUERY), $query);

        $this->get('/invites?t='.urlencode($query['t']));
        $session = $this->latestInterviewSession();

        $this->actingAs($user)->postJson("/api/admin/invites/{$inviteId}/revoke")
            ->assertOk();

        $this->get('/invites?t='.urlencode($query['t']))
            ->assertRedirectContains('scenario=revoked');
    }

    public function test_list_includes_progress(): void
    {
        $invite = Invite::factory()->create(['status' => InviteStatus::Active]);
        $interview = Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::InProgress,
        ]);

        Answer::query()->create([
            'interview_id' => $interview->id,
            'question_code' => '1.1',
            'body' => 'Respuesta',
            'skipped' => false,
        ]);

        $response = $this->actingAsAdmin()->getJson('/api/admin/invites?status=in_progress');

        $response->assertOk();
        $response->assertJsonPath('data.0.progress.answered', 1);
        $response->assertJsonPath('data.0.displayStatus', 'in_progress');
    }

    public function test_show_returns_invite_url(): void
    {
        $invite = Invite::factory()->create();
        app(ActionJwtService::class)->issue($invite);

        $this->actingAsAdmin()->getJson("/api/admin/invites/{$invite->id}")
            ->assertOk()
            ->assertJsonPath('id', $invite->id)
            ->assertJsonStructure(['inviteUrl']);
    }
}
