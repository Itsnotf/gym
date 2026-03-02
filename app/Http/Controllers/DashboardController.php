<?php

namespace App\Http\Controllers;

use App\Models\ClassBooking;
use App\Models\FacilityBooking;
use App\Models\TrainerReview;
use App\Models\member;
use App\Models\trainer;
use App\Models\schedule;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->loadMissing(['member.user', 'trainer.user']);

        if ($user->hasRole('trainer') && $user->trainer) {
            return $this->trainerDashboard($user->trainer);
        }

        if ($user->hasRole('user') && $user->member) {
            return $this->memberDashboard($user->member);
        }

        return $this->adminDashboard();
    }

    protected function memberDashboard(member $member): Response
    {
        $member->loadMissing(['user']);

        $attendanceCounts = $member->attendanceLogs()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $upcomingClassBookings = ClassBooking::with([
            'classSession.classType',
            'schedule',
        ])
            ->where('user_id', $member->user_id)
            ->whereDate('session_date', '>=', Carbon::today())
            ->orderBy('session_date')
            ->take(5)
            ->get()
            ->map(function (ClassBooking $booking) {
                return [
                    'id' => $booking->id,
                    'class' => optional($booking->classSession?->classType)->name,
                    'session_date' => optional($booking->session_date)->toDateString(),
                    'status' => $booking->status,
                    'ticket_code' => $booking->ticket_code,
                    'schedule' => $booking->schedule ? [
                        'day' => $booking->schedule->day_of_week,
                        'start_time' => $booking->schedule->start_time,
                        'end_time' => $booking->schedule->end_time,
                    ] : null,
                ];
            });

        $upcomingFacilityBookings = FacilityBooking::with('facility')
            ->where('user_id', $member->user_id)
            ->where('start_at', '>=', Carbon::now())
            ->orderBy('start_at')
            ->take(5)
            ->get()
            ->map(function (FacilityBooking $booking) {
                return [
                    'id' => $booking->id,
                    'facility' => $booking->facility?->name,
                    'start_at' => optional($booking->start_at)->toDateTimeString(),
                    'end_at' => optional($booking->end_at)->toDateTimeString(),
                    'status' => $booking->status,
                    'ticket_code' => $booking->ticket_code,
                ];
            });

        $recentAttendance = $member->attendanceLogs()
            ->with(['trainer.user'])
            ->latest('scheduled_for')
            ->take(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'status' => $log->status,
                    'scheduled_for' => optional($log->scheduled_for)->toDateTimeString(),
                    'trainer' => $log->trainer?->user?->name,
                    'notes' => $log->notes,
                ];
            });

        // Get weekly schedule for active subscriptions
        $activeSubscription = Subscription::where('member_id', $member->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->latest('expires_at')
            ->first();

        $weeklySchedules = [];
        if ($activeSubscription && $activeSubscription->package) {
            $classSessionIds = $activeSubscription->package
                ->classSessions()
                ->pluck('class_sessions.id');

            $weeklySchedules = schedule::with(['classSession.classType', 'classSession.trainer.user'])
                ->whereIn('class_session_id', $classSessionIds)
                ->where('is_active', true)
                ->orderBy('day_of_week')
                ->get()
                ->map(function (schedule $schedule) {
                    return [
                        'id' => $schedule->id,
                        'class' => optional($schedule->classSession?->classType)->name,
                        'trainer' => $schedule->classSession?->trainer?->user?->name,
                        'day' => $schedule->day_of_week,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                    ];
                });
        }

        return Inertia::render('dashboard/member', [
            'membership' => [
                'plan' => $member->membership_plan,
                'status' => $member->membership_status,
                'starts_at' => optional($member->membership_starts_at)->toDateString(),
                'expires_at' => optional($member->membership_expires_at)->toDateString(),
                'auto_renew' => (bool) $member->auto_renew,
                'progress' => (float) $member->membership_progress,
            ],
            'attendanceSummary' => [
                'scheduled' => (int) ($attendanceCounts['scheduled'] ?? 0),
                'waitlisted' => (int) ($attendanceCounts['waitlisted'] ?? 0),
                'attended' => (int) ($attendanceCounts['attended'] ?? 0),
                'missed' => (int) ($attendanceCounts['missed'] ?? 0),
            ],
            'upcomingClassBookings' => $upcomingClassBookings,
            'upcomingFacilityBookings' => $upcomingFacilityBookings,
            'recentAttendanceLogs' => $recentAttendance,
            'weeklySchedules' => $weeklySchedules,
        ]);
    }

    protected function trainerDashboard(trainer $trainer): Response
    {
        $trainer->loadMissing(['user']);

        $activeSchedules = schedule::with('classSession.classType')
            ->whereHas('classSession', fn ($query) => $query->where('trainer_id', $trainer->id))
            ->where('is_active', true)
            ->orderBy('day_of_week')
            ->get()
            ->map(function (schedule $schedule) {
                return [
                    'id' => $schedule->id,
                    'class' => optional($schedule->classSession?->classType)->name,
                    'day' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                ];
            });

        $allReviews = $trainer->trainerReviews()
            ->with(['member.user'])
            ->latest('reviewed_at')
            ->get()
            ->map(function (TrainerReview $review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'member' => $review->member?->user?->name,
                    'reviewed_at' => optional($review->reviewed_at)->toDateString(),
                ];
            });

        return Inertia::render('dashboard/trainer', [
            'trainer' => [
                'name' => $trainer->user?->name,
                'specialty' => $trainer->specialty,
                'rating_average' => (float) $trainer->rating_average,
                'rating_count' => (int) $trainer->rating_count,
            ],
            'activeSchedules' => $activeSchedules,
            'allReviews' => $allReviews,
        ]);
    }

    protected function adminDashboard(): Response
    {
        // Revenue statistics
        $totalRevenue = ClassBooking::where('payment_status', 'confirmed')
            ->sum('total_amount') + FacilityBooking::where('payment_status', 'confirmed')
            ->sum('total_amount');

        // Recent bookings (class + facility combined)
        $recentClassBookings = ClassBooking::with(['classSession.classType', 'schedule'])
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(function (ClassBooking $booking) {
                return [
                    'id' => $booking->id,
                    'type' => 'class',
                    'name' => optional($booking->classSession?->classType)->name,
                    'date' => $booking->session_date,
                    'total_amount' => $booking->total_amount,
                    'payment_status' => $booking->payment_status,
                    'payment_method' => $booking->payment_method,
                    'payment_proof' => $booking->payment_proof,
                    'created_at' => $booking->created_at,
                ];
            });

        $recentFacilityBookings = FacilityBooking::with('facility')
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(function (FacilityBooking $booking) {
                return [
                    'id' => $booking->id,
                    'type' => 'facility',
                    'name' => $booking->facility?->name,
                    'date' => $booking->start_at,
                    'total_amount' => $booking->total_amount,
                    'payment_status' => $booking->payment_status,
                    'payment_method' => $booking->payment_method,
                    'payment_proof' => $booking->payment_proof,
                    'created_at' => $booking->created_at,
                ];
            });

        $recentBookings = collect($recentClassBookings)->merge($recentFacilityBookings)
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->toArray();

        // Booking statistics by month (last 6 months)
        $bookingsByMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $classCount = ClassBooking::whereMonth('created_at', $monthDate->month)
                ->whereYear('created_at', $monthDate->year)
                ->count();
            $facilityCount = FacilityBooking::whereMonth('created_at', $monthDate->month)
                ->whereYear('created_at', $monthDate->year)
                ->count();

            $bookingsByMonth[] = [
                'month' => $monthDate->format('M'),
                'class_bookings' => $classCount,
                'facility_bookings' => $facilityCount,
                'total' => $classCount + $facilityCount,
            ];
        }

        // Revenue by payment method
        $revenueByPayment = [
            [
                'name' => 'Transfer',
                'class_revenue' => ClassBooking::where('payment_method', 'transfer')
                    ->where('payment_status', 'confirmed')
                    ->sum('total_amount'),
                'facility_revenue' => FacilityBooking::where('payment_method', 'transfer')
                    ->where('payment_status', 'confirmed')
                    ->sum('total_amount'),
            ],
            [
                'name' => 'Cash',
                'class_revenue' => ClassBooking::where('payment_method', 'cash')
                    ->where('payment_status', 'confirmed')
                    ->sum('total_amount'),
                'facility_revenue' => FacilityBooking::where('payment_method', 'cash')
                    ->where('payment_status', 'confirmed')
                    ->sum('total_amount'),
            ],
        ];

        // Payment status distribution
        $paymentStatus = [
            [
                'name' => 'Pending',
                'value' => ClassBooking::where('payment_status', 'pending')->count()
                    + FacilityBooking::where('payment_status', 'pending')->count(),
            ],
            [
                'name' => 'Confirmed',
                'value' => ClassBooking::where('payment_status', 'confirmed')->count()
                    + FacilityBooking::where('payment_status', 'confirmed')->count(),
            ],
            [
                'name' => 'Cancelled',
                'value' => ClassBooking::where('payment_status', 'cancelled')->count()
                    + FacilityBooking::where('payment_status', 'cancelled')->count(),
            ],
        ];

        // Active subscriptions
        $activeSubscriptions = Subscription::where('status', 'active')->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'members' => member::count(),
                'trainers' => trainer::count(),
                'class_bookings' => ClassBooking::count(),
                'facility_bookings' => FacilityBooking::count(),
                'total_revenue' => (float) $totalRevenue,
                'active_subscriptions' => $activeSubscriptions,
            ],
            'bookingsByMonth' => $bookingsByMonth,
            'revenueByPayment' => $revenueByPayment,
            'paymentStatusDistribution' => $paymentStatus,
            'recentBookings' => $recentBookings,
        ]);
    }
}
