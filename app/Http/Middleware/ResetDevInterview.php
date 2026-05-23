<?php

namespace App\Http\Middleware;

use App\Models\InterviewSession;
use App\Services\Interview\InterviewProgressResetService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResetDevInterview
{
    public function __construct(
        private readonly InterviewProgressResetService $reset,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->environment(['local', 'testing']) || ! $request->has('reset')) {
            return $next($request);
        }

        $cookieName = config('interview.session_cookie', 'interview_session');
        $sessionId = $request->cookie($cookieName);

        if (is_string($sessionId) && $sessionId !== '') {
            $session = InterviewSession::query()
                ->with('interview')
                ->whereKey($sessionId)
                ->where('expires_at', '>', now())
                ->first();

            if ($session?->interview !== null) {
                $this->reset->reset($session->interview);
            }
        }

        $query = $request->query();
        unset($query['reset'], $query['scenario']);

        $target = $request->url();
        if ($query !== []) {
            $target .= '?'.http_build_query($query);
        }

        return redirect($target);
    }
}
