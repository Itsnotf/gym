import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image as ImageIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import adminPaymentTransactions from '@/routes/admin/payment-transactions';

interface BankAccountSummary {
    bank_name?: string | null;
    account_name?: string | null;
    account_number?: string | null;
}

interface PendingTransaction {
    id: number;
    status: string;
    amount: string;
    payment_method: string;
    reference_number?: string | null;
    proof_path?: string | null;
    receipt_number?: string | null;
    admin_note?: string | null;
    member?: string | null;
    payable_label?: string | null;
    bank_account?: BankAccountSummary | null;
}

interface RecentTransactionSummary {
    id: number;
    status: string;
    amount: string;
    member?: string | null;
    receipt_number?: string | null;
    verified_at?: string | null;
    payable_label?: string | null;
}

interface Props {
    pendingTransactions: PendingTransaction[];
    recentTransactions: RecentTransactionSummary[];
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payments',
        href: adminPaymentTransactions.index().url,
    },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    verified: 'default',
    rejected: 'destructive',
};

export default function PaymentTransactionsPage({ pendingTransactions, recentTransactions, flash }: Props) {
    const initialNotes = useMemo(() => {
        const entries: Record<number, string> = {};
        pendingTransactions.forEach((tx) => {
            if (tx.admin_note) {
                entries[tx.id] = tx.admin_note;
            }
        });
        return entries;
    }, [pendingTransactions]);

    const [notes, setNotes] = useState<Record<number, string>>(initialNotes);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    const handleUpdate = (transactionId: number, status: string) => {
        setProcessingId(transactionId);
        router.patch(
            adminPaymentTransactions.update(transactionId).url,
            { status, admin_note: notes[transactionId] ?? '' },
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const renderStatus = (status: string) => (
        <Badge variant={statusVariant[status] ?? 'secondary'} className="capitalize">
            {status.replace('_', ' ')}
        </Badge>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />

            <div className="px-4 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Payment Verification</h1>
                    <p className="text-sm text-muted-foreground">
                        Tinjau bukti transfer dan tandai pembayaran manual.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Proof</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            Tidak ada transaksi yang menunggu verifikasi.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingTransactions.map((transaction) => (
                                        <TableRow key={transaction.id} className="align-top">
                                            <TableCell>
                                                <div className="font-medium">{transaction.member ?? 'Guest'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {transaction.payable_label ?? '—'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Tx #{transaction.id}</div>
                                            </TableCell>
                                            <TableCell className="space-y-1">
                                                {renderStatus(transaction.status)}
                                                <div className="text-sm font-semibold">
                                                    Rp {Number(transaction.amount ?? 0).toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Method: {transaction.payment_method}
                                                </div>
                                                {transaction.reference_number && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Ref: {transaction.reference_number}
                                                    </div>
                                                )}
                                                {transaction.bank_account && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {transaction.bank_account.bank_name} • {transaction.bank_account.account_number}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.proof_path ? (
                                                    <button
                                                        onClick={() => setSelectedProofUrl(transaction.proof_path!)}
                                                        className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                        View Proof
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="min-w-[220px]">
                                                <Textarea
                                                    placeholder="Catatan admin"
                                                    value={notes[transaction.id] ?? ''}
                                                    onChange={(event) =>
                                                        setNotes((prev) => ({
                                                            ...prev,
                                                            [transaction.id]: event.target.value,
                                                        }))
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="space-y-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={processingId === transaction.id}
                                                    onClick={() => handleUpdate(transaction.id, 'verified')}
                                                >
                                                    Tandai Lunas
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={processingId === transaction.id}
                                                    onClick={() => handleUpdate(transaction.id, 'rejected')}
                                                >
                                                    Tolak Bukti
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recently Verified</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Receipt</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Verified At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            Belum ada transaksi yang diverifikasi.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div className="font-medium">{transaction.member ?? 'Guest'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {transaction.payable_label ?? '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {transaction.receipt_number ? (
                                                    <Badge variant="secondary">{transaction.receipt_number}</Badge>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                Rp {Number(transaction.amount ?? 0).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>{transaction.verified_at ?? '—'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Payment Proof Modal */}
                <Dialog open={!!selectedProofUrl} onOpenChange={(open) => !open && setSelectedProofUrl(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Payment Proof</DialogTitle>
                        </DialogHeader>
                        {selectedProofUrl && (
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src={selectedProofUrl}
                                    alt="Payment proof"
                                    className="max-h-[500px] max-w-full rounded-lg border border-slate-200 object-contain"
                                />
                                <a
                                    href={selectedProofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Open in new tab
                                </a>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
