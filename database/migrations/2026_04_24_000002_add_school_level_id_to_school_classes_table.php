<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_classes', function (Blueprint $table) {
            $table->foreignId('school_level_id')
                  ->nullable()
                  ->after('school_category_id')
                  ->constrained('school_levels')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('school_classes', function (Blueprint $table) {
            $table->dropForeign(['school_level_id']);
            $table->dropColumn('school_level_id');
        });
    }
};
