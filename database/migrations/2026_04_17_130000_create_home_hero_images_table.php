<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_hero_images', function (Blueprint $table) {
            $table->id();
            $table->string('src');
            $table->string('alt')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('home_hero_images')->insert([
            ['src' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', 'alt' => 'Students collaborating', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['src' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80', 'alt' => 'Tech training',          'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['src' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', 'alt' => 'Online learning',         'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['src' => 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', 'alt' => 'Coding class',            'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('home_hero_images');
    }
};
