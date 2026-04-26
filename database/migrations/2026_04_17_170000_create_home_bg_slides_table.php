<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_bg_slides', function (Blueprint $table) {
            $table->id();
            $table->string('src');
            $table->string('alt')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        /* Seed from existing home_hero slide columns */
        $hero = DB::table('home_hero')->first();
        $order = 1;
        foreach (['slide1_url', 'slide2_url', 'slide3_url'] as $col) {
            if ($hero && !empty($hero->$col)) {
                DB::table('home_bg_slides')->insert([
                    'src'        => $hero->$col,
                    'alt'        => 'Background slide ' . $order,
                    'sort_order' => $order,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $order++;
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('home_bg_slides');
    }
};
