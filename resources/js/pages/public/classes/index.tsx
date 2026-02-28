import { Form, Head, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { SharedData } from '@/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ScheduleData {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
}

interface ClassSessionData {
    id: number;
    capacity: number;
    waitlist_limit: number;
    allow_guest_booking: boolean;
    classType: {
        name: string;
        description: string;
    };
    trainer: {
        user: {
            name: string;
        };
    };
    schedules: ScheduleData[];
}

interface Props {
    classSessions: ClassSessionData[];
    flash?: {
        success?: string;
    };
}

export default function PublicClassesPage({ classSessions, flash }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [shownMessages] = useState(new Set());

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const today = new Date().toISOString().split('T')[0];

    return (
        <PublicLayout>
            <Head title="Book a Class" />
            <div className="mb-12">
                <p className="text-sm uppercase tracking-[0.3em] text-orange-600">Booking</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
                    Reserve your next class
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-600">
                    Browse active classes, reserve a spot, or join the waitlist when sessions reach capacity.
                </p>
            </div>

            <div className="grid gap-8">
                {classSessions.map((session) => {
                    const guestDisabled = !auth.user && !session.allow_guest_booking;
                    return (
                    <section key={session.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-dashed border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                                    {session.classType.name}
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                                    Led by {session.trainer.user.name}
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">{session.classType.description}</p>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capacity</p>
                                    <p className="text-2xl font-semibold text-slate-900">{session.capacity}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Waitlist</p>
                                    <p className="text-2xl font-semibold text-slate-900">{session.waitlist_limit}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
                            <div>
                                <p className="text-sm font-medium text-slate-700">Weekly Schedule</p>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {session.schedules.map((schedule) => (
                                        <div key={schedule.id} className="rounded-2xl border border-slate-200 p-4">
                                            <p className="text-sm font-semibold text-slate-900">{schedule.day_of_week}</p>
                                            <p className="text-sm text-slate-500">
                                                {schedule.start_time} - {schedule.end_time}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-4">
                                <p className="text-sm font-semibold text-slate-900">Reserve a spot</p>
                                <Form method="post" action="/bookings/classes" className="mt-4 space-y-3">
                                    {({ processing, errors }) => (
                                        <>
                                            <input type="hidden" name="class_session_id" value={session.id} />
                                            <div className="grid gap-1">
                                                <Label htmlFor={`schedule-${session.id}`}>Select schedule</Label>
                                                <Select name="schedule_id">
                                                    <SelectTrigger id={`schedule-${session.id}`}>
                                                        <SelectValue placeholder="Choose a schedule" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {session.schedules.map((schedule) => (
                                                            <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                                {schedule.day_of_week} ({schedule.start_time} - {schedule.end_time})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.schedule_id} />
                                            </div>

                                            <div className="grid gap-1">
                                                <Label htmlFor={`session_date-${session.id}`}>Preferred date</Label>
                                                <Input
                                                    id={`session_date-${session.id}`}
                                                    type="date"
                                                    name="session_date"
                                                    min={today}
                                                />
                                                <InputError message={errors.session_date} />
                                                <p className="text-xs text-slate-500">
                                                    Choose a date that matches the selected day of week.
                                                </p>
                                            </div>

                                            <div className="grid gap-1">
                                                <Label htmlFor={`attendees-${session.id}`}>Attendees</Label>
                                                <Input
                                                    id={`attendees-${session.id}`}
                                                    type="number"
                                                    min={1}
                                                    max={6}
                                                    name="attendees_count"
                                                    defaultValue={1}
                                                />
                                                <InputError message={errors.attendees_count} />
                                            </div>

                                            <div className="grid gap-1">
                                                <Label>Payment method</Label>
                                                <Select name="payment_method" defaultValue="cash">
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cash">Cash</SelectItem>
                                                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.payment_method} />
                                            </div>

                                            {!auth.user && (
                                                <div className="grid gap-3">
                                                    <div className="grid gap-1">
                                                        <Label htmlFor={`guest_name-${session.id}`}>Full name</Label>
                                                        <Input id={`guest_name-${session.id}`} name="guest_name" />
                                                        <InputError message={errors.guest_name} />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <Label htmlFor={`guest_email-${session.id}`}>Email</Label>
                                                        <Input id={`guest_email-${session.id}`} name="guest_email" type="email" />
                                                        <InputError message={errors.guest_email} />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <Label htmlFor={`guest_phone-${session.id}`}>Phone</Label>
                                                        <Input id={`guest_phone-${session.id}`} name="guest_phone" />
                                                        <InputError message={errors.guest_phone} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid gap-1">
                                                <Label htmlFor={`notes-${session.id}`}>Notes</Label>
                                                <Input id={`notes-${session.id}`} name="notes" placeholder="Add special requests" />
                                                <InputError message={errors.notes} />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={processing || guestDisabled}
                                            >
                                                {guestDisabled ? 'Members only' : processing ? 'Booking...' : 'Submit booking'}
                                            </Button>
                                            {!session.allow_guest_booking && (
                                                <p className="text-xs text-rose-500">Only logged-in members can join this class.</p>
                                            )}
                                        </>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </section>
                    );
                })}
            </div>
        </PublicLayout>
    );
}
