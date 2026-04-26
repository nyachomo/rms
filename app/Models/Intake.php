<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Intake extends Model
{
    protected $fillable = [
        'intake_name',
        'intake_start_date',
        'intake_end_date',
        'intake_status',
    ];

    protected $casts = [
        'intake_start_date' => 'date',
        'intake_end_date'   => 'date',
    ];
}
