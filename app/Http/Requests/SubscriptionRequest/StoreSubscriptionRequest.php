<?php

namespace App\Http\Requests\SubscriptionRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'package_id' => ['required', 'exists:packages,id'],
            'payment_method' => ['required', Rule::in(['transfer', 'cash'])],
            'bank_account_id' => ['nullable', 'required_if:payment_method,transfer', 'exists:bank_accounts,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
