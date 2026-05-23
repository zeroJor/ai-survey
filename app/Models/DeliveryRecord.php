<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryRecord extends Model
{
    protected $fillable = [
        'interview_id',
        'channel_key',
        'channel_type',
        'status',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => DeliveryStatus::class,
            'sent_at' => 'datetime',
        ];
    }

    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class);
    }
}
