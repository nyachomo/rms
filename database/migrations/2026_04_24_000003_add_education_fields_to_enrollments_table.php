<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignId('school_level_id')
                  ->nullable()->after('intake_id')
                  ->constrained('school_levels')->nullOnDelete();
            $table->foreignId('class_id')
                  ->nullable()->after('school_level_id')
                  ->constrained('school_classes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['school_level_id']);
            $table->dropForeign(['class_id']);
            $table->dropColumn(['school_level_id', 'class_id']);
        });
    }
};
