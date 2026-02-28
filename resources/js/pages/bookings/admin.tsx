import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect } from 'react';
import adminBookings from '@/routes/admin/bookings';
import adminPaymentTransactions from '@/routes/admin/payment-transactions';

interface TransactionSummary {
    id: number;
    status: string;
    amount: string;
}

interface ClassBookingSummary {
    id: number;
    member?: string | null;
    class_type?: string | null;
    trainer?: string | null;
    session_date?: string | null;
    status: string;
    payment_status: string;
    payment_method: string;
    total_amount: string;
    ticket_code: string;
    transaction: TransactionSummary | null;
}

interface FacilityBookingSummary {
    id: number;
    member?: string | null;
    facility?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    status: string;
    payment_status: string;
    payment_method: string;
    total_amount: string;
    ticket_code: string;
    transaction: TransactionSummary | null;
}

interface Props {
    classBookings: ClassBookingSummary[];
    facilityBookings: FacilityBookingSummary[];
    canReviewPayments: boolean;
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bookings',
        href: adminBookings.index().url,
    },
];

export default function AdminBookingPage({ classBookings, facilityBookings, canReviewPayments, flash }: Props) {
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    const renderStatus = (status: string, variant: 'default' | 'secondary' | 'destructive' = 'default') => (
        <Badge variant={variant}>{status}</Badge>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings" />

            <div className="space-y-6 px-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Booking Oversight</h1>
                        <p className="text-sm text-muted-foreground">
                            Pantau reservasi kelas dan fasilitas yang membutuhkan perhatian admin.
                        </p>
                    </div>

                    {canReviewPayments && (
                        <Link href={adminPaymentTransactions.index()} prefetch>
                            <Button variant="outline">Go to Payment Verification</Button>
                        </Link>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classBookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                Belum ada booking kelas terbaru.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        classBookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>
                                                    <div className="font-medium">{booking.class_type ?? '—'}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Trainer: {booking.trainer ?? '—'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Ticket {booking.ticket_code}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{booking.member ?? 'Guest'}</TableCell>
                                                <TableCell>{booking.session_date ?? '—'}</TableCell>
                                                <TableCell className="space-y-1">
                                                    {renderStatus(booking.payment_status)}
                                                    <div className="text-xs text-muted-foreground">
                                                        Method: {booking.payment_method}
                                                    </div>
                                                    {booking.transaction && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Tx #{booking.transaction.id} • {booking.transaction.status}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    Rp {Number(booking.total_amount ?? 0).toLocaleString('id-ID')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Facility Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Facility</TableHead>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {facilityBookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                Belum ada booking fasilitas terbaru.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        facilityBookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>
                                                    <div className="font-medium">{booking.facility ?? '—'}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Ticket {booking.ticket_code}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{booking.member ?? 'Guest'}</TableCell>
                                                <TableCell>
                                                    <div>{booking.start_at ?? '—'}</div>
                                                    <div className="text-xs text-muted-foreground">s/d {booking.end_at ?? '—'}</div>
                                                </TableCell>
                                                <TableCell className="space-y-1">
                                                    {renderStatus(booking.payment_status)}
                                                    <div className="text-xs text-muted-foreground">
                                                        Method: {booking.payment_method}
                                                    </div>
                                                    {booking.transaction && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Tx #{booking.transaction.id} • {booking.transaction.status}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    Rp {Number(booking.total_amount ?? 0).toLocaleString('id-ID')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
