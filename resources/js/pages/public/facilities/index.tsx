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

interface Facility {
    id: number;
    name: string;
    description?: string;
    capacity: number;
    waitlist_limit: number;
    requires_membership: boolean;
}

interface Props {
    facilities: Facility[];
    flash?: {
        success?: string;
    };
}

export default function PublicFacilitiesPage({ facilities, flash }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [shownMessages] = useState(new Set());

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const now = new Date().toISOString().slice(0, 16);

    return (
        <PublicLayout>
            <Head title="Book Facilities" />
            <div className="mb-12">
                <p className="text-sm uppercase tracking-[0.3em] text-orange-600">Facilities</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
                    Secure a facility slot
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-600">
                    Choose a training zone, pick a time range, and confirm your visit. We will notify you if you move off the waitlist.
                </p>
            </div>

            <div className="grid gap-8">
                {facilities.map((facility) => {
                    const membershipOnly = facility.requires_membership && !auth.user;
                    return (
                        <section key={facility.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 border-b border-dashed border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900">{facility.name}</h2>
                                    <p className="mt-2 text-sm text-slate-600">{facility.description}</p>
                                </div>
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capacity</p>
                                        <p className="text-2xl font-semibold text-slate-900">{facility.capacity}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Waitlist</p>
                                        <p className="text-2xl font-semibold text-slate-900">{facility.waitlist_limit}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                                <p className="text-sm font-semibold text-slate-900">Reserve this facility</p>
                                <Form method="post" action="/bookings/facilities" className="mt-4 space-y-3">
                                    {({ processing, errors }) => (
                                        <>
                                            <input type="hidden" name="facility_id" value={facility.id} />
                                            <div className="grid gap-1">
                                                <Label htmlFor={`start-${facility.id}`}>Start time</Label>
                                                <Input
                                                    id={`start-${facility.id}`}
                                                    type="datetime-local"
                                                    name="start_at"
                                                    min={now}
                                                />
                                                <InputError message={errors.start_at} />
                                            </div>

                                            <div className="grid gap-1">
                                                <Label htmlFor={`end-${facility.id}`}>End time</Label>
                                                <Input
                                                    id={`end-${facility.id}`}
                                                    type="datetime-local"
                                                    name="end_at"
                                                    min={now}
                                                />
                                                <InputError message={errors.end_at} />
                                            </div>

                                            <div className="grid gap-1">
                                                <Label htmlFor={`attendees-${facility.id}`}>Attendees</Label>
                                                <Input
                                                    id={`attendees-${facility.id}`}
                                                    type="number"
                                                    name="attendees_count"
                                                    min={1}
                                                    max={10}
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
                                                        <Label htmlFor={`guest_name-${facility.id}`}>Full name</Label>
                                                        <Input id={`guest_name-${facility.id}`} name="guest_name" />
                                                        <InputError message={errors.guest_name} />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <Label htmlFor={`guest_email-${facility.id}`}>Email</Label>
                                                        <Input id={`guest_email-${facility.id}`} name="guest_email" type="email" />
                                                        <InputError message={errors.guest_email} />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <Label htmlFor={`guest_phone-${facility.id}`}>Phone</Label>
                                                        <Input id={`guest_phone-${facility.id}`} name="guest_phone" />
                                                        <InputError message={errors.guest_phone} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid gap-1">
                                                <Label htmlFor={`notes-${facility.id}`}>Notes</Label>
                                                <Input id={`notes-${facility.id}`} name="notes" placeholder="Preferred lane, trainer, etc." />
                                                <InputError message={errors.notes} />
                                            </div>

                                            <Button type="submit" className="w-full" disabled={processing || membershipOnly}>
                                                {membershipOnly ? 'Membership required' : processing ? 'Booking...' : 'Submit booking'}
                                            </Button>
                                            {facility.requires_membership && !auth.user && (
                                                <p className="text-xs text-rose-500">Sign in with an active membership to reserve this facility.</p>
                                            )}
                                        </>
                                    )}
                                </Form>
                            </div>
                        </section>
                    );
                })}
            </div>
        </PublicLayout>
    );
}
