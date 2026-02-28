<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrainerRequest\CreateTrainerRequest;
use App\Http\Requests\TrainerRequest\UpdateTrainerRequest;
use App\Models\trainer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class TrainerController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:trainers index', only: ['index']),
            new Middleware('permission:trainers create', only: ['create', 'store']),
            new Middleware('permission:trainers edit', only: ['edit', 'update']),
            new Middleware('permission:trainers delete', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $trainers = trainer::with('user')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('specialty', 'like', "%{$search}%");
            })
            ->paginate(8)
            ->withQueryString();

        return inertia('trainers/index', [
            'trainers' => $trainers,
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
        $users = User::whereDoesntHave('trainer')->get();
        return Inertia::render("trainers/create", [
            "users" => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateTrainerRequest $request)
    {
        trainer::create([
            "user_id" => $request->user_id,
            "specialty" => $request->specialty,
        ]);

        return redirect()->route("trainers.index")->with("success", "Trainer created successfully");
    }

    /**
     * Display the specified resource.
     */
    public function show(trainer $trainer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(trainer $trainer)
    {
        $users = User::where('id', '!=', $trainer->user_id)->whereDoesntHave('trainer')->get();
        return Inertia::render("trainers/edit", [
            "trainer" => $trainer->load('user'),
            "users" => $users
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTrainerRequest $request, trainer $trainer)
    {
        $trainer->update([
            "user_id" => $request->user_id,
            "specialty" => $request->specialty,
        ]);

        return redirect()->route("trainers.index")->with("success", "Trainer updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(trainer $trainer)
    {
        $trainer->delete();
        return redirect()->route("trainers.index")->with("success", "Trainer deleted successfully");
    }
}
