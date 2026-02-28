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

interface Member {
    id: number;
    user_id: number;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    members: {
        data: Member[];
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
        title: 'Members',
        href: '/members',
    },
];

export default function MembersPage({ members, filters, flash }: Props) {
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
        router.get('/members', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members" />

            <div className="p-4 space-y-4">

                {/* Search Bar */}
                <div className='flex space-x-1'>
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                        <Input
                            placeholder="Search members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant='outline' type="submit">Search</Button>
                    </form>
                    {hasAnyPermission(["members create"]) && (
                        <Link href="/members/create">
                            <Button variant='default' className='group flex items-center'>
                                <PlusCircle className='group-hover:rotate-90 transition-all' />
                                Add Member
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Members Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {members.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-[65vh]  text-center">
                                    <p className='text-gray-500'>No members found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.data.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.user.name}</TableCell>
                                    <TableCell>{member.user.email}</TableCell>
                                    <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {hasAnyPermission(["members edit"]) && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={`/members/${member.id}/edit`}>
                                                        <Button size="icon" variant="outline">
                                                            <Edit2Icon className='w-4 h-4' />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit</TooltipContent>
                                            </Tooltip>
                                        )}

                                        {hasAnyPermission(["members delete"]) && (
                                            <DeleteButton
                                                id={member.id}
                                                featured="members"
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
