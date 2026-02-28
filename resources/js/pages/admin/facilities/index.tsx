import DeleteButton from '@/components/delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Edit2Icon, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Facility {
    id: number;
    name: string;
    description?: string | null;
    capacity: number;
    waitlist_limit: number;
    requires_membership: boolean;
    is_active: boolean;
    hourly_rate: string | number;
}

interface Paginated<T> {
    data: T[];
    links: unknown[];
}

interface Props {
    facilities: Paginated<Facility>;
    filters: {
        search?: string;
    };
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Facilities',
        href: '/admin/facilities',
    },
];

export default function FacilitiesPage({ facilities, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [shownMessages] = useState(new Set());

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get('/admin/facilities', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Facilities" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2 md:flex-none md:w-1/3">
                        <Input
                            placeholder="Search facilities..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <Button type="submit" variant="outline">
                            Search
                        </Button>
                    </form>
                    <Link href="/admin/facilities/create">
                        <Button className="group flex items-center">
                            <PlusCircle className="transition-transform group-hover:rotate-90" />
                            Add Facility
                        </Button>
                    </Link>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Pricing</TableHead>
                            <TableHead>Requirements</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {facilities.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-[60vh] text-center text-muted-foreground">
                                    No facilities found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            facilities.data.map((facility) => (
                                <TableRow key={facility.id}>
                                    <TableCell>
                                        <p className="font-semibold flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            {facility.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {facility.description ?? 'No description'}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium">{facility.capacity} slots</p>
                                        <p className="text-xs text-muted-foreground">
                                            Waitlist: {facility.waitlist_limit}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-semibold">Rp {Number(facility.hourly_rate).toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">per hour</p>
                                    </TableCell>
                                    <TableCell>
                                        {facility.requires_membership ? (
                                            <Badge variant="default">Members only</Badge>
                                        ) : (
                                            <Badge variant="secondary">Open access</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {facility.is_active ? (
                                            <Badge variant="default">Active</Badge>
                                        ) : (
                                            <Badge variant="outline">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Link href={`/admin/facilities/${facility.id}/edit`}>
                                            <Button size="icon" variant="outline">
                                                <Edit2Icon className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteButton
                                            id={facility.id}
                                            featured="facility"
                                            endpoint="admin/facilities"
                                        />
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
