<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassType extends Model
{
    protected $fillable = ['name', 'description'];

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }
}
