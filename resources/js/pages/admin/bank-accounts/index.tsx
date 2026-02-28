import DeleteButton from '@/components/delete-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2Icon, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BankAccount {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    branch?: string | null;
    instructions?: string | null;
    is_active: boolean;
    display_order: number;
}

interface Paginated<T> {
    data: T[];
    links: unknown[];
}

interface Props {
    accounts: Paginated<BankAccount>;
    filters: {
        search?: string;
    };
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bank Accounts',
        href: '/admin/bank-accounts',
    },
];

export default function BankAccountsPage({ accounts, filters, flash }: Props) {
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
        router.get('/admin/bank-accounts', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Accounts" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2 md:flex-none md:w-1/3">
                        <Input
                            placeholder="Search bank, account name, or number..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <Button type="submit" variant="outline">
                            Search
                        </Button>
                    </form>
                    <Link href="/admin/bank-accounts/create">
                        <Button className="group flex items-center">
                            <PlusCircle className="transition-transform group-hover:rotate-90" />
                            Add Bank Account
                        </Button>
                    </Link>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bank</TableHead>
                            <TableHead>Account Details</TableHead>
                            <TableHead>Instructions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-[60vh] text-center text-muted-foreground">
                                    No bank accounts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            accounts.data.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell>
                                        <p className="font-semibold">{account.bank_name}</p>
                                        <p className="text-xs text-muted-foreground">{account.branch ?? '—'}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm font-medium">{account.account_name}</p>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {account.account_number}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[320px] text-sm text-muted-foreground">
                                        {account.instructions ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        {account.is_active ? (
                                            <Badge variant="default">Active</Badge>
                                        ) : (
                                            <Badge variant="outline">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{account.display_order}</TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Link href={`/admin/bank-accounts/${account.id}/edit`}>
                                            <Button size="icon" variant="outline">
                                                <Edit2Icon className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteButton
                                            id={account.id}
                                            featured="bank account"
                                            endpoint="admin/bank-accounts"
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
