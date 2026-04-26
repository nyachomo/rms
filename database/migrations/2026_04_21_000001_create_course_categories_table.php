<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->unique();
            $table->string('slug', 150)->unique();
            $table->text('description')->nullable();
            $table->string('icon', 100)->nullable();
            $table->string('color', 50)->nullable();
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Seed from the four categories already used on courses
        $now = now();
        DB::table('course_categories')->insert([
            ['name' => 'Foundational', 'slug' => 'foundational', 'description' => 'Entry-level courses for beginners building core digital skills.',      'icon' => 'fas fa-seedling',      'color' => 'teal',   'sort_order' => 1, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Proficiency',  'slug' => 'proficiency',  'description' => 'Intermediate courses that deepen practical, job-ready skills.',        'icon' => 'fas fa-chart-line',    'color' => 'orange', 'sort_order' => 2, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mastery',      'slug' => 'mastery',      'description' => 'Advanced courses for specialists and industry professionals.',          'icon' => 'fas fa-graduation-cap','color' => 'purple', 'sort_order' => 3, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Corporate',    'slug' => 'corporate',    'description' => 'Customisable programmes for organisations and leadership teams.',       'icon' => 'fas fa-building',      'color' => 'navy',   'sort_order' => 4, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Add category_id FK to courses and populate from existing slug string
        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained('course_categories')->nullOnDelete();
        });

        // Fill category_id by matching the existing category slug string
        DB::statement('
            UPDATE courses c
            JOIN course_categories cc ON cc.slug = c.category
            SET c.category_id = cc.id
        ');
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
        Schema::dropIfExists('course_categories');
    }
};
