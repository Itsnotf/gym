<?php

namespace App\Http\Controllers;

use App\Models\TrainerReview;
use App\Models\trainer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TrainerReviewController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('auth'),
            new Middleware('verified'),
        ];
    }

    /**
     * Display trainer reviews page for member
     */
    public function index(): Response
    {
        $user = Auth::user();
        $member = $user?->member;

        if (!$member) {
            abort(403, 'Member profile required.');
        }

        // Get all trainers for review
        $trainersToReview = trainer::with('user')
            ->orderBy('specialty')
            ->get()
            ->map(function (trainer $trainer) use ($member) {
                $review = TrainerReview::where('trainer_id', $trainer->id)
                    ->where('member_id', $member->id)
                    ->first();

                return [
                    'id' => $trainer->id,
                    'name' => $trainer->user?->name,
                    'specialty' => $trainer->specialty,
                    'review' => $review ? [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'would_recommend' => $review->would_recommend,
                        'reviewed_at' => $review->reviewed_at?->toDateString(),
                    ] : null,
                ];
            });

        return Inertia::render('dashboard/trainer-reviews', [
            'trainersToReview' => $trainersToReview,
        ]);
    }

    /**
     * Store a new trainer review
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $member = $user?->member;

        if (!$member) {
            abort(403, 'Member profile required.');
        }

        $validated = $request->validate([
            'trainer_id' => 'required|exists:trainers,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'would_recommend' => 'required|boolean',
        ]);

        TrainerReview::updateOrCreate(
            [
                'trainer_id' => $validated['trainer_id'],
                'member_id' => $member->id,
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'would_recommend' => $validated['would_recommend'],
                'reviewed_at' => now(),
            ]
        );

        return redirect()->route('trainer-reviews.index')
            ->with('success', 'Thank you for rating the trainer!');
    }

    /**
     * Delete a trainer review
     */
    public function destroy(TrainerReview $review): RedirectResponse
    {
        $user = Auth::user();
        $member = $user?->member;

        if (!$member || $review->member_id !== $member->id) {
            abort(403, 'Unauthorized to delete this review.');
        }

        $review->delete();

        return redirect()->route('trainer-reviews.index')
            ->with('success', 'Review deleted successfully.');
    }
}
