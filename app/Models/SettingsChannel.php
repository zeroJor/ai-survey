<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettingsChannel extends Model
{
    protected $fillable = [
        'settings_id',
        'channel_key',
        'name',
        'type',
        'config',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
        ];
    }

    public function settings(): BelongsTo
    {
        return $this->belongsTo(Settings::class);
    }
}
