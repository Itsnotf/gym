<?php

namespace App\Http\Requests\ScheduleRequest;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
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
            "class_session_id" => "required|integer|exists:class_sessions,id",
            "day_of_week" => "required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
            "start_time" => "required|date_format:H:i",
            "end_time" => "required|date_format:H:i|after:start_time",
            "is_active" => "required|boolean",
        ];
    }
}
