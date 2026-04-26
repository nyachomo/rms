<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title', 200);
            $table->longText('content')->nullable();
            $table->string('video_url', 500)->nullable();
            $table->enum('type', ['text', 'video', 'mixed'])->default('text');
            $table->integer('duration_minutes')->default(0);
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['published', 'draft'])->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_lessons');
    }
};
