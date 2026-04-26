<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('program_event_id')->nullable()->constrained('program_events')->nullOnDelete()->after('school_id');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\ProgramEvent::class);
            $table->dropColumn('program_event_id');
        });
    }
};
