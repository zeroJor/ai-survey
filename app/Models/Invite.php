<?php

namespace App\Models;

use App\Enums\InviteStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Invite extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'interview_template_id',
        'contact_name',
        'business_name',
        'business_about',
        'client_email',
        'client_whatsapp',
        'token_jti',
        'access_token_expires_at',
        'status',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => InviteStatus::class,
            'access_token_expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interviewTemplate(): BelongsTo
    {
        return $this->belongsTo(InterviewTemplate::class);
    }

    public function interview(): HasOne
    {
        return $this->hasOne(Interview::class);
    }
}
