<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use Illuminate\Database\Seeder;

class BankAccountSeeder extends Seeder
{
    public function run(): void
    {
        BankAccount::firstOrCreate(
            ['account_number' => '1234567890'],
            [
                'bank_name' => 'Bank Mandiri',
                'account_name' => 'PT Radiant Gym',
                'branch' => 'Jakarta Pusat',
                'instructions' => 'Kirim bukti transfer melalui dashboard member untuk percepatan verifikasi.',
                'display_order' => 1,
            ]
        );

        BankAccount::firstOrCreate(
            ['account_number' => '9876543210'],
            [
                'bank_name' => 'BCA',
                'account_name' => 'PT Radiant Gym',
                'branch' => 'Kelapa Gading',
                'instructions' => 'Gunakan berita transfer: RadiantGym + Nama Anda.',
                'display_order' => 2,
            ]
        );
    }
}
