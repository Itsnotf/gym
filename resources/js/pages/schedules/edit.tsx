import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, Form } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Checkbox,
} from "@/components/ui/checkbox";

interface ClassType {
    id: number;
    name: string;
}

interface TrainerUser {
    name?: string | null;
}

interface Trainer {
    id: number;
    user?: TrainerUser | null;
}

interface ClassSessionData {
    id: number;
    classType?: ClassType | null;
    trainer?: Trainer | null;
}

interface ScheduleData {
    id: number;
    class_session_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    classSession: ClassSessionData;
}

interface Props {
    schedule: ScheduleData;
    classSessions: ClassSessionData[];
    daysOfWeek: string[];
}

export default function ScheduleEditPage({ schedule, classSessions, daysOfWeek }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Schedules',
            href: '/schedules',
        },
        {
            title: 'Edit',
            href: `/schedules/${schedule.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Schedule" />
            <Form
                method="put"
                action={`/schedules/${schedule.id}`}
                resetOnSuccess={true}
                className="flex flex-col gap-6 p-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="class_session_id">Class Session</Label>
                                <Select name="class_session_id" defaultValue={schedule.class_session_id.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a class session" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classSessions.map((session) => {
                                            const classLabel = session.classType?.name ?? `Session #${session.id}`;
                                            const trainerLabel = session.trainer?.user?.name ?? 'Unassigned trainer';

                                            return (
                                                <SelectItem key={session.id} value={session.id.toString()}>
                                                    {classLabel} - {trainerLabel}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.class_session_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="day_of_week">Day of Week</Label>
                                <Select name="day_of_week" defaultValue={schedule.day_of_week}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daysOfWeek.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.day_of_week}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    required
                                    name="start_time"
                                    defaultValue={schedule.start_time}
                                />
                                <InputError
                                    message={errors.start_time}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    required
                                    name="end_time"
                                    defaultValue={schedule.end_time}
                                />
                                <InputError
                                    message={errors.end_time}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="is_active" name="is_active" value="1" defaultChecked={schedule.is_active} />
                                    <Label htmlFor="is_active" className="cursor-pointer">Is Active</Label>
                                </div>
                                <InputError
                                    message={errors.is_active}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Update Schedule
                            </Button>
                            <Link href="/schedules">
                                <Button variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </AppLayout>
    );
}
