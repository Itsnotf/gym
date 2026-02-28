import AppLayout from '@/layouts/app-layout';
import { Head, Form } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';

interface ClassBooking {
    id: number;
    session_date: string;
    status: string;
    payment_status: string;
    ticket_code: string;
    attendees_count: number;
    classSession: {
        classType: {
            name: string;
        };
    };
    schedule: {
        day_of_week: string;
        start_time: string;
        end_time: string;
    };
}

interface FacilityBooking {
    id: number;
    start_at: string;
    end_at: string;
    status: string;
    payment_status: string;
    ticket_code: string;
    attendees_count: number;
    facility: {
        name: string;
    };
}

interface Props {
    classBookings: ClassBooking[];
    facilityBookings: FacilityBooking[];
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Bookings', href: '/my/bookings' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    confirmed: 'default',
    waitlisted: 'secondary',
    cancelled: 'outline',
};

export default function MemberBookingsPage({ classBookings, facilityBookings, flash }: Props) {
    const [shownMessages] = useState(new Set());

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />
            <div className="space-y-10 p-4">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <header className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Class bookings</p>
                            <p className="text-xs text-slate-500">Track upcoming sessions and manage cancellations.</p>
                        </div>
                    </header>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Attendees</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                                        No class bookings yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classBookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.classSession.classType.name}</TableCell>
                                        <TableCell>
                                            <p className="text-sm">
                                                {booking.schedule.day_of_week} ({booking.schedule.start_time} - {booking.schedule.end_time})
                                            </p>
                                            <p className="text-xs text-slate-500">Ticket {booking.ticket_code}</p>
                                        </TableCell>
                                        <TableCell>{new Date(booking.session_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[booking.status] ?? 'outline'} className="capitalize">
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{booking.attendees_count}</TableCell>
                                        <TableCell>
                                            {booking.status !== 'cancelled' && (
                                                <Form method="post" action={`/my/bookings/classes/${booking.id}/cancel`}>
                                                    {({ processing, errors }) => (
                                                        <>
                                                            <input type="hidden" name="_method" value="patch" />
                                                            <Button variant="outline" size="sm" disabled={processing}>
                                                                Cancel
                                                            </Button>
                                                            <InputError message={errors.general} />
                                                        </>
                                                    )}
                                                </Form>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <header className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Facility bookings</p>
                            <p className="text-xs text-slate-500">Manage your facility slots and waitlist positions.</p>
                        </div>
                    </header>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Facility</TableHead>
                                <TableHead>Window</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Attendees</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {facilityBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                                        No facility bookings yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                facilityBookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.facility.name}</TableCell>
                                        <TableCell>
                                            <p className="text-sm">
                                                {new Date(booking.start_at).toLocaleString()} - {new Date(booking.end_at).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-500">Ticket {booking.ticket_code}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[booking.status] ?? 'outline'} className="capitalize">
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{booking.attendees_count}</TableCell>
                                        <TableCell>
                                            {booking.status !== 'cancelled' && (
                                                <Form method="post" action={`/my/bookings/facilities/${booking.id}/cancel`}>
                                                    {({ processing, errors }) => (
                                                        <>
                                                            <input type="hidden" name="_method" value="patch" />
                                                            <Button variant="outline" size="sm" disabled={processing}>
                                                                Cancel
                                                            </Button>
                                                            <InputError message={errors.general} />
                                                        </>
                                                    )}
                                                </Form>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </section>
            </div>
        </AppLayout>
    );
}
