<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerReview extends Model
{
    protected $fillable = [
        'trainer_id',
        'member_id',
        'rating',
        'comment',
        'would_recommend',
        'reviewed_at',
    ];

    protected $casts = [
        'would_recommend' => 'boolean',
        'reviewed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saved(function (TrainerReview $review) {
            $review->trainer?->syncRatingSnapshot();
        });

        static::deleted(function (TrainerReview $review) {
            $review->trainer?->syncRatingSnapshot();
        });
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(trainer::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(member::class);
    }
}
