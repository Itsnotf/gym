<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClassSessionRequest\CreateClassSessionRequest;
use App\Http\Requests\ClassSessionRequest\UpdateClassSessionRequest;
use App\Models\ClassSession;
use App\Models\ClassType;
use App\Models\trainer;
use App\Support\Transformers\ClassSessionTransformer;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ClassSessionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:class_sessions index', only: ['index']),
            new Middleware('permission:class_sessions create', only: ['create', 'store']),
            new Middleware('permission:class_sessions edit', only: ['edit', 'update']),
            new Middleware('permission:class_sessions delete', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $classSessions = ClassSession::whereNotNull('class_type_id')
            ->whereNotNull('trainer_id')
            ->with(['classType', 'trainer' => function ($query) {
                $query->with('user');
            }])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('classType', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('trainer', function ($q) use ($search) {
                    $q->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    });
                });
            })
            ->paginate(8)
            ->withQueryString();

        $classSessions->getCollection()->transform(
            fn (ClassSession $session) => ClassSessionTransformer::transform($session)
        );

        return inertia('class-sessions/index', [
            'classSessions' => $classSessions,
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
        $classTypes = ClassType::all();
        $trainers = trainer::with('user')->get();
        return Inertia::render("class-sessions/create", [
            "classTypes" => $classTypes,
            "trainers" => $trainers
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateClassSessionRequest $request)
    {
        ClassSession::create([
            "class_type_id" => $request->class_type_id,
            "trainer_id" => $request->trainer_id,
            "capacity" => $request->capacity,
            "waitlist_limit" => $request->waitlist_limit,
            "allow_guest_booking" => $request->boolean('allow_guest_booking'),
        ]);

        return redirect()->route("class-sessions.index")->with("success", "Class Session created successfully");
    }

    /**
     * Display the specified resource.
     */
    public function show(ClassSession $classSession)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClassSession $classSession)
    {
        $classTypes = ClassType::all();
        $trainers = trainer::with('user')->get();
        return Inertia::render("class-sessions/edit", [
            "classSession" => $classSession->load('classType', 'trainer.user'),
            "classTypes" => $classTypes,
            "trainers" => $trainers
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClassSessionRequest $request, ClassSession $classSession)
    {
        $classSession->update([
            "class_type_id" => $request->class_type_id,
            "trainer_id" => $request->trainer_id,
            "capacity" => $request->capacity,
            "waitlist_limit" => $request->waitlist_limit,
            "allow_guest_booking" => $request->boolean('allow_guest_booking'),
        ]);

        return redirect()->route("class-sessions.index")->with("success", "Class Session updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassSession $classSession)
    {
        $classSession->delete();
        return redirect()->route("class-sessions.index")->with("success", "Class Session deleted successfully");
    }
}
