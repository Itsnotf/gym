<?php

namespace App\Http\Requests\ClassTypeRequest;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "name" => "required|string|max:255|unique:class_types,name," . $this->route('classType'),
            "description" => "required|string|max:1000",
        ];
    }
}
