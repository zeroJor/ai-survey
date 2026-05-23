<?php

namespace App\Services\Interview;

use App\Models\Interview;
use App\Models\InterviewSession;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Cookie\CookieJar;
use Symfony\Component\HttpFoundation\Response;

class InterviewSessionService
{
    public function __construct(
        private readonly Config $config,
        private readonly CookieJar $cookies,
    ) {}

    public function createSession(Interview $interview): InterviewSession
    {
        $expiresAt = $this->expiresAt();

        return InterviewSession::query()->create([
            'interview_id' => $interview->id,
            'expires_at' => $expiresAt,
            'last_seen_at' => now(),
        ]);
    }

    public function extendSession(InterviewSession $session): InterviewSession
    {
        $session->forceFill([
            'expires_at' => $this->expiresAt(),
            'last_seen_at' => now(),
        ])->save();

        return $session;
    }

    public function attachCookie(Response $response, InterviewSession $session): Response
    {
        $cookie = $this->cookies->make(
            $this->config->get('interview.session_cookie', 'interview_session'),
            $session->id,
            $this->cookieLifetimeMinutes(),
            '/',
            null,
            $this->config->get('session.secure', false),
            true,
            false,
            $this->config->get('session.same_site', 'lax'),
        );

        return $response->withCookie($cookie);
    }

    private function expiresAt(): CarbonInterface
    {
        return now()->addDays($this->config->get('interview.session_ttl_days', 7));
    }

    private function cookieLifetimeMinutes(): int
    {
        return $this->config->get('interview.session_ttl_days', 7) * 24 * 60;
    }
}
