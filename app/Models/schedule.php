<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class schedule extends Model
{
    protected $fillable = ['class_session_id', 'day_of_week', 'start_time', 'end_time', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }
}
