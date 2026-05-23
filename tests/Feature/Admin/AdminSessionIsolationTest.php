<?php

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class AdminSessionIsolationTest extends TestCase
{
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_interview_session_does_not_grant_admin_api_access(): void
    {
        $this->enterInvite($this->issueInviteToken());
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->withInterviewSessionCookie($session)
            ->getJson('/api/admin/settings')
            ->assertUnauthorized();
    }
}
