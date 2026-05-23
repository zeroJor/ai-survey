<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Settings extends Model
{
    protected $fillable = [
        'studio_process',
        'llm_enabled',
        'privacy_notice_url',
        'logo_url',
        'logo_alt',
        'primary_color',
        'accent_color',
        'display_name',
        'tagline',
    ];

    protected function casts(): array
    {
        return [
            'llm_enabled' => 'boolean',
        ];
    }

    public function channels(): HasMany
    {
        return $this->hasMany(SettingsChannel::class);
    }

    public static function current(): ?self
    {
        return static::query()->find(1);
    }
}
