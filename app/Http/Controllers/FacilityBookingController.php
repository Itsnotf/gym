<?php

namespace App\Http\Controllers;

use App\Http\Requests\Booking\StoreFacilityBookingRequest;
use App\Models\AttendanceLog;
use App\Models\Facility;
use App\Models\FacilityBooking;
use App\Models\PaymentTransaction;
use App\Models\member;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FacilityBookingController extends Controller
{
    public function store(StoreFacilityBookingRequest $request): RedirectResponse
    {
        $facility = Facility::where('is_active', true)->findOrFail($request->facility_id);
        $user = $request->user();

        if ($facility->requires_membership && !$user?->member) {
            throw ValidationException::withMessages([
                'facility_id' => 'This facility requires an active membership.',
            ]);
        }

        if (!$user) {
            $request->validate([
                'guest_name' => 'required|string|max:255',
                'guest_email' => 'required|email|max:255',
                'guest_phone' => 'required|string|max:50',
            ]);
        }

        $startAt = Carbon::parse($request->start_at);
        $endAt = Carbon::parse($request->end_at);
        $attendees = (int) $request->input('attendees_count', 1);

        $booking = DB::transaction(function () use ($request, $facility, $user, $startAt, $endAt, $attendees) {
            $status = 'confirmed';
            $waitlistPosition = null;

            $confirmedAttendees = FacilityBooking::where('facility_id', $facility->id)
                ->where('status', 'confirmed')
                ->where(function ($query) use ($startAt, $endAt) {
                    $query->whereBetween('start_at', [$startAt, $endAt])
                        ->orWhereBetween('end_at', [$startAt, $endAt])
                        ->orWhere(function ($inner) use ($startAt, $endAt) {
                            $inner->where('start_at', '<=', $startAt)
                                ->where('end_at', '>=', $endAt);
                        });
                })
                ->sum('attendees_count');

            if ($confirmedAttendees + $attendees > $facility->capacity) {
                $waitlistCount = FacilityBooking::where('facility_id', $facility->id)
                    ->where('status', 'waitlisted')
                    ->where(function ($query) use ($startAt, $endAt) {
                        $query->whereBetween('start_at', [$startAt, $endAt])
                            ->orWhereBetween('end_at', [$startAt, $endAt])
                            ->orWhere(function ($inner) use ($startAt, $endAt) {
                                $inner->where('start_at', '<=', $startAt)
                                    ->where('end_at', '>=', $endAt);
                            });
                    })
                    ->count();

                if ($waitlistCount >= $facility->waitlist_limit) {
                    throw ValidationException::withMessages([
                        'start_at' => 'Facility capacity and waitlist are currently full.',
                    ]);
                }

                $status = 'waitlisted';
                $waitlistPosition = $waitlistCount + 1;
            }

            $durationMinutes = max(60, $startAt->diffInMinutes($endAt));
            $durationHours = round($durationMinutes / 60, 2);
            $totalAmount = round($durationHours * (float) $facility->hourly_rate, 2);

            $booking = FacilityBooking::create([
                'facility_id' => $facility->id,
                'user_id' => $user?->id,
                'start_at' => $startAt,
                'end_at' => $endAt,
                'attendees_count' => $attendees,
                'status' => $status,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'ticket_code' => $this->generateTicketCode('FAC'),
                'waitlist_position' => $waitlistPosition,
                'source' => $user ? 'member' : 'guest',
                'guest_name' => $user?->name ?? $request->guest_name,
                'guest_email' => $user?->email ?? $request->guest_email,
                'guest_phone' => $request->guest_phone,
                'notes' => $request->notes,
                'total_amount' => $totalAmount,
            ]);

            $paymentTransaction = $booking->paymentTransaction()->create([
                'user_id' => $user?->id,
                'payment_method' => $request->payment_method,
                'amount' => $totalAmount,
                'status' => $this->resolveTransactionStatus($request->payment_method),
            ]);

            $booking->setRelation('paymentTransaction', $paymentTransaction);

            $this->recordFacilityAttendanceLog($booking, $startAt, $status, $user?->member);

            return $booking;
        });

        $message = $booking->status === 'waitlisted'
            ? 'Facility capacity is full. You have been added to the waitlist.'
            : 'Your facility booking is confirmed!';

        return back()
            ->with('success', $message)
            ->with('payment_transaction_id', $booking->paymentTransaction?->id)
            ->with('payment_amount', $booking->total_amount);
    }

    protected function generateTicketCode(string $prefix): string
    {
        do {
            $code = $prefix . Str::upper(Str::random(6));
        } while (FacilityBooking::where('ticket_code', $code)->exists());

        return $code;
    }

    private function resolveTransactionStatus(string $paymentMethod): string
    {
        return $paymentMethod === 'cash'
            ? PaymentTransaction::STATUS_AWAITING_CASH
            : PaymentTransaction::STATUS_AWAITING_PROOF;
    }

    private function recordFacilityAttendanceLog(FacilityBooking $booking, Carbon $startAt, string $status, ?member $member): void
    {
        if (! $member) {
            return;
        }

        AttendanceLog::create([
            'member_id' => $member->id,
            'attendable_type' => FacilityBooking::class,
            'attendable_id' => $booking->id,
            'status' => $status === 'waitlisted' ? 'waitlisted' : 'scheduled',
            'scheduled_for' => $startAt,
            'notes' => $status === 'waitlisted' ? 'Automatic waitlist entry' : null,
        ]);
    }
}
