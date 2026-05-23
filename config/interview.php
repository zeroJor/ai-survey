<?php

return [

    'session_cookie' => env('INTERVIEW_SESSION_COOKIE', 'interview_session'),

    'action_jwt_secret' => env('ACTION_JWT_SECRET'),

    'action_jwt_ttl_days' => (int) env('ACTION_JWT_TTL_DAYS', 7),

    'session_ttl_days' => (int) env('INTERVIEW_SESSION_TTL_DAYS', 7),

];
