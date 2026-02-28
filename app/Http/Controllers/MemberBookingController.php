<?php

namespace App\Http\Controllers;

use App\Models\ClassBooking;
use App\Models\FacilityBooking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MemberBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('bookings/index', [
            'classBookings' => $user->classBookings()
                ->with(['classSession.classType', 'schedule.classSession'])
                ->latest()
                ->get(),
            'facilityBookings' => $user->facilityBookings()
                ->with('facility')
                ->latest()
                ->get(),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function cancelClass(Request $request, ClassBooking $classBooking): RedirectResponse
    {
        abort_unless($classBooking->user_id === $request->user()->id, 403);

        DB::transaction(function () use ($classBooking) {
            $wasConfirmed = $classBooking->status === 'confirmed';

            $classBooking->update([
                'status' => 'cancelled',
                'payment_status' => 'cancelled',
                'waitlist_position' => null,
            ]);

            if ($wasConfirmed) {
                $this->promoteNextClassBooking($classBooking);
            }

            $this->reindexClassWaitlist($classBooking);
        });

        return back()->with('success', 'Class booking cancelled.');
    }

    public function cancelFacility(Request $request, FacilityBooking $facilityBooking): RedirectResponse
    {
        abort_unless($facilityBooking->user_id === $request->user()->id, 403);

        DB::transaction(function () use ($facilityBooking) {
            $wasConfirmed = $facilityBooking->status === 'confirmed';

            $facilityBooking->update([
                'status' => 'cancelled',
                'payment_status' => 'cancelled',
                'waitlist_position' => null,
            ]);

            if ($wasConfirmed) {
                $this->promoteNextFacilityBooking($facilityBooking);
            }

            $this->reindexFacilityWaitlist($facilityBooking);
        });

        return back()->with('success', 'Facility booking cancelled.');
    }

    protected function promoteNextClassBooking(ClassBooking $cancelled): void
    {
        $next = ClassBooking::where('schedule_id', $cancelled->schedule_id)
            ->whereDate('session_date', $cancelled->session_date)
            ->where('status', 'waitlisted')
            ->orderBy('waitlist_position')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'confirmed',
                'waitlist_position' => null,
            ]);
        }
    }

    protected function reindexClassWaitlist(ClassBooking $context): void
    {
        $waitlisted = ClassBooking::where('schedule_id', $context->schedule_id)
            ->whereDate('session_date', $context->session_date)
            ->where('status', 'waitlisted')
            ->orderBy('waitlist_position')
            ->get();

        foreach ($waitlisted as $index => $booking) {
            $booking->update(['waitlist_position' => $index + 1]);
        }
    }

    protected function promoteNextFacilityBooking(FacilityBooking $cancelled): void
    {
        $next = FacilityBooking::where('facility_id', $cancelled->facility_id)
            ->where('status', 'waitlisted')
            ->where(function ($query) use ($cancelled) {
                $query->whereBetween('start_at', [$cancelled->start_at, $cancelled->end_at])
                    ->orWhereBetween('end_at', [$cancelled->start_at, $cancelled->end_at])
                    ->orWhere(function ($inner) use ($cancelled) {
                        $inner->where('start_at', '<=', $cancelled->start_at)
                            ->where('end_at', '>=', $cancelled->end_at);
                    });
            })
            ->orderBy('waitlist_position')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'confirmed',
                'waitlist_position' => null,
            ]);
        }
    }

    protected function reindexFacilityWaitlist(FacilityBooking $context): void
    {
        $waitlisted = FacilityBooking::where('facility_id', $context->facility_id)
            ->where('status', 'waitlisted')
            ->orderBy('waitlist_position')
            ->get();

        foreach ($waitlisted as $index => $booking) {
            $booking->update(['waitlist_position' => $index + 1]);
        }
    }
}
