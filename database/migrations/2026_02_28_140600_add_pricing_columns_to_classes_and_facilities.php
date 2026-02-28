<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->decimal('price_per_attendee', 8, 2)->default(0)->after('allow_guest_booking');
        });

        Schema::table('facilities', function (Blueprint $table) {
            $table->decimal('hourly_rate', 8, 2)->default(0)->after('requires_membership');
        });
    }

    public function down(): void
    {
        Schema::table('facilities', function (Blueprint $table) {
            $table->dropColumn('hourly_rate');
        });

        Schema::table('class_sessions', function (Blueprint $table) {
            $table->dropColumn('price_per_attendee');
        });
    }
};
