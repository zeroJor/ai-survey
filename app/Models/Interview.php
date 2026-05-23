<?php

namespace App\Models;

use App\Enums\InterviewStatus;
use App\Enums\Register;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Interview extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'invite_id',
        'status',
        'register',
        'current_question_code',
        'privacy_acknowledged_at',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => InterviewStatus::class,
            'register' => Register::class,
            'privacy_acknowledged_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function invite(): BelongsTo
    {
        return $this->belongsTo(Invite::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(InterviewSession::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    public function aiMessages(): HasMany
    {
        return $this->hasMany(AiMessage::class)->orderBy('sequence');
    }

    public function artifact(): HasOne
    {
        return $this->hasOne(InterviewArtifact::class);
    }

    public function deliveryRecords(): HasMany
    {
        return $this->hasMany(DeliveryRecord::class);
    }
}
