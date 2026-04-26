<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name', 200)->nullable();
            $table->text('company_address')->nullable();
            $table->text('company_vision')->nullable();
            $table->text('company_mission')->nullable();
            $table->string('company_phone', 30)->nullable();
            $table->string('company_email', 150)->nullable();
            $table->string('company_kra_pin', 50)->nullable();
            $table->string('company_logo', 500)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
