<?php

namespace App\Services\Llm;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiApiClient
{
    /**
     * @param  array<string, mixed>  $generationConfig
     * @return array<string, mixed>|null
     */
    public function generateJson(
        string $systemInstruction,
        string $userContent,
        array $generationConfig = [],
    ): ?array {
        $decoded = $this->generateText($systemInstruction, $userContent, array_merge([
            'responseMimeType' => 'application/json',
        ], $generationConfig));

        if ($decoded === null) {
            return null;
        }

        $json = json_decode($decoded, true);

        return is_array($json) ? $json : null;
    }

    public function generateText(
        string $systemInstruction,
        string $userContent,
        array $generationConfig = [],
    ): ?string {
        $apiKey = config('llm.drivers.gemini.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            return null;
        }

        $model = config('llm.drivers.gemini.model', 'gemini-2.0-flash');
        $url = sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent',
            $model,
        );

        $payload = [
            'systemInstruction' => [
                'parts' => [['text' => $systemInstruction]],
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [['text' => $userContent]],
                ],
            ],
            'generationConfig' => array_merge([
                'temperature' => 0.7,
            ], $generationConfig),
        ];

        try {
            $response = Http::timeout((int) ceil(config('llm.timeout_ms', 25000) / 1000))
                ->acceptJson()
                ->post($url.'?key='.urlencode($apiKey), $payload);
        } catch (ConnectionException $exception) {
            Log::warning('gemini.connection_failed', ['message' => $exception->getMessage()]);

            return null;
        }

        if (! $response->successful()) {
            Log::warning('gemini.http_error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        }

        $text = data_get($response->json(), 'candidates.0.content.parts.0.text');

        if (! is_string($text) || trim($text) === '') {
            Log::warning('gemini.empty_response');

            return null;
        }

        return trim($text);
    }
}
