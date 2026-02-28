<?php

namespace App\Http\Controllers;

use App\Models\ClassBooking;
use App\Models\FacilityBooking;
use App\Models\TrainerReview;
use App\Models\member;
use App\Models\trainer;
use App\Models\schedule;
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
        ]);
    }

    protected function trainerDashboard(trainer $trainer): Response
    {
        $trainer->loadMissing(['user']);

        $upcomingClasses = ClassBooking::with(['user', 'classSession.classType'])
            ->whereHas('classSession', fn ($query) => $query->where('trainer_id', $trainer->id))
            ->whereDate('session_date', '>=', Carbon::today())
            ->orderBy('session_date')
            ->take(5)
            ->get()
            ->map(function (ClassBooking $booking) {
                return [
                    'id' => $booking->id,
                    'member' => $booking->user?->name,
                    'class' => optional($booking->classSession?->classType)->name,
                    'session_date' => optional($booking->session_date)->toDateString(),
                    'status' => $booking->status,
                ];
            });

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

        $recentReviews = $trainer->trainerReviews()
            ->with(['member.user'])
            ->latest('reviewed_at')
            ->take(5)
            ->get()
            ->map(function (TrainerReview $review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'member' => $review->member?->user?->name,
                    'reviewed_at' => optional($review->reviewed_at)->toDateTimeString(),
                ];
            });

        $recentAttendance = $trainer->attendanceLogs()
            ->with(['member.user'])
            ->latest('scheduled_for')
            ->take(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'member' => $log->member?->user?->name,
                    'status' => $log->status,
                    'scheduled_for' => optional($log->scheduled_for)->toDateTimeString(),
                ];
            });

        return Inertia::render('dashboard/trainer', [
            'trainer' => [
                'name' => $trainer->user?->name,
                'specialty' => $trainer->specialty,
                'bio' => $trainer->bio,
                'rating_average' => (float) $trainer->rating_average,
                'rating_count' => (int) $trainer->rating_count,
                'sessions_led' => (int) $trainer->sessions_led,
                'active_members' => (int) $trainer->active_members,
                'last_session_at' => optional($trainer->last_session_at)->toDateTimeString(),
            ],
            'upcomingClasses' => $upcomingClasses,
            'activeSchedules' => $activeSchedules,
            'recentReviews' => $recentReviews,
            'recentAttendanceLogs' => $recentAttendance,
        ]);
    }

    protected function adminDashboard(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'members' => member::count(),
                'trainers' => trainer::count(),
                'class_bookings' => ClassBooking::count(),
                'facility_bookings' => FacilityBooking::count(),
            ],
        ]);
    }
}
