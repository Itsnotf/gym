<?php

namespace App\Http\Controllers;

use App\Http\Requests\MemberRequest\CreateMemberRequest;
use App\Http\Requests\MemberRequest\UpdateMemberRequest;
use App\Models\member;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class MemberController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:members index', only: ['index']),
            new Middleware('permission:members create', only: ['create', 'store']),
            new Middleware('permission:members edit', only: ['edit', 'update']),
            new Middleware('permission:members delete', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $members = member::with('user')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->paginate(8)
            ->withQueryString();

        return inertia('members/index', [
            'members' => $members,
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
        $users = User::whereDoesntHave('member')->get();
        return Inertia::render("members/create", [
            "users" => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateMemberRequest $request)
    {
        member::create([
            "user_id" => $request->user_id,
        ]);

        return redirect()->route("members.index")->with("success", "Member created successfully");
    }

    /**
     * Display the specified resource.
     */
    public function show(member $member)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(member $member)
    {
        $users = User::where('id', '!=', $member->user_id)->whereDoesntHave('member')->get();
        return Inertia::render("members/edit", [
            "member" => $member->load('user'),
            "users" => $users
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMemberRequest $request, member $member)
    {
        $member->update([
            "user_id" => $request->user_id,
        ]);

        return redirect()->route("members.index")->with("success", "Member updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(member $member)
    {
        $member->delete();
        return redirect()->route("members.index")->with("success", "Member deleted successfully");
    }
}
