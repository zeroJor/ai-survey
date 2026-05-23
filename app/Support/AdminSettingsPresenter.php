<?php

namespace App\Support;

use App\Models\Settings;

class AdminSettingsPresenter
{
    /**
     * @return array<string, mixed>
     */
    public static function toArray(Settings $settings): array
    {
        $settings->loadMissing('channels');

        return [
            'studioProcess' => $settings->studio_process,
            'llmEnabled' => (bool) $settings->llm_enabled,
            'privacyNoticeUrl' => $settings->privacy_notice_url,
            'branding' => [
                'displayName' => $settings->display_name,
                'logoUrl' => $settings->logo_url,
                'logoAlt' => $settings->logo_alt,
                'primaryColor' => $settings->primary_color,
                'accentColor' => $settings->accent_color,
                'tagline' => $settings->tagline,
            ],
            'channels' => $settings->channels->map(fn ($channel) => [
                'channelKey' => $channel->channel_key,
                'name' => $channel->name,
                'type' => $channel->type,
                'config' => $channel->config ?? [],
            ])->values()->all(),
        ];
    }
}
