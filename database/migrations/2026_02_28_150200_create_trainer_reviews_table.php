<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained('trainers')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->boolean('would_recommend')->default(true);
            $table->timestamp('reviewed_at')->useCurrent();
            $table->timestamps();

            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer_reviews');
    }
};
