<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Str;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'package_id',
        'reference',
        'status',
        'price',
        'started_at',
        'expires_at',
        'cancelled_at',
        'payment_method',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';

    protected static function booted(): void
    {
        static::creating(function (Subscription $subscription) {
            if (! $subscription->reference) {
                $subscription->reference = 'SUB-' . Str::upper(Str::random(8));
            }
        });
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(member::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function paymentTransaction(): MorphOne
    {
        return $this->morphOne(PaymentTransaction::class, 'payable');
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function activate(?\Carbon\Carbon $start = null): void
    {
        $this->loadMissing('package');
        $startDate = $start ?? now();
        $duration = $this->package?->duration_days ?? 0;

        $this->forceFill([
            'status' => self::STATUS_ACTIVE,
            'started_at' => $startDate,
            'expires_at' => $duration > 0 ? $startDate->copy()->addDays($duration) : null,
            'cancelled_at' => null,
        ])->save();
    }

    public function cancel(?string $note = null): void
    {
        $this->forceFill([
            'status' => self::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'notes' => $note ?? $this->notes,
        ])->save();
    }

    public function expire(): void
    {
        $this->forceFill([
            'status' => self::STATUS_EXPIRED,
        ])->save();
    }
}
