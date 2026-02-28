<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\member;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'user' => [
                    'name' => 'Dashboard Demo Member',
                    'email' => 'member@gmail.com',
                ],
                'plan' => 'All Access Monthly',
                'autoRenew' => true,
            ],
            [
                'user' => [
                    'name' => 'Aria Member',
                    'email' => 'member1@gym.com',
                ],
                'plan' => 'Premium Monthly',
                'autoRenew' => true,
            ],
            [
                'user' => [
                    'name' => 'David Member',
                    'email' => 'member2@gym.com',
                ],
                'plan' => 'Basic Quarterly',
                'autoRenew' => false,
            ],
        ];

        foreach ($plans as $index => $config) {
            $user = User::firstOrCreate(
                ['email' => $config['user']['email']],
                [
                    'name' => $config['user']['name'],
                    'password' => 'password',
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->hasRole('user')) {
                $user->assignRole('user');
            }

            $start = Carbon::now()->subDays(5 + $index * 3);
            $end = Carbon::now()->addDays(25 + $index * 10);

            member::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'membership_plan' => $config['plan'],
                    'membership_starts_at' => $start,
                    'membership_expires_at' => $end,
                    'membership_status' => 'active',
                    'auto_renew' => $config['autoRenew'],
                ]
            );
        }
    }
}
