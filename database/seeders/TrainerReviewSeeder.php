<?php

namespace Database\Seeders;

use App\Models\TrainerReview;
use App\Models\member;
use App\Models\trainer;
use Illuminate\Database\Seeder;

class TrainerReviewSeeder extends Seeder
{
    public function run(): void
    {
        $member = member::first();
        $trainers = trainer::with('user')->get();

        if (! $member || $trainers->isEmpty()) {
            return;
        }

        foreach ($trainers as $index => $trainer) {
            TrainerReview::updateOrCreate(
                [
                    'trainer_id' => $trainer->id,
                    'member_id' => $member->id,
                    'rating' => 5 - ($index % 2),
                ],
                [
                    'comment' => 'Great energy and personalized coaching.',
                    'would_recommend' => true,
                    'reviewed_at' => now()->subDays($index),
                ]
            );
        }
    }
}
