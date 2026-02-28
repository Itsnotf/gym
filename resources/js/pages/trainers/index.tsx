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
    user_id: number;
    specialty: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    trainers: {
        data: Trainer[];
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
        title: 'Trainers',
        href: '/trainers',
    },
];

export default function TrainersPage({ trainers, filters, flash }: Props) {
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
        router.get('/trainers', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trainers" />

            <div className="p-4 space-y-4">

                {/* Search Bar */}
                <div className='flex space-x-1'>
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                        <Input
                            placeholder="Search trainers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant='outline' type="submit">Search</Button>
                    </form>
                    {hasAnyPermission(["trainers create"]) && (
                        <Link href="/trainers/create">
                            <Button variant='default' className='group flex items-center'>
                                <PlusCircle className='group-hover:rotate-90 transition-all' />
                                Add Trainer
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Trainers Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {trainers.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-[65vh]  text-center">
                                    <p className='text-gray-500'>No trainers found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            trainers.data.map((trainer) => (
                                <TableRow key={trainer.id}>
                                    <TableCell className="font-medium">{trainer.user.name}</TableCell>
                                    <TableCell>{trainer.user.email}</TableCell>
                                    <TableCell>{trainer.specialty}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {hasAnyPermission(["trainers edit"]) && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={`/trainers/${trainer.id}/edit`}>
                                                        <Button size="icon" variant="outline">
                                                            <Edit2Icon className='w-4 h-4' />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit</TooltipContent>
                                            </Tooltip>
                                        )}

                                        {hasAnyPermission(["trainers delete"]) && (
                                            <DeleteButton
                                                id={trainer.id}
                                                featured="trainers"
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
