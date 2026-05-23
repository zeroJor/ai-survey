<?php

namespace Tests\Concerns;

use App\Models\InterviewSession;
use App\Models\InterviewTemplate;
use App\Models\Invite;
use App\Models\User;
use App\Services\Interview\ActionJwtService;

trait InteractsWithInterviewEntry
{
    protected function issueInviteToken(?Invite $invite = null): string
    {
        $invite ??= $this->createTestInvite();

        return app(ActionJwtService::class)->issue($invite);
    }

    protected function createTestInvite(): Invite
    {
        $template = InterviewTemplate::query()->active()->first()
            ?? InterviewTemplate::factory()->active()->create();

        $user = User::factory()->create();

        return Invite::factory()->create([
            'user_id' => $user->id,
            'interview_template_id' => $template->id,
            'token_jti' => 'pending',
            'access_token_expires_at' => now(),
        ]);
    }

    protected function enterInvite(string $token): void
    {
        $this->get('/invites?t='.urlencode($token));

        $session = InterviewSession::query()->latest('created_at')->first();

        if ($session !== null) {
            $this->withInterviewSessionCookie($session);
        }
    }

    protected function withInterviewSessionCookie(InterviewSession $session): static
    {
        return $this->withUnencryptedCookie(
            config('interview.session_cookie'),
            (string) $session->id,
        );
    }

    protected function latestInterviewSession(): ?InterviewSession
    {
        return InterviewSession::query()->latest('created_at')->first();
    }

    /**
     * @return array<string, string>
     */
    protected function interviewSessionCookies(?InterviewSession $session = null): array
    {
        $session ??= $this->latestInterviewSession();

        if ($session === null) {
            return [];
        }

        return [config('interview.session_cookie') => (string) $session->id];
    }

    protected function getTalkApi(?InterviewSession $session = null): \Illuminate\Testing\TestResponse
    {
        return $this->call(
            'GET',
            '/api/talk',
            [],
            $this->interviewSessionCookies($session),
            [],
            ['HTTP_ACCEPT' => 'application/json'],
        );
    }

    protected function patchTalkApi(array $payload, ?InterviewSession $session = null): \Illuminate\Testing\TestResponse
    {
        return $this->call(
            'PATCH',
            '/api/talk',
            [],
            $this->interviewSessionCookies($session),
            [],
            ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json'],
            json_encode($payload),
        );
    }

    protected function ensureCsrfForSession(?InterviewSession $session = null): void
    {
        $this->call(
            'GET',
            '/sanctum/csrf-cookie',
            [],
            $this->interviewSessionCookies($session),
        );
    }

    protected function postAnswersApi(
        array $payload,
        ?InterviewSession $session = null,
    ): \Illuminate\Testing\TestResponse {
        return $this->call(
            'POST',
            '/api/answers',
            [],
            $this->interviewSessionCookies($session),
            [],
            ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json'],
            json_encode($payload),
        );
    }

    protected function postTalkCompleteApi(
        ?InterviewSession $session = null,
    ): \Illuminate\Testing\TestResponse {
        return $this->call(
            'POST',
            '/api/talk/complete',
            [],
            $this->interviewSessionCookies($session),
            [],
            ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json'],
            json_encode([]),
        );
    }

    /**
     * @return list<string>
     */
    protected function seededQuestionCodes(): array
    {
        $response = $this->getTalkApi();
        $response->assertOk();

        return collect($response->json('content.questions'))
            ->pluck('code')
            ->all();
    }
}
