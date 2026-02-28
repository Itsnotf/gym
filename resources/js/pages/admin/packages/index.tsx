import DeleteButton from '@/components/delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Package, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PackageItem {
    id: number;
    name: string;
    type: string;
    description?: string | null;
    price: string | number;
    duration_days: number;
    is_active: boolean;
    class_sessions_count: number;
    facilities_count: number;
    active_subscriptions_count: number;
}

interface Paginated<T> {
    data: T[];
    links: unknown[];
}

interface Props {
    packages: Paginated<PackageItem>;
    filters: {
        search?: string;
        show_inactive?: string | number | boolean;
    };
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Packages',
        href: '/admin/packages',
    },
];

export default function PackagesPage({ packages, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [showInactive, setShowInactive] = useState(Boolean(Number(filters.show_inactive ?? 0)));
    const [shownMessages] = useState(new Set());

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(
            '/admin/packages',
            { search, show_inactive: showInactive ? 1 : 0 },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Packages" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex flex-1 flex-wrap items-center gap-2">
                        <Input
                            placeholder="Search packages..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="flex-1 min-w-[220px]"
                        />
                        <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 px-3 py-2">
                            <Checkbox
                                id="show_inactive"
                                checked={showInactive}
                                onCheckedChange={(checked) => setShowInactive(checked === true)}
                            />
                            <label htmlFor="show_inactive" className="text-sm font-medium">
                                Include inactive
                            </label>
                        </div>
                        <Button type="submit" variant="outline">
                            Apply
                        </Button>
                    </form>
                    <Link href="/admin/packages/create">
                        <Button className="group flex items-center">
                            <PlusCircle className="transition-transform group-hover:rotate-90" />
                            Add Package
                        </Button>
                    </Link>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Pricing</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Subscriptions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packages.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-[60vh] text-center text-muted-foreground">
                                    No packages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            packages.data.map((pkg) => (
                                <TableRow key={pkg.id}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                {pkg.name}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {pkg.description ?? 'No description'}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {pkg.type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold">Rp {Number(pkg.price).toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">{pkg.duration_days} days</p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm">{pkg.class_sessions_count} classes</p>
                                        <p className="text-xs text-muted-foreground">{pkg.facilities_count} facilities</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{pkg.active_subscriptions_count} active</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {pkg.is_active ? (
                                            <Badge variant="default">Active</Badge>
                                        ) : (
                                            <Badge variant="destructive">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Link href={`/admin/packages/${pkg.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </Link>
                                        <DeleteButton id={pkg.id} featured="package" endpoint="admin/packages" />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
