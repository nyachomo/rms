<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->foreignId('school_category_id')
                  ->nullable()
                  ->after('school_contact_person')
                  ->constrained('school_categories')
                  ->nullOnDelete();

            $table->foreignId('school_level_id')
                  ->nullable()
                  ->after('school_category_id')
                  ->constrained('school_levels')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropForeign(['school_category_id']);
            $table->dropForeign(['school_level_id']);
            $table->dropColumn(['school_category_id', 'school_level_id']);
        });
    }
};
