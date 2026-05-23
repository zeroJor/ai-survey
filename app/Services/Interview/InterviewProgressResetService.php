<?php

namespace App\Services\Interview;

use App\Enums\InterviewStatus;
use App\Models\Interview;

class InterviewProgressResetService
{
    public function reset(Interview $interview): void
    {
        $interview->answers()->delete();
        $interview->aiMessages()->delete();
        $interview->artifact?->delete();
        $interview->deliveryRecords()->delete();

        $interview->forceFill([
            'status' => InterviewStatus::NotStarted,
            'register' => null,
            'current_question_code' => null,
            'privacy_acknowledged_at' => null,
            'started_at' => null,
            'completed_at' => null,
        ])->save();
    }
}
