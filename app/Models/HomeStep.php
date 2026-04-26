<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeStep extends Model
{
    protected $table    = 'home_steps';
    protected $fillable = ['step_number', 'title', 'description', 'sort_order'];
}
