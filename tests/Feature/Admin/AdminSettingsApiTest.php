<?php

namespace Tests\Feature\Admin;

use App\Models\Settings;
use App\Models\SettingsChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithAdmin;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class AdminSettingsApiTest extends TestCase
{
    use InteractsWithAdmin;
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_patch_branding_reflects_in_client_talk(): void
    {
        $this->actingAsAdmin()->patchJson('/api/admin/settings', [
            'branding' => [
                'primaryColor' => '#ABCDEF',
            ],
        ])->assertOk()
            ->assertJsonPath('branding.primaryColor', '#ABCDEF');

        $token = $this->issueInviteToken();
        $this->enterInvite($token);

        $this->getTalkApi($this->latestInterviewSession())
            ->assertJsonPath('branding.primaryColor', '#ABCDEF');
    }

    public function test_channel_crud_round_trip(): void
    {
        $this->actingAsAdmin()->postJson('/api/admin/settings/channels', [
            'channelKey' => 'alerts_test',
            'name' => 'Test alerts',
            'type' => 'email',
            'config' => [
                'toAddresses' => ['ops@idwasoft.com'],
                'fromAddress' => 'hola@idwasoft.com',
                'fromName' => 'Idwasoft',
            ],
        ])->assertOk();

        $channelKeys = collect($this->actingAsAdmin()->getJson('/api/admin/settings')->json('channels'))
            ->pluck('channelKey');
        $this->assertTrue($channelKeys->contains('alerts_test'));

        $this->actingAsAdmin()->patchJson('/api/admin/settings/channels/alerts_test', [
            'name' => 'Updated alerts',
        ])->assertOk();

        $this->actingAsAdmin()->deleteJson('/api/admin/settings/channels/alerts_test')
            ->assertOk();

        $this->assertNull(
            SettingsChannel::query()->where('channel_key', 'alerts_test')->first(),
        );
    }

    public function test_llm_enabled_toggle_persists(): void
    {
        $this->actingAsAdmin()->patchJson('/api/admin/settings', [
            'llmEnabled' => true,
        ])->assertJsonPath('llmEnabled', true);

        $this->assertTrue(Settings::query()->find(1)?->llm_enabled);
    }
}
