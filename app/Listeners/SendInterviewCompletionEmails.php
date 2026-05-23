<?php

namespace App\Listeners;

use App\Events\InterviewCompleted;
use App\Services\Interview\InterviewEmailDeliveryService;

class SendInterviewCompletionEmails
{
    public function __construct(
        private readonly InterviewEmailDeliveryService $delivery,
    ) {}

    public function handle(InterviewCompleted $event): void
    {
        $interview = $event->interview;

        $this->delivery->sendStudioAlert($interview);
        $this->delivery->sendClientCopy($interview);
    }
}
