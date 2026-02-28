<?php

namespace App\Support\Transformers;

use App\Models\schedule;

class ScheduleTransformer
{
    public static function transform(schedule $schedule, bool $includeClassSession = true): array
    {
        $payload = [
            'id' => $schedule->id,
            'class_session_id' => $schedule->class_session_id,
            'day_of_week' => $schedule->day_of_week,
            'start_time' => $schedule->start_time,
            'end_time' => $schedule->end_time,
            'is_active' => (bool) $schedule->is_active,
            'created_at' => optional($schedule->created_at)->toIso8601String(),
            'updated_at' => optional($schedule->updated_at)->toIso8601String(),
        ];

        if ($includeClassSession && $schedule->relationLoaded('classSession') && $schedule->classSession) {
            $payload['classSession'] = ClassSessionTransformer::transform($schedule->classSession, false);
        }

        return $payload;
    }
}
