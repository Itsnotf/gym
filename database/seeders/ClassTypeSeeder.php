<?php

namespace Database\Seeders;

use App\Models\ClassType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassTypeSeeder extends Seeder
{
    public function run(): void
    {
        ClassType::create([
            'name' => 'Yoga',
            'description' => 'Relaxing yoga classes for flexibility and peace of mind',
        ]);

        ClassType::create([
            'name' => 'CrossFit',
            'description' => 'High-intensity functional fitness training',
        ]);

        ClassType::create([
            'name' => 'Pilates',
            'description' => 'Core strengthening and body conditioning',
        ]);

        ClassType::create([
            'name' => 'Zumba',
            'description' => 'Fun and energetic dance fitness classes',
        ]);

        ClassType::create([
            'name' => 'Spinning',
            'description' => 'Indoor cycling classes with music',
        ]);
    }
}
