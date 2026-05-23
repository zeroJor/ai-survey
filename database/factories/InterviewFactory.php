<?php

namespace Database\Factories;

use App\Enums\InterviewStatus;
use App\Models\Invite;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Interview>
 */
class InterviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'invite_id' => Invite::factory(),
            'status' => InterviewStatus::NotStarted,
            'register' => null,
            'current_question_code' => null,
            'privacy_acknowledged_at' => null,
            'started_at' => null,
            'completed_at' => null,
        ];
    }
}
