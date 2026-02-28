<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Models\User;
use App\Models\member;
use App\Models\Package;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $members = member::with('user')->get();
        $packages = Package::active()->get();

        if ($members->isEmpty() || $packages->isEmpty()) {
            return;
        }

        $bankAccountId = BankAccount::query()->value('id');
        $adminId = User::where('email', 'admin@gmail.com')->value('id');

        $statusCycle = [
            Subscription::STATUS_ACTIVE,
            Subscription::STATUS_PENDING,
            Subscription::STATUS_EXPIRED,
        ];

        foreach ($members as $index => $member) {
            $package = $packages[$index % $packages->count()];
            $status = $statusCycle[$index % count($statusCycle)];

            $start = null;
            $expires = null;
            $cancelledAt = null;

            if ($status === Subscription::STATUS_ACTIVE) {
                $start = Carbon::now()->subDays(3 + $index);
                $expires = (clone $start)->addDays($package->duration_days);
            } elseif ($status === Subscription::STATUS_EXPIRED) {
                $start = Carbon::now()->subDays($package->duration_days + 20);
                $expires = (clone $start)->addDays($package->duration_days);
            }

            $subscription = Subscription::updateOrCreate(
                ['reference' => 'SUB-SEED-' . ($index + 1)],
                [
                    'member_id' => $member->id,
                    'package_id' => $package->id,
                    'status' => $status,
                    'price' => $package->price,
                    'payment_method' => $status === Subscription::STATUS_PENDING ? 'transfer' : 'cash',
                    'started_at' => $start,
                    'expires_at' => $expires,
                    'cancelled_at' => $cancelledAt,
                    'metadata' => [
                        'seeded' => true,
                        'package_snapshot' => Arr::only($package->toArray(), ['name', 'type', 'duration_days', 'price']),
                    ],
                ]
            );

            $transactionStatus = match ($status) {
                Subscription::STATUS_PENDING => PaymentTransaction::STATUS_AWAITING_PROOF,
                Subscription::STATUS_ACTIVE, Subscription::STATUS_EXPIRED => PaymentTransaction::STATUS_VERIFIED,
                default => PaymentTransaction::STATUS_SUBMITTED,
            };

            $subscription->paymentTransaction()->updateOrCreate(
                [],
                [
                    'user_id' => $member->user_id,
                    'bank_account_id' => $bankAccountId,
                    'payment_method' => $status === Subscription::STATUS_PENDING ? 'transfer' : 'cash',
                    'amount' => $package->price,
                    'status' => $transactionStatus,
                    'reference_number' => 'PAY-SEED-' . ($index + 1),
                    'notes' => 'Seeded subscription payment',
                    'receipt_number' => $transactionStatus === PaymentTransaction::STATUS_VERIFIED ? 'RCT-SEED-' . ($index + 1) : null,
                    'receipt_issued_at' => $transactionStatus === PaymentTransaction::STATUS_VERIFIED ? now() : null,
                    'verified_by' => $transactionStatus === PaymentTransaction::STATUS_VERIFIED ? $adminId : null,
                    'verified_at' => $transactionStatus === PaymentTransaction::STATUS_VERIFIED ? now() : null,
                    'paid_at' => $transactionStatus === PaymentTransaction::STATUS_VERIFIED ? now()->subDay() : null,
                ]
            );
        }
    }
}
