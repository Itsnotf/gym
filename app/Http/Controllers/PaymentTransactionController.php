<?php

namespace App\Http\Controllers;

use App\Models\ClassBooking;
use App\Models\FacilityBooking;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $pendingStatuses = [
            PaymentTransaction::STATUS_AWAITING_PROOF,
            PaymentTransaction::STATUS_AWAITING_CASH,
            PaymentTransaction::STATUS_SUBMITTED,
        ];

        $pendingTransactions = PaymentTransaction::with(['user', 'bankAccount', 'payable'])
            ->whereIn('status', $pendingStatuses)
            ->latest()
            ->take(25)
            ->get()
            ->map(fn (PaymentTransaction $transaction) => $this->transformTransaction($transaction));

        $recentTransactions = PaymentTransaction::with(['user', 'payable'])
            ->where('status', PaymentTransaction::STATUS_VERIFIED)
            ->latest('verified_at')
            ->take(10)
            ->get()
            ->map(fn (PaymentTransaction $transaction) => [
                'id' => $transaction->id,
                'amount' => $transaction->amount,
                'status' => $transaction->status,
                'member' => $transaction->user?->name,
                'receipt_number' => $transaction->receipt_number,
                'verified_at' => optional($transaction->verified_at)->toDateTimeString(),
                'payable_label' => $this->describePayable($transaction->payable),
            ]);

        return Inertia::render('payments/transactions/index', [
            'pendingTransactions' => $pendingTransactions,
            'recentTransactions' => $recentTransactions,
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function update(Request $request, PaymentTransaction $paymentTransaction): RedirectResponse
    {
        $data = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    PaymentTransaction::STATUS_VERIFIED,
                    PaymentTransaction::STATUS_REJECTED,
                ]),
            ],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $paymentTransaction->fill([
            'status' => $data['status'],
            'admin_note' => $data['admin_note'] ?? null,
        ]);

        if ($data['status'] === PaymentTransaction::STATUS_VERIFIED) {
            $paymentTransaction->verified_by = $request->user()->id;
            $paymentTransaction->verified_at = now();
            $paymentTransaction->paid_at = $paymentTransaction->paid_at ?? now();

            if (! $paymentTransaction->receipt_number) {
                $paymentTransaction->receipt_number = PaymentTransaction::generateReceiptNumber();
                $paymentTransaction->receipt_issued_at = now();
            }

            $this->syncPayablePaymentStatus($paymentTransaction, 'paid');
        }

        if ($data['status'] === PaymentTransaction::STATUS_REJECTED) {
            $paymentTransaction->verified_by = $request->user()->id;
            $paymentTransaction->verified_at = now();
            $this->syncPayablePaymentStatus($paymentTransaction, 'rejected');
        }

        $paymentTransaction->save();

        return back()->with('success', 'Payment transaction updated.');
    }

    protected function syncPayablePaymentStatus(PaymentTransaction $paymentTransaction, string $status): void
    {
        $paymentTransaction->loadMissing('payable');
        $payable = $paymentTransaction->payable;

        if ($payable instanceof Subscription) {
            if ($status === 'paid') {
                $payable->activate();
            }

            if ($status === 'rejected') {
                $payable->cancel('Payment rejected by admin');
            }

            return;
        }

        if ($payable && $payable->isFillable('payment_status')) {
            $payable->forceFill(['payment_status' => $status])->save();
        }
    }

    protected function describePayable(mixed $payable): ?string
    {
        return match (true) {
            $payable instanceof ClassBooking => 'Class • ' . ($payable->ticket_code ?? ('#' . $payable->id)),
            $payable instanceof FacilityBooking => 'Facility • ' . ($payable->ticket_code ?? ('#' . $payable->id)),
            $payable instanceof Subscription => 'Subscription • ' . ($payable->package?->name ?? $payable->reference),
            default => null,
        };
    }

    protected function transformTransaction(PaymentTransaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'status' => $transaction->status,
            'amount' => $transaction->amount,
            'payment_method' => $transaction->payment_method,
            'reference_number' => $transaction->reference_number,
            'proof_path' => $transaction->proof_path,
            'receipt_number' => $transaction->receipt_number,
            'admin_note' => $transaction->admin_note,
            'member' => $transaction->user?->name ?? 'Guest',
            'payable_label' => $this->describePayable($transaction->payable),
            'bank_account' => $transaction->bankAccount ? [
                'bank_name' => $transaction->bankAccount->bank_name,
                'account_name' => $transaction->bankAccount->account_name,
                'account_number' => $transaction->bankAccount->account_number,
            ] : null,
        ];
    }
}
