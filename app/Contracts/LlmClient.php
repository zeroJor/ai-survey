<?php

namespace App\Contracts;

use App\Services\Llm\FarewellRequest;
use App\Services\Llm\InterviewArtifactPayload;
use App\Services\Llm\MicroReplyRequest;
use App\Services\Llm\MicroReplyResponse;
use App\Services\Llm\StudioPrepRequest;

interface LlmClient
{
    public function microReply(MicroReplyRequest $request): MicroReplyResponse;

    public function farewell(FarewellRequest $request): string;

    public function studioPrepSummary(StudioPrepRequest $request): InterviewArtifactPayload;
}
