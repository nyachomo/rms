<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IctClubRegistration extends Model
{
    protected $fillable = [
        'user_id', 'name', 'email', 'phone',
        'school', 'track', 'why', 'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
