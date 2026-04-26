<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeAbout extends Model
{
    protected $table = 'home_about';

    protected $fillable = [
        'image_url', 'years_badge', 'years_label',
        'badge_text', 'title', 'title_highlight', 'subtitle', 'quote_text', 'quote_author',
        'features', 'cta_label', 'cta_link',
        'values_badge', 'values_title', 'values_title_highlight', 'values_subtitle',
        'steps_badge',  'steps_title',  'steps_title_highlight',  'steps_subtitle',
    ];

    protected $casts = ['features' => 'array'];
}
