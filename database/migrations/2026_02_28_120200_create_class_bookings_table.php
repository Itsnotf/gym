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
        Schema::create('class_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_session_id')->constrained('class_sessions')->cascadeOnDelete();
            $table->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->date('session_date');
            $table->unsignedInteger('attendees_count')->default(1);
            $table->string('status')->default('pending');
            $table->string('payment_method')->default('cash');
            $table->string('payment_status')->default('unpaid');
            $table->string('ticket_code')->unique();
            $table->unsignedInteger('waitlist_position')->nullable();
            $table->string('source')->default('guest');
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->timestamps();

            $table->index(['class_session_id', 'session_date']);
            $table->index(['schedule_id', 'session_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_bookings');
    }
};
