<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\Facility;
use App\Support\Transformers\ClassSessionTransformer;
use Inertia\Inertia;
use Inertia\Response;

class PublicBookingController extends Controller
{
    public function classes(): Response
    {
        $classSessions = ClassSession::with([
            'classType',
            'trainer.user',
            'schedules' => fn ($query) => $query->where('is_active', true),
        ])->get()->map(
            fn (ClassSession $session) => ClassSessionTransformer::transform($session, true)
        );

        return Inertia::render('public/classes/index', [
            'classSessions' => $classSessions,
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function facilities(): Response
    {
        $facilities = Facility::where('is_active', true)->get();

        return Inertia::render('public/facilities/index', [
            'facilities' => $facilities,
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }
}
