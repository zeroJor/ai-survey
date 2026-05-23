<?php

namespace App\Services\Llm;

readonly class MicroReplyResponse
{
    public function __construct(
        public string $text,
        public string $sentimentId,
        public bool $fromTemplate = true,
    ) {}
}
