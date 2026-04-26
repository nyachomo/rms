<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->string('module', 100);
            $table->string('action', 50);
            $table->timestamps();

            $table->unique(['role_id', 'module', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
