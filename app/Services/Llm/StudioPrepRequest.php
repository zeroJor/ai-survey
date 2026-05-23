<?php

namespace App\Services\Llm;

use App\Enums\Register;

readonly class StudioPrepRequest
{
    /**
     * @param  list<array{code: string, label: string, answer: ?string, skipped: bool}>  $questions
     */
    public function __construct(
        public Register $register,
        public array $questions,
        public string $contactName,
        public string $businessName,
        public ?string $businessAbout,
        public string $studioProcess,
    ) {}
}
