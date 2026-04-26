<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeHero extends Model
{
    protected $table = 'home_hero';

    protected $fillable = [
        'badge_text', 'title_part1', 'title_highlight1', 'title_part2', 'title_highlight2',
        'subtitle', 'btn1_label', 'btn1_link', 'btn2_label',
        'stat1_value', 'stat1_label', 'stat2_value', 'stat2_label', 'stat3_value', 'stat3_label',
        'float_title', 'float_subtitle',
    ];
}
