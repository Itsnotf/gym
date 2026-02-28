import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/delete-button';
import { Edit2Icon, PlusCircle } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import hasAnyPermission from '@/lib/utils';

interface Trainer {
    id: number;
    user: {
        name: string;
    };
}

interface ClassType {
    id: number;
    name: string;
}

interface ClassSession {
    id: number;
    class_type_id: number;
    trainer_id: number;
    created_at: string;
    capacity: number;
    waitlist_limit: number;
    classType: ClassType;
    trainer: Trainer;
}

interface Props {
    classSessions: {
        data: ClassSession[];
        links: any[];
    };
    filters: {
        search?: string;
    };
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Class Sessions',
        href: '/class-sessions',
    },
];

export default function ClassSessionsPage({ classSessions, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [shownMessages] = useState(new Set());

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/class-sessions', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Sessions" />

            <div className="p-4 space-y-4">

                {/* Search Bar */}
                <div className='flex space-x-1'>
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                        <Input
                            placeholder="Search class sessions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant='outline' type="submit">Search</Button>
                    </form>
                    {hasAnyPermission(["class_sessions create"]) && (
                        <Link href="/class-sessions/create">
                            <Button variant='default' className='group flex items-center'>
                                <PlusCircle className='group-hover:rotate-90 transition-all' />
                                Add Class Session
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Class Sessions Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class Type</TableHead>
                            <TableHead>Trainer</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Waitlist</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {classSessions.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-[65vh]  text-center">
                                    <p className='text-gray-500'>No class sessions found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            classSessions.data.map((classSession) => (
                                <TableRow key={classSession.id}>
                                    <TableCell className="font-medium">{classSession.classType?.name || 'N/A'}</TableCell>
                                    <TableCell>{classSession.trainer?.user?.name || 'N/A'}</TableCell>
                                    <TableCell>{classSession.capacity}</TableCell>
                                    <TableCell>{classSession.waitlist_limit}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {hasAnyPermission(["class_sessions edit"]) && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={`/class-sessions/${classSession.id}/edit`}>
                                                        <Button size="icon" variant="outline">
                                                            <Edit2Icon className='w-4 h-4' />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit</TooltipContent>
                                            </Tooltip>
                                        )}

                                        {hasAnyPermission(["class_sessions delete"]) && (
                                            <DeleteButton
                                                id={classSession.id}
                                                featured="class-sessions"
                                            />
                                        )}
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
