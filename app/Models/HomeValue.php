<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeValue extends Model
{
    protected $table    = 'home_values';
    protected $fillable = ['icon', 'title', 'description', 'sort_order'];
}
