<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Users permissions
            'users index',
            'users create',
            'users edit',
            'users delete',
            // Roles permissions
            'roles index',
            'roles create',
            'roles edit',
            'roles delete',
            // Class Types permissions
            'class_types index',
            'class_types create',
            'class_types edit',
            'class_types delete',
            // Trainers permissions
            'trainers index',
            'trainers create',
            'trainers edit',
            'trainers delete',
            // Members permissions
            'members index',
            'members create',
            'members edit',
            'members delete',
            // Class Sessions permissions
            'class_sessions index',
            'class_sessions create',
            'class_sessions edit',
            'class_sessions delete',
            // Schedules permissions
            'schedules index',
            'schedules create',
            'schedules edit',
            'schedules delete',
            // Facilities permissions
            'facilities index',
            'facilities create',
            'facilities edit',
            'facilities delete',
            // Bank Accounts permissions
            'bank_accounts index',
            'bank_accounts create',
            'bank_accounts edit',
            'bank_accounts delete',
            // Packages permissions
            'packages index',
            'packages create',
            'packages edit',
            'packages delete',
            // Booking & payments
            'bookings review',
            'payments review',
            'subscriptions review',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
