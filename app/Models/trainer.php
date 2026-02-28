<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class trainer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialty',
        'bio',
        'years_experience',
        'rating_average',
        'rating_count',
        'sessions_led',
        'active_members',
        'last_session_at',
    ];

    protected $casts = [
        'rating_average' => 'decimal:2',
        'last_session_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function trainerReviews(): HasMany
    {
        return $this->hasMany(TrainerReview::class);
    }

    public function syncPerformanceSnapshot(): void
    {
        $attendedSessions = $this->attendanceLogs()->where('status', 'attended')->count();
        $activeMembers = $this->attendanceLogs()
            ->where('scheduled_for', '>=', now()->subDays(30))
            ->whereNotNull('member_id')
            ->distinct('member_id')
            ->count('member_id');

        $lastSession = $this->attendanceLogs()->max('scheduled_for');

        $this->forceFill([
            'sessions_led' => $attendedSessions,
            'active_members' => $activeMembers,
            'last_session_at' => $lastSession,
        ])->saveQuietly();
    }

    public function syncRatingSnapshot(): void
    {
        $aggregate = $this->trainerReviews()
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
            ->first();

        $this->forceFill([
            'rating_average' => round((float) ($aggregate?->avg_rating ?? 0), 2),
            'rating_count' => (int) ($aggregate?->total_reviews ?? 0),
        ])->saveQuietly();
    }
}
