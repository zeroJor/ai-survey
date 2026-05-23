<?php

namespace Tests\Concerns;

use App\Models\Settings;
use Illuminate\Support\Facades\Http;

trait FakesGeminiApi
{
    protected function enableLlmForTests(): void
    {
        config(['llm.drivers.gemini.api_key' => 'test-gemini-key']);

        Settings::query()->findOrFail(1)->update(['llm_enabled' => true]);
    }

    protected function disableLlmForTests(): void
    {
        Settings::query()->findOrFail(1)->update(['llm_enabled' => false]);
    }

    /**
     * @param  array<string, mixed>  $json
     */
    protected function fakeGeminiJsonResponse(array $json): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($json, JSON_UNESCAPED_UNICODE)],
                            ],
                        ],
                    ],
                ],
            ]),
        ]);
    }

    protected function fakeGeminiHttpError(int $status = 500): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response('error', $status),
        ]);
    }
}
