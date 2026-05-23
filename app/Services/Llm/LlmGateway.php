<?php

namespace App\Services\Llm;

use App\Contracts\LlmClient;
use App\Models\Settings;

class LlmGateway implements LlmClient
{
    public function __construct(
        private readonly TemplateLlmClient $templates,
        private readonly GeminiFlashLlmClient $gemini,
    ) {}

    public function microReply(MicroReplyRequest $request): MicroReplyResponse
    {
        $settings = Settings::current();
        $useLlmPool = (bool) ($settings?->llm_enabled ?? false);

        return $this->client()->microReply(new MicroReplyRequest(
            register: $request->register,
            answerBody: $request->answerBody,
            skipped: $request->skipped,
            questionIndex: $request->questionIndex,
            template: $request->template,
            useLlmPool: $useLlmPool,
            questionCode: $request->questionCode,
            questionLabel: $request->questionLabel,
        ));
    }

    public function farewell(FarewellRequest $request): string
    {
        return $this->templates->farewell($request);
    }

    public function studioPrepSummary(StudioPrepRequest $request): InterviewArtifactPayload
    {
        return $this->client()->studioPrepSummary($request);
    }

    public function llmEnabled(): bool
    {
        return (bool) (Settings::current()?->llm_enabled ?? false);
    }

    private function client(): LlmClient
    {
        $settings = Settings::current();
        $apiKey = config('llm.drivers.gemini.api_key');

        if ($settings?->llm_enabled && is_string($apiKey) && $apiKey !== '') {
            return $this->gemini;
        }

        return $this->templates;
    }
}
