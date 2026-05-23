<?php

namespace Tests\Feature\Interview;

use App\Enums\InterviewStatus;
use App\Enums\InviteStatus;
use App\Models\Interview;
use App\Models\InterviewSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class InviteEntryTest extends TestCase
{
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_valid_token_redirects_with_session_cookie(): void
    {
        $invite = $this->createTestInvite();
        $token = $this->issueInviteToken($invite);

        $response = $this->get('/invites?t='.urlencode($token));

        $response->assertRedirect('/talk');
        $response->assertCookie(config('interview.session_cookie'));

        $this->assertDatabaseHas('interviews', ['invite_id' => $invite->id]);
        $this->assertSame(1, InterviewSession::query()->count());
    }

    public function test_second_visit_reuses_same_interview(): void
    {
        $invite = $this->createTestInvite();
        $token = $this->issueInviteToken($invite);

        $this->get('/invites?t='.urlencode($token));
        $interviewId = Interview::query()->where('invite_id', $invite->id)->value('id');

        $token2 = $this->issueInviteToken($invite->fresh());
        $this->get('/invites?t='.urlencode($token2));

        $this->assertSame(1, Interview::query()->where('invite_id', $invite->id)->count());
        $this->assertSame($interviewId, Interview::query()->where('invite_id', $invite->id)->value('id'));
        $this->assertSame(2, InterviewSession::query()->count());
    }

    public function test_revoked_invite_redirects_without_cookie(): void
    {
        $invite = $this->createTestInvite();
        $invite->update(['status' => InviteStatus::Revoked, 'revoked_at' => now()]);
        $token = $this->issueInviteToken($invite->fresh());

        $response = $this->get('/invites?t='.urlencode($token));

        $response->assertRedirect('/talk?scenario=revoked');
        $response->assertCookieMissing(config('interview.session_cookie'));
    }

    public function test_completed_interview_redirects_with_cookie(): void
    {
        $invite = $this->createTestInvite();
        $token = $this->issueInviteToken($invite);
        $this->get('/invites?t='.urlencode($token));

        $interview = Interview::query()->where('invite_id', $invite->id)->first();
        $interview->update([
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
        ]);

        $token2 = $this->issueInviteToken($invite->fresh());
        $response = $this->get('/invites?t='.urlencode($token2));

        $response->assertRedirect('/talk?scenario=completed');
        $response->assertCookie(config('interview.session_cookie'));
    }

    public function test_invalid_token_redirects_revoked_without_cookie(): void
    {
        $response = $this->get('/invites?t=not-a-valid-jwt');

        $response->assertRedirect('/talk?scenario=revoked');
        $response->assertCookieMissing(config('interview.session_cookie'));
    }
}
