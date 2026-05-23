<?php

namespace App\Http\Middleware;

use App\Models\Interview;
use App\Models\InterviewSession;
use App\Services\Interview\InterviewSessionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InterviewSessionMiddleware
{
    public function __construct(
        private readonly InterviewSessionService $sessions,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $cookieName = config('interview.session_cookie', 'interview_session');
        $sessionId = $request->cookie($cookieName);

        if (! is_string($sessionId) || $sessionId === '') {
            return $this->unauthorized();
        }

        $session = InterviewSession::query()
            ->with([
                'interview.invite.interviewTemplate',
                'interview.invite',
                'interview.answers',
            ])
            ->whereKey($sessionId)
            ->where('expires_at', '>', now())
            ->first();

        if ($session === null) {
            return $this->unauthorized();
        }

        $request->attributes->set('interview_session', $session);
        $request->attributes->set('interview', $session->interview);

        $response = $next($request);

        $session = $this->sessions->extendSession($session);

        return $this->sessions->attachCookie($response, $session);
    }

    private function unauthorized(): Response
    {
        return response()->json([
            'message' => 'Interview session required.',
        ], 401);
    }
}
