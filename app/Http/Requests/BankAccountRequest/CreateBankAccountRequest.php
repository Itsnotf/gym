<?php

namespace App\Http\Requests\BankAccountRequest;

use Illuminate\Foundation\Http\FormRequest;

class CreateBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name' => 'required|string|max:191',
            'account_name' => 'required|string|max:191',
            'account_number' => 'required|string|max:191|unique:bank_accounts,account_number',
            'branch' => 'nullable|string|max:191',
            'instructions' => 'nullable|string',
            'display_order' => 'nullable|integer|min:0|max:999',
            'is_active' => 'nullable|boolean',
        ];
    }
}
