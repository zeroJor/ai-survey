<?php

namespace App\Console\Commands;

use App\Services\Llm\GeminiApiClient;
use Illuminate\Console\Command;

class LlmPingCommand extends Command
{
    protected $signature = 'llm:ping';

    protected $description = 'Ping Gemini with a minimal generateContent call';

    public function handle(GeminiApiClient $api): int
    {
        $apiKey = config('llm.drivers.gemini.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            $this->error('GEMINI_API_KEY is not set.');

            return self::FAILURE;
        }

        $text = $api->generateText(
            'Reply with one short word: ok',
            'ping',
            ['maxOutputTokens' => 8],
        );

        if ($text === null || trim($text) === '') {
            $this->error('Gemini returned an empty response.');

            return self::FAILURE;
        }

        $this->info('Gemini OK: '.trim($text));

        return self::SUCCESS;
    }
}
