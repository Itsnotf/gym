<?php

namespace App\Http\Controllers;

use App\Http\Requests\BankAccountRequest\CreateBankAccountRequest;
use App\Http\Requests\BankAccountRequest\UpdateBankAccountRequest;
use App\Models\BankAccount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class BankAccountController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:bank_accounts index', only: ['index']),
            new Middleware('permission:bank_accounts create', only: ['create', 'store']),
            new Middleware('permission:bank_accounts edit', only: ['edit', 'update']),
            new Middleware('permission:bank_accounts delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $accounts = BankAccount::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('bank_name', 'like', "%{$search}%")
                        ->orWhere('account_name', 'like', "%{$search}%")
                        ->orWhere('account_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('display_order')
            ->orderBy('bank_name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/bank-accounts/index', [
            'accounts' => $accounts,
            'filters' => $request->only('search'),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/bank-accounts/create');
    }

    public function store(CreateBankAccountRequest $request): RedirectResponse
    {
        BankAccount::create($this->payloadFrom($request));

        return redirect()
            ->route('admin.bank-accounts.index')
            ->with('success', 'Bank account added successfully.');
    }

    public function edit(BankAccount $bankAccount): Response
    {
        return Inertia::render('admin/bank-accounts/edit', [
            'bankAccount' => $bankAccount,
        ]);
    }

    public function update(UpdateBankAccountRequest $request, BankAccount $bankAccount): RedirectResponse
    {
        $bankAccount->update($this->payloadFrom($request));

        return redirect()
            ->route('admin.bank-accounts.index')
            ->with('success', 'Bank account updated successfully.');
    }

    public function destroy(BankAccount $bankAccount): RedirectResponse
    {
        $bankAccount->delete();

        return redirect()
            ->back()
            ->with('success', 'Bank account removed.');
    }

    protected function payloadFrom(FormRequest $request): array
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');
        $data['display_order'] = $data['display_order'] ?? 0;

        return $data;
    }
}
