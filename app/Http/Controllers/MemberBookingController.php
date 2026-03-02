<?php

namespace App\Http\Controllers;

use App\Models\ClassBooking;
use App\Models\FacilityBooking;
use App\Models\Schedule;
use App\Models\Facility;
use App\Models\BankAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MemberBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('bookings/index', [
            'classBookings' => $user->classBookings()
                ->with(['classSession.classType', 'schedule'])
                ->latest()
                ->get(),
            'facilityBookings' => $user->facilityBookings()
                ->with('facility')
                ->latest()
                ->get(),
            'schedules' => Schedule::with(['classSession.classType'])
                ->where('is_active', true)
                ->whereHas('classSession')
                ->get(),
            'facilities' => Facility::where('is_active', true)
                ->orderBy('name')
                ->get(),
            'bankAccounts' => BankAccount::all(),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function create(): Response
    {
        $schedules = Schedule::with(['classSession.classType'])
            ->where('is_active', true)
            ->whereHas('classSession')
            ->get();

        $facilities = Facility::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('bookings/create', [
            'schedules' => $schedules,
            'facilities' => $facilities,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'booking_type' => ['required', 'in:class,facility'],
            'schedule_id' => ['required_if:booking_type,class', 'exists:schedules,id'],
            'facility_id' => ['required_if:booking_type,facility', 'exists:facilities,id'],
            'session_date' => ['required_if:booking_type,class', 'date', 'after:today'],
            'start_at' => ['required_if:booking_type,facility', 'date'],
            'end_at' => ['required_if:booking_type,facility', 'date', 'after:start_at'],
            'attendees_count' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', 'in:transfer,cash'],
            'bank_account_id' => ['required_if:payment_method,transfer', 'exists:bank_accounts,id'],
            'proof' => ['required_if:payment_method,transfer', 'file', 'image', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            DB::transaction(function () use ($user, $validated, $request) {
                if ($validated['booking_type'] === 'class') {
                    $schedule = Schedule::findOrFail($validated['schedule_id']);
                    $totalAmount = $schedule->price_per_class * $validated['attendees_count'];

                    $classBooking = ClassBooking::create([
                        'user_id' => $user->id,
                        'class_session_id' => $schedule->class_session_id,
                        'schedule_id' => $validated['schedule_id'],
                        'session_date' => $validated['session_date'],
                        'status' => 'confirmed',
                        'payment_method' => $validated['payment_method'],
                        'payment_status' => 'pending',
                        'attendees_count' => $validated['attendees_count'],
                        'total_amount' => $totalAmount,
                        'notes' => $validated['notes'] ?? null,
                        'ticket_code' => 'TC-' . uniqid(),
                    ]);

                    // Handle payment proof upload
                    if ($validated['payment_method'] === 'transfer' && $request->hasFile('proof')) {
                        $path = $request->file('proof')->store("bookings/class/{$classBooking->id}", 'public');
                        $classBooking->update(['payment_proof' => $path]);
                    }
                } else {
                    $facility = Facility::findOrFail($validated['facility_id']);

                    // Calculate duration in hours
                    $startTime = \Carbon\Carbon::parse($validated['start_at']);
                    $endTime = \Carbon\Carbon::parse($validated['end_at']);
                    $durationHours = $endTime->diffInHours($startTime);

                    $totalAmount = $facility->hourly_rate * $durationHours * $validated['attendees_count'];

                    $facilityBooking = FacilityBooking::create([
                        'user_id' => $user->id,
                        'facility_id' => $validated['facility_id'],
                        'start_at' => $validated['start_at'],
                        'end_at' => $validated['end_at'],
                        'status' => 'confirmed',
                        'payment_method' => $validated['payment_method'],
                        'payment_status' => 'pending',
                        'attendees_count' => $validated['attendees_count'],
                        'total_amount' => $totalAmount,
                        'notes' => $validated['notes'] ?? null,
                        'ticket_code' => 'TF-' . uniqid(),
                    ]);

                    // Handle payment proof upload
                    if ($validated['payment_method'] === 'transfer' && $request->hasFile('proof')) {
                        $path = $request->file('proof')->store("bookings/facility/{$facilityBooking->id}", 'public');
                        $facilityBooking->update(['payment_proof' => $path]);
                    }
                }
            });

            return redirect('/my/bookings')->with('success', 'Booking created successfully! Awaiting payment confirmation.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create booking: ' . $e->getMessage());
        }
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

    public function confirmClassBooking(Request $request, ClassBooking $classBooking): RedirectResponse
    {
        $classBooking->update(['payment_status' => 'confirmed']);

        return back()->with('success', 'Class booking payment confirmed!');
    }

    public function confirmFacilityBooking(Request $request, FacilityBooking $facilityBooking): RedirectResponse
    {
        $facilityBooking->update(['payment_status' => 'confirmed']);

        return back()->with('success', 'Facility booking payment confirmed!');
    }
}
