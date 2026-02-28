<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'schedule_id' => 'required|integer|exists:schedules,id',
            'class_session_id' => 'required|integer|exists:class_sessions,id',
            'session_date' => 'required|date|after_or_equal:today',
            'attendees_count' => 'sometimes|integer|min:1|max:6',
            'payment_method' => 'required|in:cash,transfer',
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
