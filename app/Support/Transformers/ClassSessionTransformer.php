<?php

namespace App\Support\Transformers;

use App\Models\ClassSession;

class ClassSessionTransformer
{
    public static function transform(ClassSession $classSession, bool $includeSchedules = false): array
    {
        $payload = [
            'id' => $classSession->id,
            'class_type_id' => $classSession->class_type_id,
            'trainer_id' => $classSession->trainer_id,
            'capacity' => $classSession->capacity,
            'waitlist_limit' => $classSession->waitlist_limit,
            'allow_guest_booking' => (bool) $classSession->allow_guest_booking,
            'price_per_attendee' => $classSession->price_per_attendee !== null
                ? (float) $classSession->price_per_attendee
                : null,
            'created_at' => optional($classSession->created_at)->toIso8601String(),
            'updated_at' => optional($classSession->updated_at)->toIso8601String(),
            'classType' => $classSession->relationLoaded('classType') && $classSession->classType
                ? [
                    'id' => $classSession->classType->id,
                    'name' => $classSession->classType->name,
                    'description' => $classSession->classType->description,
                ]
                : null,
            'trainer' => $classSession->relationLoaded('trainer') && $classSession->trainer
                ? [
                    'id' => $classSession->trainer->id,
                    'specialty' => $classSession->trainer->specialty,
                    'bio' => $classSession->trainer->bio,
                    'years_experience' => $classSession->trainer->years_experience,
                    'user' => $classSession->trainer->relationLoaded('user') && $classSession->trainer->user
                        ? [
                            'id' => $classSession->trainer->user->id,
                            'name' => $classSession->trainer->user->name,
                            'email' => $classSession->trainer->user->email,
                        ]
                        : null,
                ]
                : null,
        ];

        if ($includeSchedules && $classSession->relationLoaded('schedules')) {
            $payload['schedules'] = $classSession->schedules
                ->map(fn ($schedule) => ScheduleTransformer::transform($schedule, false))
                ->all();
        }

        return $payload;
    }
}
