<?php

namespace App\Services\Llm;

use App\Contracts\LlmClient;
use App\Services\Interview\SentimentResolver;
use App\Support\InviteTemplateFill;

class TemplateLlmClient implements LlmClient
{
    public function __construct(
        private readonly TemplateCopyPools $pools,
        private readonly SentimentResolver $sentiments,
    ) {}

    public function microReply(MicroReplyRequest $request): MicroReplyResponse
    {
        $pool = $this->pools->microReplyPool(
            $request->template,
            $request->register,
            $request->useLlmPool,
        );

        $text = $pool[random_int(0, count($pool) - 1)];
        $sentimentId = $request->skipped || trim($request->answerBody) === ''
            ? $this->sentiments->resolve(true, '')
            : $this->sentiments->random();

        return new MicroReplyResponse($text, $sentimentId);
    }

    public function farewell(FarewellRequest $request): string
    {
        $body = $this->pools->farewellBody($request->template, $request->register);

        return InviteTemplateFill::apply($body, $request->invite);
    }

    public function studioPrepSummary(StudioPrepRequest $request): InterviewArtifactPayload
    {
        return InterviewArtifactPayload::disabledStub();
    }
}
