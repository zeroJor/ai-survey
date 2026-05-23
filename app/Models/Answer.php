<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Answer extends Model
{
    protected $fillable = [
        'interview_id',
        'question_code',
        'body',
        'skipped',
    ];

    protected function casts(): array
    {
        return [
            'skipped' => 'boolean',
        ];
    }

    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class);
    }
}
