<?php

namespace App\Services\Llm;

use App\Enums\Register;
use App\Models\InterviewTemplate;

readonly class MicroReplyRequest
{
    public function __construct(
        public Register $register,
        public string $answerBody,
        public bool $skipped,
        public int $questionIndex,
        public InterviewTemplate $template,
        public bool $useLlmPool,
        public string $questionCode = '',
        public string $questionLabel = '',
    ) {}
}
