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
        rating_average: number;
        rating_count: number;
    };
    activeSchedules: Array<{
        id: number;
        class: string | null;
        day: string;
        start_time: string;
        end_time: string;
    }>;
    allReviews: Array<{
        id: number;
        rating: number;
        comment: string | null;
        member: string | null;
        reviewed_at: string | null;
    }>;
}

type Props = SharedData & TrainerDashboardPayload;

export default function TrainerDashboard({
    trainer,
    activeSchedules,
    allReviews,
}: Props) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trainer dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Trainer Info Header */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{trainer.name ?? 'Trainer profile'}</CardTitle>
                        <CardDescription>
                            {trainer.specialty ?? 'Specialty TBD'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-8">
                            <div>
                                <p className="text-sm text-muted-foreground">Average rating</p>
                                <p className="text-3xl font-semibold">{trainer.rating_average.toFixed(1)} / 5</p>
                                <p className="text-xs text-muted-foreground">{trainer.rating_count} reviews</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Weekly Schedule */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>Your active class schedule</CardDescription>
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

                    {/* Reviews Summary */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Rating Summary</CardTitle>
                            <CardDescription>Your performance overview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Rating</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-3xl font-bold">{trainer.rating_average.toFixed(1)}</span>
                                        <span className="text-muted-foreground">out of 5</span>
                                    </div>
                                </div>
                                <div className="mt-4 border-t pt-4">
                                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                                    <p className="text-2xl font-semibold">{trainer.rating_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* All Reviews */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Member Reviews</CardTitle>
                        <CardDescription>All feedback from your members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {allReviews.length ? (
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
                                    {allReviews.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell>{review.member ?? 'Anonymous'}</TableCell>
                                            <TableCell className="font-semibold">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[400px] text-sm text-muted-foreground">
                                                {review.comment ?? 'No comment provided'}
                                            </TableCell>
                                            <TableCell>{formatDate(review.reviewed_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm text-muted-foreground">
                                <Star className="size-4" />
                                <span>No reviews yet.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
