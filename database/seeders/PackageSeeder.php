<?php

namespace Database\Seeders;

use App\Models\ClassSession;
use App\Models\Facility;
use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $classSessionIds = ClassSession::pluck('id')->all();
        $facilityIds = Facility::pluck('id')->all();

        $packages = [
            [
                'name' => 'Essential Class Pack',
                'type' => 'class',
                'description' => 'A starter bundle that grants unlimited access to signature classes for 30 days.',
                'price' => 450000,
                'duration_days' => 30,
            ],
            [
                'name' => 'Total Access Membership',
                'type' => 'all_access',
                'description' => 'Access to every class and facility, perfect for members seeking full flexibility.',
                'price' => 750000,
                'duration_days' => 30,
            ],
            [
                'name' => 'Facility Flex',
                'type' => 'facility',
                'description' => 'Ideal for members focused on equipment usage and self-paced training.',
                'price' => 300000,
                'duration_days' => 30,
            ],
        ];

        foreach ($packages as $packageData) {
            $package = Package::firstOrCreate(
                ['name' => $packageData['name']],
                $packageData
            );

            if ($package->wasRecentlyCreated) {
                if (! empty($classSessionIds)) {
                    $package->classSessions()->sync(array_slice($classSessionIds, 0, min(4, count($classSessionIds))));
                }

                if (! empty($facilityIds)) {
                    $package->facilities()->sync(array_slice($facilityIds, 0, min(3, count($facilityIds))));
                }
            }
        }
    }
}
