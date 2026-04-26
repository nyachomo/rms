<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('facebook_link',  500)->nullable()->after('company_logo');
            $table->string('instagram_link', 500)->nullable()->after('facebook_link');
            $table->string('youtube_link',   500)->nullable()->after('instagram_link');
            $table->string('linkedin_link',  500)->nullable()->after('youtube_link');
            $table->string('twitter_link',   500)->nullable()->after('linkedin_link');
            $table->string('theme_primary',  20)->nullable()->default('#fe730c')->after('twitter_link');
            $table->string('theme_navy',     20)->nullable()->default('#081f4e')->after('theme_primary');
        });
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'facebook_link', 'instagram_link', 'youtube_link',
                'linkedin_link', 'twitter_link', 'theme_primary', 'theme_navy',
            ]);
        });
    }
};
