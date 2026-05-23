<?php

namespace App\Services\Llm;

use App\Enums\Register;
use App\Models\Invite;
use App\Models\InterviewTemplate;

readonly class FarewellRequest
{
    public function __construct(
        public Register $register,
        public Invite $invite,
        public InterviewTemplate $template,
    ) {}
}
