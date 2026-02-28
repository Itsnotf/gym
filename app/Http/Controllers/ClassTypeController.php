<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClassTypeRequest\CreateClassTypeRequest;
use App\Http\Requests\ClassTypeRequest\UpdateClassTypeRequest;
use App\Models\ClassType;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ClassTypeController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:class_types index', only: ['index']),
            new Middleware('permission:class_types create', only: ['create', 'store']),
            new Middleware('permission:class_types edit', only: ['edit', 'update']),
            new Middleware('permission:class_types delete', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $classTypes = ClassType::when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->paginate(8)
            ->withQueryString();

        return inertia('class-types/index', [
            'classTypes' => $classTypes,
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
        return Inertia::render("class-types/create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateClassTypeRequest $request)
    {
        ClassType::create([
            "name" => $request->name,
            "description" => $request->description,
        ]);

        return redirect()->route("class-types.index")->with("success", "Class Type created successfully");
    }

    /**
     * Display the specified resource.
     */
    public function show(ClassType $classType)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClassType $classType)
    {
        return Inertia::render("class-types/edit", [
            "classType" => $classType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClassTypeRequest $request, ClassType $classType)
    {
        $classType->update($request->all());

        return redirect()->route("class-types.index")->with("success", "Class Type updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassType $classType)
    {
        $classType->delete();
        return redirect()->route("class-types.index")->with("success", "Class Type deleted successfully");
    }
}
