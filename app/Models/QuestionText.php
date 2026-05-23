<?php

namespace App\Models;

use App\Enums\Register;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionText extends Model
{
    protected $fillable = [
        'question_id',
        'field',
        'register',
        'body',
    ];

    protected function casts(): array
    {
        return [
            'register' => Register::class,
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
