<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeHeroImage extends Model
{
    protected $table    = 'home_hero_images';
    protected $fillable = ['src', 'alt', 'sort_order'];
}
