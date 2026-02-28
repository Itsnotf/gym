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
import { CalendarDays, Clock4, Star, UsersRound } from 'lucide-react';

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

const statusTone = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
        case 'confirmed':
        case 'attended':
            return 'default';
        case 'scheduled':
        case 'waitlisted':
            return 'secondary';
        case 'cancelled':
        case 'missed':
            return 'destructive';
        default:
            return 'outline';
    }
};

interface TrainerDashboardPayload {
    trainer: {
        name: string | null;
        specialty: string | null;
        bio: string | null;
        rating_average: number;
        rating_count: number;
        sessions_led: number;
        active_members: number;
        last_session_at: string | null;
    };
    upcomingClasses: Array<{
        id: number;
        member: string | null;
        class: string | null;
        session_date: string | null;
        status: string;
    }>;
    activeSchedules: Array<{
        id: number;
        class: string | null;
        day: string;
        start_time: string;
        end_time: string;
    }>;
    recentReviews: Array<{
        id: number;
        rating: number;
        comment: string | null;
        member: string | null;
        reviewed_at: string | null;
    }>;
    recentAttendanceLogs: Array<{
        id: number;
        member: string | null;
        status: string;
        scheduled_for: string | null;
    }>;
}

type Props = SharedData & TrainerDashboardPayload;

export default function TrainerDashboard({
    trainer,
    upcomingClasses,
    activeSchedules,
    recentReviews,
    recentAttendanceLogs,
}: Props) {
    const metrics = [
        {
            label: 'Average rating',
            value: `${trainer.rating_average.toFixed(1)} / 5`,
            helper: `${trainer.rating_count} reviews`,
            icon: Star,
        },
        {
            label: 'Sessions led',
            value: trainer.sessions_led.toLocaleString(),
            helper: 'All time',
            icon: CalendarDays,
        },
        {
            label: 'Active members',
            value: trainer.active_members.toLocaleString(),
            helper: 'Assigned roster',
            icon: UsersRound,
        },
        {
            label: 'Last session',
            value: formatDateTime(trainer.last_session_at),
            helper: 'Most recent check-in',
            icon: Clock4,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trainer dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2 border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>{trainer.name ?? 'Trainer profile'}</CardTitle>
                            <CardDescription>
                                {trainer.specialty ?? 'Specialty TBD'} • {trainer.bio ?? 'No bio on file yet.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {metrics.map(({ label, value, helper, icon: Icon }) => (
                                    <div key={label} className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{label}</span>
                                            <Icon className="size-4" />
                                        </div>
                                        <p className="mt-2 text-3xl font-semibold">{value}</p>
                                        <p className="text-xs text-muted-foreground">{helper}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Weekly cadence</CardTitle>
                            <CardDescription>Live schedule blocks currently active.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeSchedules.length ? (
                                <ul className="space-y-3 text-sm">
                                    {activeSchedules.map((schedule) => (
                                        <li key={schedule.id} className="flex items-center justify-between rounded-lg border border-sidebar-border/70 px-3 py-2 text-left dark:border-sidebar-border">
                                            <div>
                                                <p className="font-semibold">{schedule.class ?? 'TBD'}</p>
                                                <p className="text-xs text-muted-foreground">{schedule.day}</p>
                                            </div>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {schedule.start_time} – {schedule.end_time}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No active schedules found.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Upcoming class roster</CardTitle>
                            <CardDescription>Next five sessions with member assignments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingClasses.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {upcomingClasses.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell className="font-medium">{session.class ?? 'TBD'}</TableCell>
                                                <TableCell>{session.member ?? '—'}</TableCell>
                                                <TableCell>{formatDate(session.session_date)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={statusTone(session.status)}>{session.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No upcoming class bookings.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Recent attendance</CardTitle>
                            <CardDescription>Latest check-ins tied to your sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentAttendanceLogs.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Schedule</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentAttendanceLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{log.member ?? '—'}</TableCell>
                                                <TableCell>{formatDateTime(log.scheduled_for)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={statusTone(log.status)}>{log.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No attendance records found.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Latest member reviews</CardTitle>
                        <CardDescription>Feedback feeds the trainer rating snapshot shown above.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentReviews.length ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Comment</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentReviews.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell>{review.member ?? 'Anonymous'}</TableCell>
                                            <TableCell className="font-semibold">
                                                {review.rating}
                                                <Star className="ml-1 inline size-4 text-yellow-500" />
                                            </TableCell>
                                            <TableCell className="max-w-[400px] text-sm text-muted-foreground">
                                                {review.comment ?? 'No comments provided.'}
                                            </TableCell>
                                            <TableCell>{formatDate(review.reviewed_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm text-muted-foreground">
                                <Star className="size-4" />
                                <span>No reviews recorded yet.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
