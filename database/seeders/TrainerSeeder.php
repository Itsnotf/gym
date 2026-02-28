<?php

namespace Database\Seeders;

use App\Models\trainer;
use App\Models\User;
use Illuminate\Database\Seeder;

class TrainerSeeder extends Seeder
{
    public function run(): void
    {
        $trainers = [
            [
                'user' => [
                    'name' => 'John Smith',
                    'email' => 'trainer1@gym.com',
                ],
                'profile' => [
                    'specialty' => 'Yoga & Flexibility',
                    'bio' => 'John blends traditional yoga with mobility drills to help members recover faster.',
                    'years_experience' => 7,
                ],
            ],
            [
                'user' => [
                    'name' => 'Sarah Johnson',
                    'email' => 'trainer2@gym.com',
                ],
                'profile' => [
                    'specialty' => 'CrossFit & Strength',
                    'bio' => 'Sarah programs progressive strength sessions focused on proper lifting mechanics.',
                    'years_experience' => 5,
                ],
            ],
            [
                'user' => [
                    'name' => 'Mike Davis',
                    'email' => 'trainer3@gym.com',
                ],
                'profile' => [
                    'specialty' => 'Cardio & Dance',
                    'bio' => 'Mike keeps high-energy cardio classes fresh with choreography and pacing drills.',
                    'years_experience' => 6,
                ],
            ],
            [
                'user' => [
                    'name' => 'Dashboard Demo Trainer',
                    'email' => 'trainer@gmail.com',
                ],
                'profile' => [
                    'specialty' => 'Performance Coaching',
                    'bio' => 'Demo trainer account for walking through the dedicated dashboard experience.',
                    'years_experience' => 8,
                ],
            ],
        ];

        foreach ($trainers as $config) {
            $user = User::firstOrCreate(
                ['email' => $config['user']['email']],
                [
                    'name' => $config['user']['name'],
                    'password' => 'password',
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->hasRole('trainer')) {
                $user->assignRole('trainer');
            }

            trainer::updateOrCreate(
                ['user_id' => $user->id],
                $config['profile']
            );
        }
    }
}
