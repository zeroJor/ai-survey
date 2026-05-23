<?php

namespace Database\Factories;

use App\Enums\InviteStatus;
use App\Models\InterviewTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invite>
 */
class InviteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'interview_template_id' => InterviewTemplate::query()->active()->value('id')
                ?? InterviewTemplate::factory(),
            'contact_name' => fake()->firstName(),
            'business_name' => fake()->company(),
            'business_about' => fake()->optional()->sentence(),
            'client_email' => fake()->optional()->safeEmail(),
            'client_whatsapp' => null,
            'token_jti' => Str::uuid()->toString(),
            'access_token_expires_at' => now()->addDays(7),
            'status' => InviteStatus::Active,
            'revoked_at' => null,
        ];
    }
}
