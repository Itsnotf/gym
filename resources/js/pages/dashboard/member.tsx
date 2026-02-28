import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Activity,
    CalendarClock,
    CheckCircle2,
    Clock4,
    Layers,
    Ticket,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '—';

const formatDateTime = (value?: string | null) =>
    value ? dateTimeFormatter.format(new Date(value)) : '—';

const statusTone = (status: string): 'default' | 'outline' | 'secondary' | 'destructive' => {
    switch (status) {
        case 'attended':
        case 'confirmed':
        case 'active':
            return 'default';
        case 'waitlisted':
        case 'scheduled':
            return 'secondary';
        case 'cancelled':
        case 'missed':
            return 'destructive';
        default:
            return 'outline';
    }
};

interface MemberDashboardPayload {
    membership: {
        plan: string | null;
        status: string | null;
        starts_at: string | null;
        expires_at: string | null;
        auto_renew: boolean;
        progress: number;
    } | null;
    attendanceSummary: Record<string, number>;
    upcomingClassBookings: Array<{
        id: number;
        class: string | null;
        session_date: string | null;
        status: string;
        ticket_code: string | null;
        schedule: {
            day: string;
            start_time: string;
            end_time: string;
        } | null;
    }>;
    upcomingFacilityBookings: Array<{
        id: number;
        facility: string | null;
        start_at: string | null;
        end_at: string | null;
        status: string;
        ticket_code: string | null;
    }>;
    recentAttendanceLogs: Array<{
        id: number;
        status: string;
        scheduled_for: string | null;
        trainer: string | null;
        notes: string | null;
    }>;
}

type Props = SharedData & MemberDashboardPayload;

export default function MemberDashboard({
    membership,
    attendanceSummary,
    upcomingClassBookings,
    upcomingFacilityBookings,
    recentAttendanceLogs,
}: Props) {
    const attendanceCards = [
        {
            label: 'Attended',
            value: attendanceSummary.attended ?? 0,
            icon: CheckCircle2,
        },
        {
            label: 'Scheduled',
            value: attendanceSummary.scheduled ?? 0,
            icon: CalendarClock,
        },
        {
            label: 'Waitlisted',
            value: attendanceSummary.waitlisted ?? 0,
            icon: Clock4,
        },
        {
            label: 'Missed',
            value: attendanceSummary.missed ?? 0,
            icon: Activity,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Member dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Membership</CardTitle>
                            <CardDescription>
                                Stay on top of plan details, renewal dates, and current progress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {membership ? (
                                <>
                                    <div className="grid gap-3 text-sm md:grid-cols-2">
                                        <div>
                                            <p className="text-muted-foreground">Plan</p>
                                            <p className="font-semibold">{membership.plan ?? 'Not assigned'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Status</p>
                                            <Badge variant={statusTone(membership.status ?? '')}>
                                                {membership.status ?? 'unknown'}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Starts</p>
                                            <p className="font-medium">{formatDate(membership.starts_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Expires</p>
                                            <p className="font-medium">{formatDate(membership.expires_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Auto-renew</p>
                                            <p className="font-medium">
                                                {membership.auto_renew ? 'Enabled' : 'Manual renewal'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Progress</p>
                                            <p className="font-semibold">{membership.progress}%</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Layers className="size-4" />
                                            <span>Plan completion</span>
                                        </div>
                                        <div className="h-3 rounded-full bg-muted">
                                            <div
                                                className="h-3 rounded-full bg-primary transition-all"
                                                style={{ width: `${Math.min(membership.progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No membership data available.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Attendance snapshot</CardTitle>
                            <CardDescription>
                                Quick glance at how often you participate across upcoming sessions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {attendanceCards.map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{label}</span>
                                            <Icon className="size-4" />
                                        </div>
                                        <p className="mt-2 text-3xl font-semibold">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Upcoming class bookings</CardTitle>
                            <CardDescription>Your next five class reservations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingClassBookings.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Ticket</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {upcomingClassBookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>
                                                    <div className="font-medium">{booking.class ?? 'TBD'}</div>
                                                    {booking.schedule ? (
                                                        <p className="text-xs text-muted-foreground">
                                                            {booking.schedule.day} · {booking.schedule.start_time}–
                                                            {booking.schedule.end_time}
                                                        </p>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>{formatDate(booking.session_date)}</TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {booking.ticket_code ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusTone(booking.status)}>{booking.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No upcoming class bookings yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Upcoming facility bookings</CardTitle>
                            <CardDescription>Studios, courts, and specialty spaces.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingFacilityBookings.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Facility</TableHead>
                                            <TableHead>Start</TableHead>
                                            <TableHead>End</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {upcomingFacilityBookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>
                                                    <div className="font-medium">{booking.facility ?? 'TBD'}</div>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        Ticket: {booking.ticket_code ?? '—'}
                                                    </p>
                                                </TableCell>
                                                <TableCell>{formatDateTime(booking.start_at)}</TableCell>
                                                <TableCell>{formatDateTime(booking.end_at)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={statusTone(booking.status)}>{booking.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No upcoming facility bookings.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Recent attendance logs</CardTitle>
                        <CardDescription>Latest check-ins and instructor notes captured from bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentAttendanceLogs.length ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Trainer</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentAttendanceLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm">
                                                <div className="font-medium">{formatDateTime(log.scheduled_for)}</div>
                                            </TableCell>
                                            <TableCell>{log.trainer ?? '—'}</TableCell>
                                            <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                                                {log.notes ?? 'No notes'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusTone(log.status)}>{log.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm text-muted-foreground">
                                <Ticket className="size-4" />
                                <span>No attendance data captured yet.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
