<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facility extends Model
{
    protected $fillable = [
        'name',
        'description',
        'capacity',
        'waitlist_limit',
        'requires_membership',
        'is_active',
        'hourly_rate',
    ];

    protected $casts = [
        'requires_membership' => 'boolean',
        'is_active' => 'boolean',
        'hourly_rate' => 'decimal:2',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(FacilityBooking::class);
    }
}
