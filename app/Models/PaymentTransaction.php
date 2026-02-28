<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'payable_type',
        'payable_id',
        'user_id',
        'bank_account_id',
        'payment_method',
        'amount',
        'status',
        'reference_number',
        'proof_path',
        'receipt_number',
        'receipt_issued_at',
        'verified_by',
        'verified_at',
        'paid_at',
        'notes',
        'admin_note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'receipt_issued_at' => 'datetime',
        'verified_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public const STATUS_AWAITING_PROOF = 'awaiting_proof';
    public const STATUS_AWAITING_CASH = 'awaiting_cash';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_VERIFIED = 'verified';
    public const STATUS_REJECTED = 'rejected';

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function scopePendingReview($query)
    {
        return $query->whereIn('status', [self::STATUS_AWAITING_PROOF, self::STATUS_SUBMITTED]);
    }

    public static function generateReceiptNumber(): string
    {
        return 'RCT-' . Str::upper(Str::random(6));
    }
}
