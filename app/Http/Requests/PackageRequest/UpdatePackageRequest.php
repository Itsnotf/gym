<?php

namespace App\Http\Requests\PackageRequest;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('packages edit') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'class_session_ids' => ['nullable', 'array'],
            'class_session_ids.*' => ['integer', 'exists:class_sessions,id'],
            'facility_ids' => ['nullable', 'array'],
            'facility_ids.*' => ['integer', 'exists:facilities,id'],
        ];
    }
}
