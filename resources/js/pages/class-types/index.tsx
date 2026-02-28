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

interface ClassType {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

interface Props {
    classTypes: {
        data: ClassType[];
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
        title: 'Class Types',
        href: '/class-types',
    },
];

export default function ClassTypesPage({ classTypes, filters, flash }: Props) {
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
        router.get('/class-types', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Types" />

            <div className="p-4 space-y-4">

                {/* Search Bar */}
                <div className='flex space-x-1'>
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                        <Input
                            placeholder="Search class types..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant='outline' type="submit">Search</Button>
                    </form>
                    {hasAnyPermission(["class_types create"]) && (
                        <Link href="/class-types/create">
                            <Button variant='default' className='group flex items-center'>
                                <PlusCircle className='group-hover:rotate-90 transition-all' />
                                Add Class Type
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Class Types Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {classTypes.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-[65vh]  text-center">
                                    <p className='text-gray-500'>No class types found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            classTypes.data.map((classType) => (
                                <TableRow key={classType.id}>
                                    <TableCell className="font-medium">{classType.name}</TableCell>
                                    <TableCell>{classType.description}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {hasAnyPermission(["class_types edit"]) && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={`/class-types/${classType.id}/edit`}>
                                                        <Button size="icon" variant="outline">
                                                            <Edit2Icon className='w-4 h-4' />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit</TooltipContent>
                                            </Tooltip>
                                        )}

                                        {hasAnyPermission(["class_types delete"]) && (
                                            <DeleteButton
                                                id={classType.id}
                                                featured="class-types"
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
