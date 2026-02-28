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
import { Badge } from '@/components/ui/badge';

interface TrainerUser {
    name?: string | null;
}

interface Trainer {
    id: number;
    user?: TrainerUser | null;
}

interface ClassType {
    id: number;
    name?: string | null;
}

interface ClassSessionData {
    classType?: ClassType | null;
    trainer?: Trainer | null;
}

interface Schedule {
    id: number;
    class_session_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    created_at: string;
    classSession: ClassSessionData;
}

interface Props {
    schedules: {
        data: Schedule[];
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
        title: 'Schedules',
        href: '/schedules',
    },
];

export default function SchedulesPage({ schedules, filters, flash }: Props) {
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
        router.get('/schedules', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedules" />

            <div className="p-4 space-y-4">

                {/* Search Bar */}
                <div className='flex space-x-1'>
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                        <Input
                            placeholder="Search schedules..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant='outline' type="submit">Search</Button>
                    </form>
                    {hasAnyPermission(["schedules create"]) && (
                        <Link href="/schedules/create">
                            <Button variant='default' className='group flex items-center'>
                                <PlusCircle className='group-hover:rotate-90 transition-all' />
                                Add Schedule
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Schedules Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class Type</TableHead>
                            <TableHead>Trainer</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {schedules.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-[65vh]  text-center">
                                    <p className='text-gray-500'>No schedules found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            schedules.data.map((schedule) => {
                                const classTypeName = schedule.classSession?.classType?.name ?? 'Unassigned class';
                                const trainerName = schedule.classSession?.trainer?.user?.name ?? 'Unassigned trainer';

                                return (
                                    <TableRow key={schedule.id}>
                                        <TableCell className="font-medium">{classTypeName}</TableCell>
                                        <TableCell>{trainerName}</TableCell>
                                    <TableCell>{schedule.day_of_week}</TableCell>
                                    <TableCell>{schedule.start_time} - {schedule.end_time}</TableCell>
                                    <TableCell>
                                        {schedule.is_active ? (
                                            <Badge variant="default">Active</Badge>
                                        ) : (
                                            <Badge variant="outline">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        {hasAnyPermission(["schedules edit"]) && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={`/schedules/${schedule.id}/edit`}>
                                                        <Button size="icon" variant="outline">
                                                            <Edit2Icon className='w-4 h-4' />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit</TooltipContent>
                                            </Tooltip>
                                        )}

                                        {hasAnyPermission(["schedules delete"]) && (
                                            <DeleteButton
                                                id={schedule.id}
                                                featured="schedules"
                                            />
                                        )}
                                    </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
