<?php

namespace App\Services\Interview;

use App\Models\InterviewSession;

readonly class InviteEntryResult
{
    public function __construct(
        public string $redirectPath,
        public ?InterviewSession $session = null,
    ) {}

    public function redirectUrl(string $appUrl): string
    {
        return rtrim($appUrl, '/').$this->redirectPath;
    }
}
