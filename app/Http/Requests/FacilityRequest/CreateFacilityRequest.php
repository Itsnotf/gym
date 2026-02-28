<?php

namespace App\Http\Requests\FacilityRequest;

use Illuminate\Foundation\Http\FormRequest;

class CreateFacilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:191',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1|max:500',
            'waitlist_limit' => 'required|integer|min:0|max:500',
            'requires_membership' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'hourly_rate' => 'required|numeric|min:0|max:100000',
        ];
    }
}
