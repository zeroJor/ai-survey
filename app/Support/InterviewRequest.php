<?php

namespace App\Support;

use App\Models\Interview;
use App\Models\InterviewSession;
use Illuminate\Http\Request;

final class InterviewRequest
{
    public static function interview(Request $request): Interview
    {
        $interview = $request->attributes->get('interview');

        if (! $interview instanceof Interview) {
            throw new \RuntimeException('Interview not bound to request.');
        }

        return $interview;
    }

    public static function session(Request $request): InterviewSession
    {
        $session = $request->attributes->get('interview_session');

        if (! $session instanceof InterviewSession) {
            throw new \RuntimeException('Interview session not bound to request.');
        }

        return $session;
    }
}
