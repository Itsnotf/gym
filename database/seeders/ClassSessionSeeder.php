<?php

namespace Database\Seeders;

use App\Models\ClassSession;
use App\Models\ClassType;
use App\Models\trainer;
use Illuminate\Database\Seeder;

class ClassSessionSeeder extends Seeder
{
    public function run(): void
    {
        $classTypes = ClassType::all()->keyBy('name');
        $trainers = trainer::all()->values();

        $sessions = [
            [
                'type' => 'Yoga',
                'trainer_index' => 0,
                'price' => 12.00,
                'capacity' => 18,
                'waitlist_limit' => 8,
                'allow_guest_booking' => true,
            ],
            [
                'type' => 'CrossFit',
                'trainer_index' => 1,
                'price' => 20.00,
                'capacity' => 16,
                'waitlist_limit' => 6,
                'allow_guest_booking' => false,
            ],
            [
                'type' => 'Pilates',
                'trainer_index' => 0,
                'price' => 15.00,
                'capacity' => 14,
                'waitlist_limit' => 5,
                'allow_guest_booking' => true,
            ],
            [
                'type' => 'Zumba',
                'trainer_index' => 2,
                'price' => 10.00,
                'capacity' => 22,
                'waitlist_limit' => 8,
                'allow_guest_booking' => true,
            ],
            [
                'type' => 'Spinning',
                'trainer_index' => 1,
                'price' => 18.00,
                'capacity' => 20,
                'waitlist_limit' => 7,
                'allow_guest_booking' => false,
            ],
        ];

        foreach ($sessions as $config) {
            $classType = $classTypes->get($config['type']);
            $trainer = $trainers->get($config['trainer_index']) ?? $trainers->first();

            if (!$classType || !$trainer) {
                continue;
            }

            ClassSession::create([
                'class_type_id' => $classType->id,
                'trainer_id' => $trainer->id,
                'capacity' => $config['capacity'],
                'waitlist_limit' => $config['waitlist_limit'],
                'allow_guest_booking' => $config['allow_guest_booking'],
                'price_per_attendee' => $config['price'],
            ]);
        }
    }
}
