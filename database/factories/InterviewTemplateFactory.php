<?php

namespace Database\Factories;

use App\Models\InterviewTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InterviewTemplate>
 */
class InterviewTemplateFactory extends Factory
{
    protected $model = InterviewTemplate::class;

    public function definition(): array
    {
        return [
            'version' => '9.'.fake()->unique()->numberBetween(0, 9999).'.0',
            'published_at' => now(),
            'is_active' => false,
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['is_active' => true]);
    }
}
