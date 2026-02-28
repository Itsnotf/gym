<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AttendanceLog extends Model
{
    protected $fillable = [
        'member_id',
        'trainer_id',
        'attendable_type',
        'attendable_id',
        'status',
        'scheduled_for',
        'check_in_at',
        'check_out_at',
        'notes',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saved(function (AttendanceLog $log) {
            $log->refreshSnapshots();
        });

        static::deleted(function (AttendanceLog $log) {
            $log->refreshSnapshots();
        });
    }

    public function attendable(): MorphTo
    {
        return $this->morphTo();
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(member::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(trainer::class);
    }

    protected function refreshSnapshots(): void
    {
        $this->loadMissing(['member', 'trainer']);

        if ($this->member) {
            $this->member->syncAttendanceSnapshot();
        }

        if ($this->trainer) {
            $this->trainer->syncPerformanceSnapshot();
        }
    }
}
