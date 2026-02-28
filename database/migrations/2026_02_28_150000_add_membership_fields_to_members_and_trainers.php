<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('membership_plan')->nullable()->after('user_id');
            $table->date('membership_starts_at')->nullable()->after('membership_plan');
            $table->date('membership_expires_at')->nullable()->after('membership_starts_at');
            $table->string('membership_status')->default('inactive')->after('membership_expires_at');
            $table->boolean('auto_renew')->default(false)->after('membership_status');
            $table->unsignedInteger('attendance_count')->default(0)->after('auto_renew');
            $table->unsignedInteger('sessions_missed')->default(0)->after('attendance_count');
            $table->timestamp('last_attended_at')->nullable()->after('sessions_missed');
            $table->decimal('membership_progress', 5, 2)->default(0)->after('last_attended_at');
        });

        Schema::table('trainers', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('specialty');
            $table->unsignedInteger('years_experience')->default(0)->after('bio');
            $table->decimal('rating_average', 3, 2)->default(0)->after('years_experience');
            $table->unsignedInteger('rating_count')->default(0)->after('rating_average');
            $table->unsignedInteger('sessions_led')->default(0)->after('rating_count');
            $table->unsignedInteger('active_members')->default(0)->after('sessions_led');
            $table->timestamp('last_session_at')->nullable()->after('active_members');
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'years_experience',
                'rating_average',
                'rating_count',
                'sessions_led',
                'active_members',
                'last_session_at',
            ]);
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'membership_plan',
                'membership_starts_at',
                'membership_expires_at',
                'membership_status',
                'auto_renew',
                'attendance_count',
                'sessions_missed',
                'last_attended_at',
                'membership_progress',
            ]);
        });
    }
};
