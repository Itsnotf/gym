<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassSession extends Model
{
    protected $fillable = [
        'class_type_id',
        'trainer_id',
        'capacity',
        'waitlist_limit',
        'allow_guest_booking',
        'price_per_attendee',
    ];

    protected $casts = [
        'allow_guest_booking' => 'boolean',
        'price_per_attendee' => 'decimal:2',
    ];

    public function classType(): BelongsTo
    {
        return $this->belongsTo(ClassType::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(trainer::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(schedule::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(ClassBooking::class);
    }
}
