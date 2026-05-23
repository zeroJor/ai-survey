<?php

namespace App\Models;

use App\Enums\AiMessageSource;
use App\Enums\AiMessageType;
use App\Enums\Register;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMessage extends Model
{
    protected $fillable = [
        'interview_id',
        'type',
        'question_code',
        'content',
        'sequence',
        'sentiment_id',
        'register',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'type' => AiMessageType::class,
            'register' => Register::class,
            'source' => AiMessageSource::class,
        ];
    }

    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class);
    }
}
