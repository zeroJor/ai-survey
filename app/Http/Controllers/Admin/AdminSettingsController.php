<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use App\Models\SettingsChannel;
use App\Support\AdminSettingsPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = $this->settings();

        return response()->json(AdminSettingsPresenter::toArray($settings));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'studioProcess' => ['sometimes', 'nullable', 'string'],
            'llmEnabled' => ['sometimes', 'boolean'],
            'privacyNoticeUrl' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'branding' => ['sometimes', 'array'],
            'branding.displayName' => ['sometimes', 'nullable', 'string', 'max:255'],
            'branding.logoUrl' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'branding.logoAlt' => ['sometimes', 'nullable', 'string', 'max:255'],
            'branding.primaryColor' => ['sometimes', 'nullable', 'string', 'max:32'],
            'branding.accentColor' => ['sometimes', 'nullable', 'string', 'max:32'],
            'branding.tagline' => ['sometimes', 'nullable', 'string', 'max:512'],
        ]);

        $settings = $this->settings();

        if (array_key_exists('studioProcess', $validated)) {
            $settings->studio_process = $validated['studioProcess'];
        }
        if (array_key_exists('llmEnabled', $validated)) {
            $settings->llm_enabled = $validated['llmEnabled'];
        }
        if (array_key_exists('privacyNoticeUrl', $validated)) {
            $settings->privacy_notice_url = $validated['privacyNoticeUrl'];
        }

        if (isset($validated['branding'])) {
            $branding = $validated['branding'];
            $map = [
                'displayName' => 'display_name',
                'logoUrl' => 'logo_url',
                'logoAlt' => 'logo_alt',
                'primaryColor' => 'primary_color',
                'accentColor' => 'accent_color',
                'tagline' => 'tagline',
            ];
            foreach ($map as $jsonKey => $dbKey) {
                if (array_key_exists($jsonKey, $branding)) {
                    $settings->{$dbKey} = $branding[$jsonKey];
                }
            }
        }

        $settings->save();

        return response()->json(AdminSettingsPresenter::toArray($settings->fresh('channels')));
    }

    public function storeChannel(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channelKey' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9_-]+$/'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['email'])],
            'config' => ['required', 'array'],
        ]);

        $this->validateEmailConfig($validated['config']);

        $settings = $this->settings();

        if ($settings->channels()->where('channel_key', $validated['channelKey'])->exists()) {
            throw ValidationException::withMessages([
                'channelKey' => ['Channel key already exists.'],
            ]);
        }

        $settings->channels()->create([
            'channel_key' => $validated['channelKey'],
            'name' => $validated['name'],
            'type' => $validated['type'],
            'config' => $validated['config'],
        ]);

        return response()->json(AdminSettingsPresenter::toArray($settings->fresh('channels')));
    }

    public function updateChannel(Request $request, string $channelKey): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'config' => ['sometimes', 'array'],
        ]);

        if (isset($validated['config'])) {
            $this->validateEmailConfig($validated['config']);
        }

        $settings = $this->settings();
        $channel = $settings->channels()->where('channel_key', $channelKey)->first();

        if ($channel === null) {
            return response()->json(['message' => 'Channel not found.'], 404);
        }

        $channel->fill($validated);
        $channel->save();

        return response()->json(AdminSettingsPresenter::toArray($settings->fresh('channels')));
    }

    public function destroyChannel(string $channelKey): JsonResponse
    {
        $settings = $this->settings();
        $settings->channels()->where('channel_key', $channelKey)->delete();

        return response()->json(AdminSettingsPresenter::toArray($settings->fresh('channels')));
    }

    private function settings(): Settings
    {
        $settings = Settings::query()->with('channels')->find(1);

        if ($settings === null) {
            abort(404, 'Settings not configured.');
        }

        return $settings;
    }

    /**
     * @param  array<string, mixed>  $config
     */
    private function validateEmailConfig(array $config): void
    {
        if (
            ! isset($config['toAddresses'])
            || ! is_array($config['toAddresses'])
            || $config['toAddresses'] === []
        ) {
            throw ValidationException::withMessages([
                'config.toAddresses' => ['At least one recipient is required.'],
            ]);
        }

        foreach ($config['toAddresses'] as $email) {
            if (! is_string($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw ValidationException::withMessages([
                    'config.toAddresses' => ['Invalid email in toAddresses.'],
                ]);
            }
        }
    }
}
