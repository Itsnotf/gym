<?php

namespace App\Http\Controllers;

use App\Models\ClassBooking;
use App\Models\FacilityBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $classBookings = ClassBooking::with([
            'classSession.classType',
            'classSession.trainer.user',
            'user',
            'paymentTransaction',
        ])
            ->latest()
            ->take(25)
            ->get()
            ->map(function (ClassBooking $booking) {
                return [
                    'id' => $booking->id,
                    'member' => $booking->user?->name ?? $booking->guest_name,
                    'class_type' => $booking->classSession?->classType?->name,
                    'trainer' => $booking->classSession?->trainer?->user?->name,
                    'session_date' => optional($booking->session_date)->format('Y-m-d'),
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'payment_method' => $booking->payment_method,
                    'total_amount' => $booking->total_amount,
                    'ticket_code' => $booking->ticket_code,
                    'transaction' => $booking->paymentTransaction ? [
                        'id' => $booking->paymentTransaction->id,
                        'status' => $booking->paymentTransaction->status,
                        'amount' => $booking->paymentTransaction->amount,
                    ] : null,
                ];
            });

        $facilityBookings = FacilityBooking::with([
            'facility',
            'user',
            'paymentTransaction',
        ])
            ->latest()
            ->take(25)
            ->get()
            ->map(function (FacilityBooking $booking) {
                return [
                    'id' => $booking->id,
                    'member' => $booking->user?->name ?? $booking->guest_name,
                    'facility' => $booking->facility?->name,
                    'start_at' => optional($booking->start_at)->format('Y-m-d H:i'),
                    'end_at' => optional($booking->end_at)->format('Y-m-d H:i'),
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'payment_method' => $booking->payment_method,
                    'total_amount' => $booking->total_amount,
                    'ticket_code' => $booking->ticket_code,
                    'transaction' => $booking->paymentTransaction ? [
                        'id' => $booking->paymentTransaction->id,
                        'status' => $booking->paymentTransaction->status,
                        'amount' => $booking->paymentTransaction->amount,
                    ] : null,
                ];
            });

        return Inertia::render('bookings/admin', [
            'classBookings' => $classBookings,
            'facilityBookings' => $facilityBookings,
            'canReviewPayments' => $request->user()->can('payments review'),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }
}
