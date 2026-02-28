import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, CreditCard } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface SubscriptionItem {
    id: number;
    reference: string;
    status: string;
    price: string | number;
    started_at?: string | null;
    expires_at?: string | null;
    member?: {
        user?: {
            name: string;
        } | null;
    } | null;
    package?: {
        name: string;
        duration_days: number;
    } | null;
    payment_transaction?: {
        status: string;
        amount: string | number;
    } | null;
}

interface Paginated<T> {
    data: T[];
    links: unknown[];
}

interface Props {
    subscriptions: Paginated<SubscriptionItem>;
    filters: {
        search?: string;
        status?: string;
    };
    statusOptions: string[];
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subscriptions',
        href: '/admin/subscriptions',
    },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'secondary',
    active: 'default',
    expired: 'outline',
    cancelled: 'destructive',
};

export default function AdminSubscriptionsPage({ subscriptions, filters, statusOptions, flash }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [shownMessages] = useState(new Set());
    const selectableStatuses = statusOptions.filter((option) => Boolean(option && option.trim().length));
    const selectValue = status === '' ? '__all__' : status;

    const handleStatusChange = (value: string) => {
        setStatus(value === '__all__' ? '' : value);
    };

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const handleFilter = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(
            '/admin/subscriptions',
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    const rows = useMemo(() => {
        if (subscriptions.data.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="h-[60vh] text-center text-muted-foreground">
                        No subscriptions yet.
                    </TableCell>
                </TableRow>
            );
        }

        return subscriptions.data.map((subscription) => (
            <TableRow key={subscription.id}>
                <TableCell>
                    <div className="font-semibold">{subscription.member?.user?.name ?? 'Unknown member'}</div>
                    <p className="text-xs text-muted-foreground">{subscription.reference}</p>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium">{subscription.package?.name ?? 'Custom Package'}</span>
                        <span className="text-xs text-muted-foreground">
                            {subscription.package?.duration_days ?? 0} days • Rp {Number(subscription.price).toLocaleString()}
                        </span>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant={statusVariant[subscription.status] ?? 'secondary'} className="capitalize">
                        {subscription.status}
                    </Badge>
                </TableCell>
                <TableCell>
                    {subscription.started_at ? (
                        <div className="text-sm">
                            <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                {new Date(subscription.started_at).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                expires {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : '—'}
                            </p>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">Not activated yet</p>
                    )}
                </TableCell>
                <TableCell>
                    {subscription.payment_transaction ? (
                        <div className="text-sm">
                            <div className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Rp {Number(subscription.payment_transaction.amount).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">{subscription.payment_transaction.status}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">No payment recorded</p>
                    )}
                </TableCell>
            </TableRow>
        ));
    }, [subscriptions.data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions" />
            <div className="space-y-4 p-4">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-2">
                    <Input
                        placeholder="Search member, package, or reference"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="flex-1 min-w-[240px]"
                    />
                    <Select value={selectValue} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All statuses</SelectItem>
                            {selectableStatuses.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type="submit" variant="outline">
                        Filter
                    </Button>
                </form>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Timeline</TableHead>
                            <TableHead>Payment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{rows}</TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
