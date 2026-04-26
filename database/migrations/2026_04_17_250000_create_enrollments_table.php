<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('intake_id')->constrained('intakes')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 150);
            $table->string('email', 200)->unique();
            $table->string('phone', 30)->nullable();
            $table->enum('sponsorship', ['self', 'guardian'])->default('self');
            $table->string('sponsor_name',  150)->nullable();
            $table->string('sponsor_email', 200)->nullable();
            $table->string('sponsor_phone', 30)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
