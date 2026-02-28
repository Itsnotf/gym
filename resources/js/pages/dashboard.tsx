import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Building2,
    CalendarCheck2,
    Gauge,
    Users,
} from 'lucide-react';
import type { ComponentType } from 'react';

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
};

type Props = SharedData & {
    stats?: DashboardStats;
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
];

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metrics(stats).map(({ label, value, description, icon: Icon }) => (
                        <Card key={label} className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {label}
                                </CardTitle>
                                <Icon className="size-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold tracking-tight">
                                    {value}
                                </p>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Role-aware dashboards</CardTitle>
                        <CardDescription>
                            Members and trainers are automatically routed to dedicated dashboards with their own sessions,
                            attendance, and rating insights.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            You are seeing the admin/system overview because your account does not have an assigned
                            member or trainer profile. Switch to a member or trainer test user to view their respective
                            dashboards.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
