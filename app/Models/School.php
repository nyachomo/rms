<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class School extends Model
{
    protected $fillable = [
        'school_name',
        'school_location',
        'school_contact_person',
        'school_status',
        'school_category_id',
        'school_level_id',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(SchoolCategory::class, 'school_category_id');
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(SchoolLevel::class, 'school_level_id');
    }
}
