<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    protected $fillable = [
        'user_id',
        'school_id',
        'program_event_id',
        'name',
        'admission_number',
        'class_id',
        'gender',
        'date_of_birth',
        'phone',
        'parent_phone',
        'email',
        'address',
        'status',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function programEvent(): BelongsTo
    {
        return $this->belongsTo(ProgramEvent::class);
    }
}
