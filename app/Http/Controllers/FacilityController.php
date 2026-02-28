<?php

namespace App\Http\Controllers;

use App\Http\Requests\FacilityRequest\CreateFacilityRequest;
use App\Http\Requests\FacilityRequest\UpdateFacilityRequest;
use App\Models\Facility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:facilities index', only: ['index']),
            new Middleware('permission:facilities create', only: ['create', 'store']),
            new Middleware('permission:facilities edit', only: ['edit', 'update']),
            new Middleware('permission:facilities delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $facilities = Facility::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/facilities/index', [
            'facilities' => $facilities,
            'filters' => $request->only('search'),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/facilities/create');
    }

    public function store(CreateFacilityRequest $request): RedirectResponse
    {
        Facility::create($this->payloadFrom($request));

        return redirect()
            ->route('admin.facilities.index')
            ->with('success', 'Facility added successfully.');
    }

    public function edit(Facility $facility): Response
    {
        return Inertia::render('admin/facilities/edit', [
            'facility' => $facility,
        ]);
    }

    public function update(UpdateFacilityRequest $request, Facility $facility): RedirectResponse
    {
        $facility->update($this->payloadFrom($request));

        return redirect()
            ->route('admin.facilities.index')
            ->with('success', 'Facility updated successfully.');
    }

    public function destroy(Facility $facility): RedirectResponse
    {
        $facility->delete();

        return redirect()
            ->back()
            ->with('success', 'Facility removed.');
    }

    protected function payloadFrom(FormRequest $request): array
    {
        $data = $request->validated();
        $data['requires_membership'] = $request->boolean('requires_membership');
        $data['is_active'] = $request->boolean('is_active');

        return $data;
    }
}
