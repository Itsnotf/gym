<?php

namespace App\Http\Requests\ClassSessionRequest;

use Illuminate\Foundation\Http\FormRequest;

class CreateClassSessionRequest extends FormRequest
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
            "class_type_id" => "required|integer|exists:class_types,id",
            "trainer_id" => "required|integer|exists:trainers,id",
            "capacity" => "required|integer|min:1|max:100",
            "waitlist_limit" => "required|integer|min:0|max:50",
            "allow_guest_booking" => "required|boolean",
        ];
    }
}
