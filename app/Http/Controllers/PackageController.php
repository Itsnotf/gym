<?php

namespace App\Http\Controllers;

use App\Http\Requests\PackageRequest\CreatePackageRequest;
use App\Http\Requests\PackageRequest\UpdatePackageRequest;
use App\Models\ClassSession;
use App\Models\Facility;
use App\Models\Package;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:packages index', only: ['index']),
            new Middleware('permission:packages create', only: ['create', 'store']),
            new Middleware('permission:packages edit', only: ['edit', 'update']),
            new Middleware('permission:packages delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $packages = Package::query()
            ->withCount([
                'classSessions',
                'facilities',
                'subscriptions as active_subscriptions_count' => fn ($query) => $query->where('status', Subscription::STATUS_ACTIVE),
            ])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->boolean('show_inactive') === false, fn ($query) => $query->where('is_active', true))
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/packages/index', [
            'packages' => $packages,
            'filters' => $request->only('search', 'show_inactive'),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/packages/create', [
            'classSessions' => $this->classSessionOptions(),
            'facilities' => $this->facilityOptions(),
        ]);
    }

    public function store(CreatePackageRequest $request): RedirectResponse
    {
        $package = Package::create($this->payloadFrom($request));
        $package->classSessions()->sync($request->input('class_session_ids', []));
        $package->facilities()->sync($request->input('facility_ids', []));

        return redirect()
            ->route('admin.packages.index')
            ->with('success', 'Package created successfully.');
    }

    public function edit(Package $package): Response
    {
        $package->load('classSessions:id', 'facilities:id');

        return Inertia::render('admin/packages/edit', [
            'package' => $package,
            'classSessions' => $this->classSessionOptions(),
            'facilities' => $this->facilityOptions(),
            'selectedClassSessionIds' => $package->classSessions->pluck('id')->all(),
            'selectedFacilityIds' => $package->facilities->pluck('id')->all(),
        ]);
    }

    public function update(UpdatePackageRequest $request, Package $package): RedirectResponse
    {
        $package->update($this->payloadFrom($request));
        $package->classSessions()->sync($request->input('class_session_ids', []));
        $package->facilities()->sync($request->input('facility_ids', []));

        return redirect()
            ->route('admin.packages.index')
            ->with('success', 'Package updated successfully.');
    }

    public function destroy(Package $package): RedirectResponse
    {
        $package->delete();

        return redirect()
            ->back()
            ->with('success', 'Package removed.');
    }

    protected function classSessionOptions(): array
    {
        return ClassSession::with(['classType:id,name', 'trainer.user:id,name'])
            ->orderBy('id')
            ->get()
            ->map(fn (ClassSession $session) => [
                'id' => $session->id,
                'label' => $session->classType?->name ?? 'Session #' . $session->id,
                'trainer' => $session->trainer?->user?->name,
            ])
            ->toArray();
    }

    protected function facilityOptions(): array
    {
        return Facility::orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Facility $facility) => [
                'id' => $facility->id,
                'name' => $facility->name,
            ])
            ->toArray();
    }

    protected function payloadFrom($request): array
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active', true);

        return $data;
    }
}
