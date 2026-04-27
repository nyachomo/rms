<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('course_lessons')->cascadeOnDelete();
            $table->text('question');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('lesson_exam_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('lesson_exam_questions')->cascadeOnDelete();
            $table->string('option_text');
            $table->boolean('is_correct')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('lesson_exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('course_lessons')->cascadeOnDelete();
            $table->decimal('score', 5, 2);
            $table->boolean('passed')->default(false);
            $table->timestamps();
        });

        Schema::create('lesson_exam_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('lesson_exam_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('lesson_exam_questions')->cascadeOnDelete();
            $table->foreignId('selected_option_id')->nullable()->constrained('lesson_exam_options')->nullOnDelete();
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_exam_answers');
        Schema::dropIfExists('lesson_exam_attempts');
        Schema::dropIfExists('lesson_exam_options');
        Schema::dropIfExists('lesson_exam_questions');
    }
};
