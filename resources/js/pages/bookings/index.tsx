import AppLayout from '@/layouts/app-layout';
import { Head, Form, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BreadcrumbItem, BankAccount } from '@/types';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Plus, Building2, Dumbbell, X } from 'lucide-react';
import { BookingModal } from '@/components/booking-modal';

interface Schedule {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    price_per_class: number;
    classSession: {
        id: number;
        classType: {
            name: string;
        };
    };
}

interface Facility {
    id: number;
    name: string;
    description: string;
    hourly_rate: number;
}

interface ClassBooking {
    id: number;
    session_date: string;
    status: string;
    payment_status: string;
    ticket_code: string;
    attendees_count: number;
    total_amount: number;
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
    total_amount: number;
    facility: {
        name: string;
    };
}

interface Props {
    classBookings: ClassBooking[];
    facilityBookings: FacilityBooking[];
    schedules: Schedule[];
    facilities: Facility[];
    bankAccounts: BankAccount[];
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

export default function MemberBookingsPage({
    classBookings,
    facilityBookings,
    schedules,
    facilities,
    bankAccounts,
    flash,
}: Props) {
    // Modal state
    const [bookingStep, setBookingStep] = useState<'initial' | 'select' | 'details' | 'payment'>('initial');
    const [bookingType, setBookingType] = useState<'class' | 'facility' | null>(null);

    // Class booking state
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [classSessionDate, setClassSessionDate] = useState('');
    const [classAttendees, setClassAttendees] = useState('1');

    // Facility booking state
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [facilityStartDate, setFacilityStartDate] = useState('');
    const [facilityEndDate, setFacilityEndDate] = useState('');
    const [facilityAttendees, setFacilityAttendees] = useState('1');

    // Payment form open state
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [shownMessages] = useState(new Set());

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    // Reset modal
    const resetModal = () => {
        setBookingStep('initial');
        setBookingType(null);
        setSelectedSchedule(null);
        setClassSessionDate('');
        setClassAttendees('1');
        setSelectedFacility(null);
        setFacilityStartDate('');
        setFacilityEndDate('');
        setFacilityAttendees('1');
        setShowPaymentModal(false);
    };

    // Handle class booking flow
    const handleClassSelect = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setBookingStep('details');
    };

    const handleClassContinue = () => {
        if (!selectedSchedule || !classSessionDate) {
            toast.error('Please select class and date');
            return;
        }
        setShowPaymentModal(true);
    };

    const handleClassPaymentSubmit = (formData: any) => {
        if (!selectedSchedule || !classSessionDate) {
            toast.error('Missing booking details');
            return;
        }

        const form = new FormData();
        form.append('booking_type', 'class');
        form.append('schedule_id', selectedSchedule.id.toString());
        form.append('session_date', classSessionDate);
        form.append('attendees_count', classAttendees);
        form.append('payment_method', formData.payment_method);
        if (formData.bank_account_id) {
            form.append('bank_account_id', formData.bank_account_id);
        }
        if (formData.proof) {
            form.append('proof', formData.proof);
        }
        if (formData.notes) {
            form.append('notes', formData.notes);
        }

        router.post('/my/bookings', form, {
            onSuccess: () => {
                resetModal();
            },
        });
    };

    // Handle facility booking flow
    const handleFacilitySelect = (facility: Facility) => {
        setSelectedFacility(facility);
        setBookingStep('details');
    };

    const handleFacilityContinue = () => {
        if (!selectedFacility || !facilityStartDate || !facilityEndDate) {
            toast.error('Please select facility and time');
            return;
        }
        setShowPaymentModal(true);
    };

    const handleFacilityPaymentSubmit = (formData: any) => {
        if (!selectedFacility || !facilityStartDate || !facilityEndDate) {
            toast.error('Missing booking details');
            return;
        }

        const form = new FormData();
        form.append('booking_type', 'facility');
        form.append('facility_id', selectedFacility.id.toString());
        form.append('start_at', facilityStartDate);
        form.append('end_at', facilityEndDate);
        form.append('attendees_count', facilityAttendees);
        form.append('payment_method', formData.payment_method);
        if (formData.bank_account_id) {
            form.append('bank_account_id', formData.bank_account_id);
        }
        if (formData.proof) {
            form.append('proof', formData.proof);
        }
        if (formData.notes) {
            form.append('notes', formData.notes);
        }

        router.post('/my/bookings', form, {
            onSuccess: () => {
                resetModal();
            },
        });
    };

    // Calculate class price
    const classPrice = selectedSchedule ? Number(selectedSchedule.price_per_class) * Number(classAttendees) : 0;

    // Calculate facility price
    const calculateFacilityPrice = () => {
        if (!selectedFacility || !facilityStartDate || !facilityEndDate) return 0;
        const start = new Date(facilityStartDate);
        const end = new Date(facilityEndDate);
        const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        return Number(selectedFacility.hourly_rate) * hours * Number(facilityAttendees);
    };

    const facilityPrice = calculateFacilityPrice();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />
            <div className="space-y-10 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your class and facility reservations</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                setBookingType('class');
                                setBookingStep('select');
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Dumbbell className="w-4 h-4 mr-2" />
                            Book Class
                        </Button>
                        <Button
                            onClick={() => {
                                setBookingType('facility');
                                setBookingStep('select');
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Book Facility
                        </Button>
                    </div>
                </div>

                {/* Modal - Select Schedule/Facility */}
                {bookingStep === 'select' && (
                    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    {bookingType === 'class' ? 'Select a Class' : 'Select a Facility'}
                                </h2>
                                <button
                                    onClick={resetModal}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-3">
                                {bookingType === 'class' ? (
                                    schedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            onClick={() => handleClassSelect(schedule)}
                                            className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-lg">
                                                        {schedule.classSession.classType.name}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        {schedule.day_of_week} · {schedule.start_time}-{schedule.end_time}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        Rp {Number(schedule.price_per_class).toLocaleString('id-ID')}
                                                    </p>
                                                    <p className="text-xs text-slate-500">per person</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    facilities.map((facility) => (
                                        <div
                                            key={facility.id}
                                            onClick={() => handleFacilitySelect(facility)}
                                            className="border rounded-lg p-4 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-lg">{facility.name}</p>
                                                    <p className="text-sm text-slate-600">{facility.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        Rp {Number(facility.hourly_rate).toLocaleString('id-ID')}
                                                    </p>
                                                    <p className="text-xs text-slate-500">per hour</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal - Details (Date/Time/Attendees) */}
                {bookingStep === 'details' && (
                    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-md w-full">
                            <div className="border-b p-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold">Booking Details</h2>
                                <button
                                    onClick={resetModal}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Summary */}
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-xs text-slate-600 mb-2">Selected</p>
                                    <p className="font-semibold text-lg">
                                        {bookingType === 'class'
                                            ? selectedSchedule?.classSession.classType.name
                                            : selectedFacility?.name}
                                    </p>
                                    {bookingType === 'class' && (
                                        <p className="text-sm text-slate-600">
                                            {selectedSchedule?.day_of_week} · {selectedSchedule?.start_time}-
                                            {selectedSchedule?.end_time}
                                        </p>
                                    )}
                                </div>

                                {bookingType === 'class' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                                Session Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={classSessionDate}
                                                onChange={(e) => setClassSessionDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                                Number of Attendees *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={classAttendees}
                                                onChange={(e) => setClassAttendees(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-slate-600">Total Price</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                Rp {classPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                                Start Time *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={facilityStartDate}
                                                onChange={(e) => setFacilityStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                                End Time *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={facilityEndDate}
                                                onChange={(e) => setFacilityEndDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                                Number of Attendees *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={facilityAttendees}
                                                onChange={(e) => setFacilityAttendees(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>

                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-slate-600">Total Price</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                Rp {facilityPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setBookingStep('select')}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <BookingModal
                                        bookingData={{
                                            type: bookingType as 'class' | 'facility',
                                            name:
                                                bookingType === 'class'
                                                    ? selectedSchedule?.classSession.classType.name || ''
                                                    : selectedFacility?.name || '',
                                            description:
                                                bookingType === 'class'
                                                    ? `${selectedSchedule?.day_of_week} ${selectedSchedule?.start_time}-${selectedSchedule?.end_time}`
                                                    : selectedFacility?.description || '',
                                            price: bookingType === 'class' ? classPrice : facilityPrice,
                                        }}
                                        bankAccounts={bankAccounts}
                                        onSubmit={
                                            bookingType === 'class'
                                                ? handleClassPaymentSubmit
                                                : handleFacilityPaymentSubmit
                                        }
                                    >
                                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                            Continue to Payment
                                        </Button>
                                    </BookingModal>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Class Bookings Table */}
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
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
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
                                        <TableCell className="font-medium">
                                            {booking.classSession.classType.name}
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm">
                                                {booking.schedule.day_of_week} ({booking.schedule.start_time} - {booking.schedule.end_time})
                                            </p>
                                            <p className="text-xs text-slate-500">Ticket {booking.ticket_code}</p>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(booking.session_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-semibold">
                                                Rp {Number(booking.total_amount).toLocaleString('id-ID')}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusVariant[booking.status] ?? 'outline'}
                                                className="capitalize"
                                            >
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {booking.status !== 'cancelled' && (
                                                <Form
                                                    method="post"
                                                    action={`/my/bookings/classes/${booking.id}/cancel`}
                                                >
                                                    {({ processing, errors }) => (
                                                        <>
                                                            <input type="hidden" name="_method" value="patch" />
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={processing}
                                                            >
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

                {/* Facility Bookings Table */}
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
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
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
                                            <p className="font-semibold">
                                                Rp {Number(booking.total_amount).toLocaleString('id-ID')}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusVariant[booking.status] ?? 'outline'}
                                                className="capitalize"
                                            >
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {booking.status !== 'cancelled' && (
                                                <Form
                                                    method="post"
                                                    action={`/my/bookings/facilities/${booking.id}/cancel`}
                                                >
                                                    {({ processing, errors }) => (
                                                        <>
                                                            <input type="hidden" name="_method" value="patch" />
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={processing}
                                                            >
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
