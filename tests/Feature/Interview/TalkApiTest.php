<?php

namespace Tests\Feature\Interview;

use App\Enums\Register;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class TalkApiTest extends TestCase
{
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_get_talk_returns_bootstrap_with_nineteen_questions(): void
    {
        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $response = $this->getTalkApi($session);

        $response->assertOk();
        $response->assertJsonPath('status', 'not_started');
        $response->assertJsonCount(19, 'content.questions');
        $response->assertJsonPath('branding.primaryColor', '#00B4FF');
        $response->assertJsonPath('invite.contactName', fn ($value) => is_string($value) && $value !== '');
    }

    public function test_patch_talk_persists_register(): void
    {
        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->call(
            'GET',
            '/sanctum/csrf-cookie',
            [],
            $this->interviewSessionCookies($session),
        );

        $patch = $this->patchTalkApi(['register' => 'tu'], $session);

        $patch->assertOk();
        $patch->assertJsonPath('register', 'tu');
        $patch->assertJsonPath('status', 'in_progress');

        $get = $this->getTalkApi($session);
        $get->assertJsonPath('register', Register::Tu->value);
    }

    public function test_get_talk_without_cookie_returns_unauthorized(): void
    {
        $this->getJson('/api/talk')->assertUnauthorized();
    }
}
