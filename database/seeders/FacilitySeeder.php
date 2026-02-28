<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        Facility::firstOrCreate(
            ['name' => 'Premium Weight Room'],
            [
                'description' => 'Fully equipped strength area with free weights and racks',
                'capacity' => 30,
                'waitlist_limit' => 15,
                'requires_membership' => true,
                'hourly_rate' => 60,
            ]
        );

        Facility::firstOrCreate(
            ['name' => 'Yoga Studio'],
            [
                'description' => 'Calm studio for stretching, breathing classes, and private sessions',
                'capacity' => 20,
                'waitlist_limit' => 10,
                'requires_membership' => false,
                'hourly_rate' => 45,
            ]
        );

        Facility::firstOrCreate(
            ['name' => 'Swimming Pool'],
            [
                'description' => 'Indoor heated lap pool for endurance training',
                'capacity' => 15,
                'waitlist_limit' => 10,
                'requires_membership' => true,
                'hourly_rate' => 80,
            ]
        );
    }
}
