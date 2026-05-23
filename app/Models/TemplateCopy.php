<?php

namespace App\Models;

use App\Enums\Register;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateCopy extends Model
{
    protected $fillable = [
        'interview_template_id',
        'key',
        'register',
        'body',
    ];

    protected function casts(): array
    {
        return [
            'register' => Register::class,
        ];
    }

    public function interviewTemplate(): BelongsTo
    {
        return $this->belongsTo(InterviewTemplate::class);
    }
}
