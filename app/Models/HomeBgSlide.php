<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeBgSlide extends Model
{
    protected $table    = 'home_bg_slides';
    protected $fillable = ['src', 'alt', 'sort_order'];
}
