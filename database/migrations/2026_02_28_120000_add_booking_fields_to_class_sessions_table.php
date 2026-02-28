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
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->unsignedInteger('capacity')->default(20)->after('trainer_id');
            $table->unsignedInteger('waitlist_limit')->default(5)->after('capacity');
            $table->boolean('allow_guest_booking')->default(true)->after('waitlist_limit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->dropColumn(['capacity', 'waitlist_limit', 'allow_guest_booking']);
        });
    }
};
