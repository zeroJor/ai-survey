<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    protected $fillable = [
        'phase_id',
        'code',
        'sort_order',
        'input_type',
        'sensitivity',
    ];

    public function phase(): BelongsTo
    {
        return $this->belongsTo(Phase::class);
    }

    public function texts(): HasMany
    {
        return $this->hasMany(QuestionText::class);
    }
}
