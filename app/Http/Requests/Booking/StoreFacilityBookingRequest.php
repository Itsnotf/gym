<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacilityBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'facility_id' => 'required|integer|exists:facilities,id',
            'start_at' => 'required|date|after_or_equal:now',
            'end_at' => 'required|date|after:start_at',
            'attendees_count' => 'sometimes|integer|min:1|max:10',
            'payment_method' => 'required|in:cash,transfer',
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
