<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_class_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_session_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['package_id', 'class_session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_class_session');
    }
};
