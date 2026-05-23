<?php

namespace Tests\Feature\Database;

use App\Enums\InviteStatus;
use App\Models\InterviewTemplate;
use App\Models\Invite;
use App\Models\Settings;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MigrationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_domain_tables_accept_skeleton_rows(): void
    {
        Settings::query()->create(['studio_process' => 'test']);

        $template = InterviewTemplate::query()->create([
            'version' => 'test-1.0.0',
            'is_active' => true,
            'published_at' => now(),
        ]);

        $user = User::factory()->create();

        Invite::query()->create([
            'user_id' => $user->id,
            'interview_template_id' => $template->id,
            'contact_name' => 'Ana',
            'business_name' => 'Acme',
            'token_jti' => 'jti-test-001',
            'access_token_expires_at' => now()->addDays(7),
            'status' => InviteStatus::Active,
        ]);

        $this->assertDatabaseHas('settings', ['studio_process' => 'test']);
        $this->assertDatabaseHas('invites', ['contact_name' => 'Ana']);
    }
}
