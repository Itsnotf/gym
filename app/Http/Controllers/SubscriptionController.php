<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubscriptionRequest\StoreSubscriptionRequest;
use App\Models\Package;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    public function store(StoreSubscriptionRequest $request): RedirectResponse
    {
        $user = $request->user();
        $member = $user?->member;

        if (! $member) {
            abort(403, 'Member profile required to purchase a subscription.');
        }

        $data = $request->validated();
        $package = Package::active()->findOrFail($data['package_id']);
        $status = $data['payment_method'] === 'cash'
            ? PaymentTransaction::STATUS_AWAITING_CASH
            : PaymentTransaction::STATUS_AWAITING_PROOF;

        $subscription = null;

        DB::transaction(function () use ($member, $package, $data, $status, &$subscription, $user) {
            $subscription = Subscription::create([
                'member_id' => $member->id,
                'package_id' => $package->id,
                'status' => Subscription::STATUS_PENDING,
                'price' => $package->price,
                'payment_method' => $data['payment_method'],
                'metadata' => [
                    'package' => Arr::only($package->toArray(), ['name', 'type', 'duration_days', 'price']),
                ],
                'notes' => $data['notes'] ?? null,
            ]);

            $subscription->paymentTransaction()->create([
                'user_id' => $user->id,
                'bank_account_id' => $data['bank_account_id'] ?? null,
                'payment_method' => $data['payment_method'],
                'amount' => $package->price,
                'status' => $status,
                'reference_number' => 'PAY-' . Str::upper(Str::random(10)),
                'notes' => 'Subscription purchase for ' . $package->name,
            ]);
        });

        return redirect()
            ->route('dashboard')
            ->with('success', 'Subscription request created. Please settle the payment to activate your package.');
    }
}
