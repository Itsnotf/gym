<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:subscriptions review'),
        ];
    }

    public function index(Request $request): Response
    {
        $subscriptions = Subscription::with(['member.user:id,name', 'package:id,name,duration_days', 'paymentTransaction'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->whereHas('member.user', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('package', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                        ->orWhere('reference', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => $request->only('search', 'status'),
            'statusOptions' => [
                Subscription::STATUS_PENDING,
                Subscription::STATUS_ACTIVE,
                Subscription::STATUS_EXPIRED,
                Subscription::STATUS_CANCELLED,
            ],
        ]);
    }
}
