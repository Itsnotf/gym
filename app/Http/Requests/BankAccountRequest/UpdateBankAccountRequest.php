<?php

namespace App\Http\Requests\BankAccountRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankAccountRequest extends FormRequest
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
            'account_number' => [
                'required',
                'string',
                'max:191',
                Rule::unique('bank_accounts', 'account_number')->ignore($this->route('bank_account')),
            ],
            'branch' => 'nullable|string|max:191',
            'instructions' => 'nullable|string',
            'display_order' => 'nullable|integer|min:0|max:999',
            'is_active' => 'nullable|boolean',
        ];
    }
}
