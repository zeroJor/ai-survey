<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InterviewTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'version',
        'published_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function phases(): HasMany
    {
        return $this->hasMany(Phase::class)->orderBy('sort_order');
    }

    public function templateCopies(): HasMany
    {
        return $this->hasMany(TemplateCopy::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
