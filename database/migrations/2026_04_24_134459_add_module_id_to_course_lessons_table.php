<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_lessons', function (Blueprint $table) {
            $table->foreignId('module_id')
                ->nullable()
                ->after('course_id')
                ->constrained('course_modules')
                ->nullOnDelete();
        });

        // Migrate existing lessons into a default module per course
        $courses = DB::table('courses')->pluck('id');
        foreach ($courses as $courseId) {
            $count = DB::table('course_lessons')->where('course_id', $courseId)->count();
            if ($count === 0) continue;

            $moduleId = DB::table('course_modules')->insertGetId([
                'course_id'  => $courseId,
                'title'      => 'Module 1',
                'sort_order' => 1,
                'status'     => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('course_lessons')
                ->where('course_id', $courseId)
                ->update(['module_id' => $moduleId]);
        }
    }

    public function down(): void
    {
        Schema::table('course_lessons', function (Blueprint $table) {
            $table->dropForeign(['module_id']);
            $table->dropColumn('module_id');
        });
    }
};
