<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class member extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'membership_plan',
        'membership_starts_at',
        'membership_expires_at',
        'membership_status',
        'auto_renew',
        'attendance_count',
        'sessions_missed',
        'last_attended_at',
        'membership_progress',
    ];

    protected $casts = [
        'membership_starts_at' => 'date',
        'membership_expires_at' => 'date',
        'auto_renew' => 'boolean',
        'last_attended_at' => 'datetime',
        'membership_progress' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function trainerReviews(): HasMany
    {
        return $this->hasMany(TrainerReview::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('membership_status', 'active');
    }

    public function syncAttendanceSnapshot(): void
    {
        $attended = $this->attendanceLogs()->where('status', 'attended')->count();
        $missed = $this->attendanceLogs()->where('status', 'missed')->count();
        $lastAttendedAt = $this->attendanceLogs()
            ->whereNotNull('check_in_at')
            ->latest('check_in_at')
            ->value('check_in_at');

        $this->forceFill([
            'attendance_count' => $attended,
            'sessions_missed' => $missed,
            'last_attended_at' => $lastAttendedAt,
            'membership_progress' => $this->calculateMembershipProgress(),
        ])->saveQuietly();
    }

    protected function calculateMembershipProgress(): float
    {
        if (! $this->membership_starts_at || ! $this->membership_expires_at) {
            return 0;
        }

        $start = Carbon::parse($this->membership_starts_at);
        $end = Carbon::parse($this->membership_expires_at);
        $today = Carbon::now();

        if ($today->lessThan($start)) {
            return 0;
        }

        if ($today->greaterThanOrEqualTo($end)) {
            return 100;
        }

        $totalDays = $end->diffInDays($start) ?: 1;
        $elapsed = $today->diffInDays($start);

        return round(min(100, ($elapsed / $totalDays) * 100), 2);
    }
}
