<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class FacilityBooking extends Model
{
    protected $fillable = [
        'facility_id',
        'user_id',
        'start_at',
        'end_at',
        'attendees_count',
        'status',
        'payment_method',
        'payment_status',
        'ticket_code',
        'waitlist_position',
        'source',
        'guest_name',
        'guest_email',
        'guest_phone',
        'notes',
        'total_amount',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentTransaction(): MorphOne
    {
        return $this->morphOne(PaymentTransaction::class, 'payable');
    }
}
