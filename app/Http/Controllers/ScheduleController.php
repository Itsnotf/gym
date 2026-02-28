<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScheduleRequest\CreateScheduleRequest;
use App\Http\Requests\ScheduleRequest\UpdateScheduleRequest;
use App\Models\schedule;
use App\Models\ClassSession;
use App\Support\Transformers\ClassSessionTransformer;
use App\Support\Transformers\ScheduleTransformer;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ScheduleController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:schedules index', only: ['index']),
            new Middleware('permission:schedules create', only: ['create', 'store']),
            new Middleware('permission:schedules edit', only: ['edit', 'update']),
            new Middleware('permission:schedules delete', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $schedules = schedule::with('classSession.classType', 'classSession.trainer.user')
            ->when($request->search, function ($query, $search) {
                $query->where('day_of_week', 'like', "%{$search}%")
                    ->orWhere('start_time', 'like', "%{$search}%")
                    ->orWhereHas('classSession.classType', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->paginate(8)
            ->withQueryString();

        $schedules->getCollection()->transform(
            fn (schedule $schedule) => ScheduleTransformer::transform($schedule)
        );

        return inertia('schedules/index', [
            'schedules' => $schedules,
            'filters' => $request->only('search'),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $classSessions = ClassSession::with('classType', 'trainer.user')
            ->get()
            ->map(fn (ClassSession $session) => ClassSessionTransformer::transform($session));
        $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return Inertia::render("schedules/create", [
            "classSessions" => $classSessions,
            "daysOfWeek" => $daysOfWeek
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateScheduleRequest $request)
    {
        schedule::create([
            "class_session_id" => $request->class_session_id,
            "day_of_week" => $request->day_of_week,
            "start_time" => $request->start_time,
            "end_time" => $request->end_time,
            "is_active" => $request->is_active,
        ]);

        return redirect()->route("schedules.index")->with("success", "Schedule created successfully");
    }

    /**
     * Display the specified resource.
     */
    public function show(schedule $schedule)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(schedule $schedule)
    {
        $classSessions = ClassSession::with('classType', 'trainer.user')
            ->get()
            ->map(fn (ClassSession $session) => ClassSessionTransformer::transform($session));
        $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $schedule->load('classSession.classType', 'classSession.trainer.user');

        return Inertia::render("schedules/edit", [
            "schedule" => ScheduleTransformer::transform($schedule),
            "classSessions" => $classSessions,
            "daysOfWeek" => $daysOfWeek
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateScheduleRequest $request, schedule $schedule)
    {
        $schedule->update([
            "class_session_id" => $request->class_session_id,
            "day_of_week" => $request->day_of_week,
            "start_time" => $request->start_time,
            "end_time" => $request->end_time,
            "is_active" => $request->is_active,
        ]);

        return redirect()->route("schedules.index")->with("success", "Schedule updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(schedule $schedule)
    {
        $schedule->delete();
        return redirect()->route("schedules.index")->with("success", "Schedule deleted successfully");
    }
}
