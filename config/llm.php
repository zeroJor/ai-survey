<?php

return [

    'default' => env('LLM_DRIVER', 'gemini'),

    'timeout_ms' => (int) env('LLM_TIMEOUT_SECONDS', 25) * 1000,

    'drivers' => [
        'gemini' => [
            'model' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
            'api_key' => env('GEMINI_API_KEY'),
        ],
    ],

    'limits' => [
        'micro_reply' => 48,
        'farewell' => 80,
        'studio_prep_summary' => 700,
    ],

];
