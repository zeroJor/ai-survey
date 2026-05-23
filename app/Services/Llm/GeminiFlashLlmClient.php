<?php

namespace App\Services\Llm;

use App\Contracts\LlmClient;
use App\Services\Interview\SentimentResolver;
use App\Support\InviteTemplateFill;
use Illuminate\Support\Facades\Log;

class GeminiFlashLlmClient implements LlmClient
{
    public function __construct(
        private readonly GeminiApiClient $api,
        private readonly TemplateLlmClient $templates,
        private readonly PromptLoader $prompts,
        private readonly SentimentResolver $sentiments,
    ) {}

    public function microReply(MicroReplyRequest $request): MicroReplyResponse
    {
        $system = str_replace(
            '{{SENTIMENT_IDS}}',
            $this->prompts->sentimentIdList(),
            $this->prompts->load('micro-reply.md'),
        );

        $registerLabel = $request->register === \App\Enums\Register::Usted ? 'usted' : 'tu';

        $user = json_encode([
            'register' => $registerLabel,
            'questionCode' => $request->questionCode,
            'questionLabel' => $request->questionLabel,
            'skipped' => $request->skipped,
            'answer' => $request->answerBody,
        ], JSON_UNESCAPED_UNICODE);

        $decoded = $this->api->generateJson(
            $system,
            (string) $user,
            ['maxOutputTokens' => config('llm.limits.micro_reply', 48)],
        );

        if ($decoded === null || ! isset($decoded['text'])) {
            Log::warning('gemini.micro_reply_fallback', [
                'questionCode' => $request->questionCode,
            ]);

            return $this->templates->microReply($request);
        }

        $text = trim((string) $decoded['text']);
        $sentimentId = $this->sentiments->normalize(
            isset($decoded['sentimentId']) ? (string) $decoded['sentimentId'] : null,
        );

        if ($text === '') {
            return $this->templates->microReply($request);
        }

        return new MicroReplyResponse($text, $sentimentId, fromTemplate: false);
    }

    public function farewell(FarewellRequest $request): string
    {
        $registerLabel = $request->register === \App\Enums\Register::Usted ? 'usted' : 'tu';

        $user = json_encode([
            'register' => $registerLabel,
            'contactName' => $request->invite->contact_name,
            'businessName' => $request->invite->business_name,
        ], JSON_UNESCAPED_UNICODE);

        $text = $this->api->generateText(
            'You are Lisa. Write a warm one-paragraph Spanish farewell. Same register as requested. Mention the team will follow up soon to schedule the discovery call. No JSON.',
            (string) $user,
            ['maxOutputTokens' => config('llm.limits.farewell', 80)],
        );

        if ($text === null || trim($text) === '') {
            return $this->templates->farewell($request);
        }

        return InviteTemplateFill::apply($text, $request->invite);
    }

    public function studioPrepSummary(StudioPrepRequest $request): InterviewArtifactPayload
    {
        $system = $this->prompts->load('studio-summary.md');

        $user = json_encode([
            'register' => $request->register->value,
            'contactName' => $request->contactName,
            'businessName' => $request->businessName,
            'businessAbout' => $request->businessAbout,
            'studioProcess' => $request->studioProcess,
            'questions' => $request->questions,
        ], JSON_UNESCAPED_UNICODE);

        $decoded = $this->api->generateJson(
            $system,
            (string) $user,
            ['maxOutputTokens' => config('llm.limits.studio_prep_summary', 700)],
        );

        if ($decoded === null) {
            Log::warning('gemini.studio_summary_fallback');

            return $this->templates->studioPrepSummary($request);
        }

        return InterviewArtifactPayload::fromArray($decoded);
    }
}
