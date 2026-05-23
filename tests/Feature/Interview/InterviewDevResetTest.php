<?php

namespace Tests\Feature\Interview;

use App\Enums\InterviewStatus;
use App\Models\Answer;
use App\Models\Interview;
use App\Models\InterviewSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class InterviewDevResetTest extends TestCase
{
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_reset_on_invite_entry_clears_progress_in_local(): void
    {
        $invite = $this->createTestInvite();
        $token = $this->issueInviteToken($invite);

        $this->get('/invites?t='.urlencode($token));
        $interview = Interview::query()->where('invite_id', $invite->id)->firstOrFail();
        Answer::query()->create([
            'interview_id' => $interview->id,
            'question_code' => 'q01',
            'body' => 'Respuesta previa',
            'skipped' => false,
        ]);
        $interview->update([
            'status' => InterviewStatus::InProgress,
            'started_at' => now(),
        ]);

        $token2 = $this->issueInviteToken($invite->fresh());
        $response = $this->get('/invites?t='.urlencode($token2).'&reset=1');

        $response->assertRedirect('/talk');
        $interview->refresh();
        $this->assertSame(InterviewStatus::NotStarted, $interview->status);
        $this->assertDatabaseMissing('answers', ['interview_id' => $interview->id]);
    }

    public function test_reset_on_invite_entry_ignored_outside_local(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $invite = $this->createTestInvite();
        $token = $this->issueInviteToken($invite);

        $this->get('/invites?t='.urlencode($token));
        $interview = Interview::query()->where('invite_id', $invite->id)->firstOrFail();
        Answer::query()->create([
            'interview_id' => $interview->id,
            'question_code' => 'q01',
            'body' => 'Respuesta previa',
            'skipped' => false,
        ]);
        $interview->update(['status' => InterviewStatus::InProgress]);

        $token2 = $this->issueInviteToken($invite->fresh());
        $this->get('/invites?t='.urlencode($token2).'&reset=1');

        $this->assertDatabaseHas('answers', [
            'interview_id' => $interview->id,
            'body' => 'Respuesta previa',
        ]);
        $this->assertSame(InterviewStatus::InProgress, $interview->fresh()->status);
    }

    public function test_reset_on_talk_clears_progress_and_strips_query_in_local(): void
    {
        $invite = $this->createTestInvite();
        $token = $this->issueInviteToken($invite);

        $this->get('/invites?t='.urlencode($token));
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $interview = Interview::query()->where('invite_id', $invite->id)->firstOrFail();
        Answer::query()->create([
            'interview_id' => $interview->id,
            'question_code' => 'q01',
            'body' => 'Respuesta previa',
            'skipped' => false,
        ]);
        $interview->update(['status' => InterviewStatus::InProgress]);

        $response = $this->withInterviewSessionCookie($session)
            ->get('/talk?reset=1&scenario=completed');

        $response->assertRedirect('/talk');
        $interview->refresh();
        $this->assertSame(InterviewStatus::NotStarted, $interview->status);
        $this->assertDatabaseMissing('answers', ['interview_id' => $interview->id]);
        $this->assertSame(1, InterviewSession::query()->count());
    }

    public function test_completed_interview_can_restart_via_reset_on_invite(): void
    {
        $invite = $this->createTestInvite();
        $token = $this->issueInviteToken($invite);

        $this->get('/invites?t='.urlencode($token));
        $interview = Interview::query()->where('invite_id', $invite->id)->firstOrFail();
        $interview->update([
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
        ]);

        $token2 = $this->issueInviteToken($invite->fresh());
        $response = $this->get('/invites?t='.urlencode($token2).'&reset=1');

        $response->assertRedirect('/talk');
        $response->assertCookie(config('interview.session_cookie'));
        $this->assertSame(InterviewStatus::NotStarted, $interview->fresh()->status);
    }
}
