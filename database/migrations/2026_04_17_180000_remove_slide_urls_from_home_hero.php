<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('home_hero', function (Blueprint $table) {
            $table->dropColumn(['slide1_url', 'slide2_url', 'slide3_url']);
        });
    }

    public function down(): void
    {
        Schema::table('home_hero', function (Blueprint $table) {
            $table->string('slide1_url')->nullable();
            $table->string('slide2_url')->nullable();
            $table->string('slide3_url')->nullable();
        });
    }
};
