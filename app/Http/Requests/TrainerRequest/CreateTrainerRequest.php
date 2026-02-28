<?php

namespace App\Http\Requests\TrainerRequest;

use Illuminate\Foundation\Http\FormRequest;

class CreateTrainerRequest extends FormRequest
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
            "user_id" => "required|integer|exists:users,id|unique:trainers,user_id",
            "specialty" => "required|string|max:255",
        ];
    }
}
