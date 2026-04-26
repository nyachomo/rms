<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $table = 'company_settings';

    protected $fillable = [
        'company_name',
        'company_address',
        'company_vision',
        'company_mission',
        'company_phone',
        'company_email',
        'company_kra_pin',
        'company_logo',
        'facebook_link',
        'instagram_link',
        'youtube_link',
        'linkedin_link',
        'twitter_link',
        'theme_primary',
        'theme_navy',
    ];

    /**
     * Always return the single settings row, creating it if absent.
     */
    public static function instance(): static
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
