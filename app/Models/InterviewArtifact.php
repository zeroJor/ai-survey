<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewArtifact extends Model
{
    protected $fillable = [
        'interview_id',
        'analysis_json',
        'schema_version',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'analysis_json' => 'array',
            'generated_at' => 'datetime',
        ];
    }

    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class);
    }
}
