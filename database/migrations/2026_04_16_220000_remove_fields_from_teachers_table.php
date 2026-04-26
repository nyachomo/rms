<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['qualification', 'date_of_birth', 'subject']);
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('subject', 200)->nullable()->after('gender');
            $table->date('date_of_birth')->nullable()->after('subject');
            $table->string('qualification', 200)->nullable()->after('date_of_birth');
        });
    }
};
