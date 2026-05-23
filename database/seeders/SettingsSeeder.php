<?php

namespace Database\Seeders;

use App\Models\Settings;
use App\Models\SettingsChannel;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = Settings::query()->updateOrCreate(
            ['id' => 1],
            [
                'studio_process' => 'Documenta aquí el proceso interno del estudio.',
                'llm_enabled' => false,
                'privacy_notice_url' => 'https://idwasoft.com/aviso-privacidad',
                'logo_url' => null,
                'logo_alt' => 'Idwasoft',
                'primary_color' => '#00B4FF',
                'accent_color' => '#0077FF',
                'display_name' => 'Idwasoft',
                'tagline' => null,
            ],
        );

        SettingsChannel::query()->updateOrCreate(
            [
                'settings_id' => $settings->id,
                'channel_key' => 'studio_email',
            ],
            [
                'name' => 'Studio alerts',
                'type' => 'email',
                'config' => [
                    'toAddresses' => ['team@idwasoft.com'],
                    'fromAddress' => 'hola@idwasoft.com',
                    'fromName' => 'Idwasoft',
                ],
            ],
        );
    }
}
