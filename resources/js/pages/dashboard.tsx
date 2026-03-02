import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Form, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarCheck2,
    Check,
    DollarSign,
    Gauge,
    Image,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type DashboardStats = {
    members: number;
    trainers: number;
    class_bookings: number;
    facility_bookings: number;
    total_revenue: number;
    active_subscriptions: number;
};

type BookingMonth = {
    month: string;
    class_bookings: number;
    facility_bookings: number;
    total: number;
};

type RevenuePayment = {
    name: string;
    class_revenue: number;
    facility_revenue: number;
};

type PaymentStatus = {
    name: string;
    value: number;
};

type RecentBooking = {
    id: number;
    type: 'class' | 'facility';
    name: string;
    date: string;
    total_amount: number;
    payment_status: string;
    payment_method: string;
    payment_proof: string | null;
    created_at: string;
};

type Props = SharedData & {
    stats?: DashboardStats;
    bookingsByMonth?: BookingMonth[];
    revenueByPayment?: RevenuePayment[];
    paymentStatusDistribution?: PaymentStatus[];
    recentBookings?: RecentBooking[];
};

const metrics = (
    stats?: DashboardStats,
): Array<{
    label: string;
    value: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
}> => [
    {
        label: 'Active Members',
        value: stats ? stats.members.toLocaleString() : '—',
        description: 'Registered member profiles',
        icon: Users,
    },
    {
        label: 'Trainers',
        value: stats ? stats.trainers.toLocaleString() : '—',
        description: 'Coaches on the roster',
        icon: Gauge,
    },
    {
        label: 'Class Bookings',
        value: stats ? stats.class_bookings.toLocaleString() : '—',
        description: 'Lifetime class reservations',
        icon: CalendarCheck2,
    },
    {
        label: 'Facility Bookings',
        value: stats ? stats.facility_bookings.toLocaleString() : '—',
        description: 'Court + studio reservations',
        icon: Building2,
    },
    {
        label: 'Total Revenue',
        value: stats ? `Rp ${(stats.total_revenue / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}K` : '—',
        description: 'Confirmed payments',
        icon: DollarSign,
    },
    {
        label: 'Active Subscriptions',
        value: stats ? stats.active_subscriptions.toLocaleString() : '—',
        description: 'Current memberships',
        icon: TrendingUp,
    },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
const paymentStatusColors = ['#fbbf24', '#10b981', '#ef4444'];

export default function Dashboard({
    stats,
    bookingsByMonth = [],
    revenueByPayment = [],
    paymentStatusDistribution = [],
    recentBookings = [],
}: Props) {
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {metrics(stats).map(({ label, value, description, icon: Icon }) => (
                        <Card key={label} className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {label}
                                </CardTitle>
                                <Icon className="size-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold tracking-tight">
                                    {value}
                                </p>
                                <p className="text-xs text-muted-foreground">{description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Bookings Trend */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Booking Trends (6 months)</CardTitle>
                            <CardDescription>
                                Class vs Facility bookings over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={bookingsByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="class_bookings" fill="#3b82f6" name="Class Bookings" />
                                    <Bar dataKey="facility_bookings" fill="#8b5cf6" name="Facility Bookings" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Payment Status Distribution */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Payment Status Distribution</CardTitle>
                            <CardDescription>
                                Current booking payment states
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={paymentStatusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {paymentStatusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={paymentStatusColors[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Revenue by Payment Method */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border md:col-span-2">
                        <CardHeader>
                            <CardTitle>Revenue by Payment Method</CardTitle>
                            <CardDescription>
                                Income comparison between transfer and cash payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={revenueByPayment.map((item) => ({
                                        ...item,
                                        total_revenue: item.class_revenue + item.facility_revenue,
                                    }))}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: any) =>
                                            typeof value === 'number'
                                                ? `Rp ${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}K`
                                                : value
                                        }
                                    />
                                    <Legend />
                                    <Bar dataKey="class_revenue" fill="#3b82f6" name="Class Revenue" />
                                    <Bar dataKey="facility_revenue" fill="#8b5cf6" name="Facility Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Bookings Table */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>
                            Latest class and facility reservations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment Status</TableHead>
                                    <TableHead>Proof</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                                            No bookings yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <TableRow key={`${booking.type}-${booking.id}`}>
                                            <TableCell>
                                                <Badge variant={booking.type === 'class' ? 'default' : 'secondary'}>
                                                    {booking.type === 'class' ? 'Class' : 'Facility'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{booking.name}</TableCell>
                                            <TableCell>{new Date(booking.date).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>
                                                Rp {Number(booking.total_amount).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        booking.payment_status === 'confirmed'
                                                            ? 'default'
                                                            : booking.payment_status === 'pending'
                                                              ? 'secondary'
                                                              : 'outline'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {booking.payment_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {booking.payment_proof && booking.payment_method === 'transfer' ? (
                                                    <button
                                                        onClick={() =>
                                                            setSelectedProofUrl(`/storage/${booking.payment_proof}`)
                                                        }
                                                        className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                                                    >
                                                        <Image className="w-4 h-4" />
                                                        View Proof
                                                    </button>
                                                ) : booking.payment_method === 'cash' ? (
                                                    <span className="text-xs text-slate-500">Cash</span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {booking.payment_status === 'pending' && (
                                                    <Form
                                                        method="patch"
                                                        action={
                                                            booking.type === 'class'
                                                                ? `/admin/bookings/classes/${booking.id}/confirm`
                                                                : `/admin/bookings/facilities/${booking.id}/confirm`
                                                        }
                                                    >
                                                        {({ processing }) => (
                                                            <button
                                                                type="submit"
                                                                disabled={processing}
                                                                className="flex items-center gap-1 rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Confirm
                                                            </button>
                                                        )}
                                                    </Form>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Payment Proof Modal */}
                <Dialog open={!!selectedProofUrl} onOpenChange={(open) => !open && setSelectedProofUrl(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Payment Proof</DialogTitle>
                        </DialogHeader>
                        {selectedProofUrl && (
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src={selectedProofUrl}
                                    alt="Payment proof"
                                    className="max-h-[500px] max-w-full rounded-lg border border-slate-200 object-contain"
                                />
                                <a
                                    href={selectedProofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Open in new tab
                                </a>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
