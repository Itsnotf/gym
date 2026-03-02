<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class ClassBooking extends Model
{
    protected $fillable = [
        'class_session_id',
        'schedule_id',
        'user_id',
        'session_date',
        'attendees_count',
        'status',
        'payment_method',
        'payment_status',
        'payment_proof',
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
        'session_date' => 'date',
    ];

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(schedule::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // The PaymentTransaction import is not needed due to being in the same namespace
    public function paymentTransaction(): MorphOne
    {
        return $this->morphOne(PaymentTransaction::class, 'payable');
    }
}
