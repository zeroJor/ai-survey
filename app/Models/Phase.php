<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Phase extends Model
{
    protected $fillable = [
        'interview_template_id',
        'code',
        'sort_order',
    ];

    public function interviewTemplate(): BelongsTo
    {
        return $this->belongsTo(InterviewTemplate::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('sort_order');
    }
}
