<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubscriptionRequest\StoreSubscriptionRequest;
use App\Models\BankAccount;
use App\Models\Package;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('auth'),
            new Middleware('verified'),
        ];
    }

    /**
     * Display member's subscriptions and available packages
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $member = $user?->member;

        if (!$member) {
            abort(403, 'Member profile required to manage subscriptions.');
        }

        $currentSubscription = Subscription::where('member_id', $member->id)
            ->whereIn('status', ['active', 'pending'])
            ->latest('created_at')
            ->first();

        $subscriptionHistory = Subscription::where('member_id', $member->id)
            ->with('package')
            ->latest('created_at')
            ->get()
            ->map(function (Subscription $subscription) {
                return [
                    'id' => $subscription->id,
                    'package' => $subscription->package?->name,
                    'price' => $subscription->price,
                    'status' => $subscription->status,
                    'started_at' => $subscription->started_at?->toDateString(),
                    'expires_at' => $subscription->expires_at?->toDateString(),
                ];
            });

        $availablePackages = Package::active()
            ->get()
            ->map(function (Package $package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'type' => $package->type,
                    'description' => $package->description,
                    'price' => $package->price,
                    'duration_days' => $package->duration_days,
                ];
            });

        $bankAccounts = BankAccount::active()->get(['id', 'account_name', 'account_number', 'bank_name']);

        return Inertia::render('dashboard/subscriptions', [
            'currentSubscription' => $currentSubscription ? [
                'id' => $currentSubscription->id,
                'package' => $currentSubscription->package?->name,
                'price' => $currentSubscription->price,
                'status' => $currentSubscription->status,
                'started_at' => $currentSubscription->started_at?->toDateString(),
                'expires_at' => $currentSubscription->expires_at?->toDateString(),
            ] : null,
            'subscriptionHistory' => $subscriptionHistory,
            'availablePackages' => $availablePackages,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    /**
     * Store a new subscription
     */
    public function store(StoreSubscriptionRequest $request): RedirectResponse
    {
        $user = $request->user();
        $member = $user?->member;

        if (! $member) {
            abort(403, 'Member profile required to purchase a subscription.');
        }

        $data = $request->validated();
        $package = Package::active()->findOrFail($data['package_id']);

        // Check if member has active subscription for same package
        $existingSubscription = Subscription::where('member_id', $member->id)
            ->where('package_id', $package->id)
            ->whereIn('status', ['active', 'pending'])
            ->where('expires_at', '>', now())
            ->first();

        $status = $data['payment_method'] === 'cash'
            ? PaymentTransaction::STATUS_AWAITING_CASH
            : PaymentTransaction::STATUS_AWAITING_PROOF;

        /** @var Subscription|null $subscription */
        $subscription = null;

        DB::transaction(function () use ($member, $package, $data, $status, &$subscription, $user, $existingSubscription) {
            if ($existingSubscription) {
                // Extend existing subscription instead of creating new one
                $newExpiresAt = $existingSubscription->expires_at
                    ->addDays($package->duration_days);

                $existingSubscription->update([
                    'expires_at' => $newExpiresAt,
                    'payment_method' => $data['payment_method'],
                ]);

                // Create payment transaction for the extension
                $existingSubscription->paymentTransaction()->create([
                    'user_id' => $user->id,
                    'bank_account_id' => $data['bank_account_id'] ?? null,
                    'payment_method' => $data['payment_method'],
                    'amount' => $package->price,
                    'status' => $status,
                    'reference_number' => 'PAY-' . strtoupper(uniqid()),
                    'notes' => 'Subscription extension for ' . $package->name,
                    'proof_path' => $data['proof'] ? $this->storeProof($data['proof']) : null,
                ]);

                $subscription = $existingSubscription;
            } else {
                // Create new subscription
                $subscription = Subscription::create([
                    'member_id' => $member->id,
                    'package_id' => $package->id,
                    'reference' => 'SUB-' . uniqid(),
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
                    'reference_number' => 'PAY-' . strtoupper(uniqid()),
                    'notes' => 'Subscription purchase for ' . $package->name,
                    'proof_path' => $data['proof'] ? $this->storeProof($data['proof']) : null,
                ]);
            }
        });

        $message = $existingSubscription
            ? 'Subscription extended successfully. New expiration date: ' . $subscription->expires_at->toDateString()
            : 'Subscription request created. Please settle the payment to activate your package.';

        return redirect()
            ->route('subscriptions.index')
            ->with('success', $message);
    }

    /**
     * Store proof of payment file
     */
    private function storeProof($file): ?string
    {
        if (!$file) {
            return null;
        }

        return $file->store('payment-proofs', 'public');
    }
}
