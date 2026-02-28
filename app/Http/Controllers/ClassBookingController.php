<?php

namespace App\Http\Controllers;

use App\Http\Requests\Booking\StoreClassBookingRequest;
use App\Models\AttendanceLog;
use App\Models\ClassBooking;
use App\Models\ClassSession;
use App\Models\PaymentTransaction;
use App\Models\member;
use App\Models\schedule;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ClassBookingController extends Controller
{
    public function store(StoreClassBookingRequest $request): RedirectResponse
    {
        $classSession = ClassSession::with('trainer.user')->findOrFail($request->class_session_id);
        $schedule = schedule::where('class_session_id', $classSession->id)
            ->where('id', $request->schedule_id)
            ->where('is_active', true)
            ->firstOrFail();

        $sessionDate = Carbon::parse($request->session_date);

        if (Str::lower($sessionDate->format('l')) !== Str::lower($schedule->day_of_week)) {
            throw ValidationException::withMessages([
                'session_date' => 'Selected date does not match the class schedule.',
            ]);
        }

        if (!$request->user() && !$classSession->allow_guest_booking) {
            throw ValidationException::withMessages([
                'guest_name' => 'Guest booking is disabled for this class.',
            ]);
        }

        if (!$request->user()) {
            $request->validate([
                'guest_name' => 'required|string|max:255',
                'guest_email' => 'required|email|max:255',
                'guest_phone' => 'required|string|max:50',
            ]);
        }

        $attendees = (int) $request->input('attendees_count', 1);
        $user = $request->user();

        $booking = DB::transaction(function () use ($request, $classSession, $schedule, $sessionDate, $attendees, $user) {
            $status = 'confirmed';
            $waitlistPosition = null;

            $confirmedCount = ClassBooking::where('schedule_id', $schedule->id)
                ->whereDate('session_date', $sessionDate)
                ->where('status', 'confirmed')
                ->sum('attendees_count');

            if ($confirmedCount + $attendees > $classSession->capacity) {
                $waitlistCount = ClassBooking::where('schedule_id', $schedule->id)
                    ->whereDate('session_date', $sessionDate)
                    ->where('status', 'waitlisted')
                    ->count();

                if ($waitlistCount >= $classSession->waitlist_limit) {
                    throw ValidationException::withMessages([
                        'session_date' => 'Class and waitlist are currently full.',
                    ]);
                }

                $status = 'waitlisted';
                $waitlistPosition = $waitlistCount + 1;
            }

            $totalAmount = round($attendees * (float) $classSession->price_per_attendee, 2);

            $booking = ClassBooking::create([
                'class_session_id' => $classSession->id,
                'schedule_id' => $schedule->id,
                'user_id' => $user?->id,
                'session_date' => $sessionDate,
                'attendees_count' => $attendees,
                'status' => $status,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'ticket_code' => $this->generateTicketCode('CLS'),
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

            $this->recordClassAttendanceLog($booking, $classSession, $schedule, $sessionDate, $status, $user?->member);

            return $booking;
        });

        $message = $booking->status === 'waitlisted'
            ? 'Class is full. You have been added to the waitlist.'
            : 'Your class booking is confirmed!';

        return back()
            ->with('success', $message)
            ->with('payment_transaction_id', $booking->paymentTransaction?->id)
            ->with('payment_amount', $booking->total_amount);
    }

    protected function generateTicketCode(string $prefix): string
    {
        do {
            $code = $prefix . Str::upper(Str::random(6));
        } while (ClassBooking::where('ticket_code', $code)->exists());

        return $code;
    }

    private function resolveTransactionStatus(string $paymentMethod): string
    {
        return $paymentMethod === 'cash'
            ? PaymentTransaction::STATUS_AWAITING_CASH
            : PaymentTransaction::STATUS_AWAITING_PROOF;
    }

    private function recordClassAttendanceLog(ClassBooking $booking, ClassSession $classSession, schedule $schedule, Carbon $sessionDate, string $status, ?member $member): void
    {
        if (! $member) {
            return;
        }

        $scheduledFor = (clone $sessionDate)->setTimeFromTimeString($schedule->start_time ?? '00:00:00');

        AttendanceLog::create([
            'member_id' => $member->id,
            'trainer_id' => $classSession->trainer_id,
            'attendable_type' => ClassBooking::class,
            'attendable_id' => $booking->id,
            'status' => $status === 'waitlisted' ? 'waitlisted' : 'scheduled',
            'scheduled_for' => $scheduledFor,
            'notes' => $status === 'waitlisted' ? 'Automatic waitlist entry' : null,
        ]);
    }
}
