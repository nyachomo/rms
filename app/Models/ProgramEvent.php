<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramEvent extends Model
{
    protected $fillable = [
        'program_event_name',
        'program_event_location',
        'program_event_date',
        'status',
    ];

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}
