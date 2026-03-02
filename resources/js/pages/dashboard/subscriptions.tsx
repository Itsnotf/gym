import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Calendar, Check, Clock, Package as PackageIcon } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Subscription {
    id: number;
    package: string;
    price: number;
    status: string;
    started_at?: string;
    expires_at?: string;
}

interface Package {
    id: number;
    name: string;
    type: string;
    description: string;
    price: number;
    duration_days: number;
}

interface BankAccount {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
}

interface Props {
    currentSubscription?: Subscription | null;
    subscriptionHistory: Subscription[];
    availablePackages: Package[];
    bankAccounts: BankAccount[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Subscriptions',
        href: '/my/subscriptions',
    },
];

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    active: 'default',
    pending: 'secondary',
    expired: 'outline',
    cancelled: 'destructive',
};

const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    return statusColors[status] || 'outline';
};

export default function SubscriptionsPage({
    currentSubscription,
    subscriptionHistory,
    availablePackages,
    bankAccounts,
}: Props) {
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        package_id: '',
        payment_method: 'transfer',
        bank_account_id: '',
        notes: '',
        proof: null as File | null,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append('package_id', formData.package_id);
        form.append('payment_method', formData.payment_method);
        if (formData.bank_account_id) {
            form.append('bank_account_id', formData.bank_account_id);
        }
        if (formData.notes) {
            form.append('notes', formData.notes);
        }
        if (formData.proof) {
            form.append('proof', formData.proof);
        }

        router.post('/subscriptions', form, {
            onSuccess: () => {
                toast.success('Subscription request submitted!');
                setDialogOpen(false);
                setFormData({
                    package_id: '',
                    payment_method: 'transfer',
                    bank_account_id: '',
                    notes: '',
                    proof: null,
                });
                setSelectedPackage(null);
            },
            onError: () => {
                toast.error('Failed to submit subscription');
            },
        });
    };

    const handleOpenDialog = (pkg: Package) => {
        setSelectedPackage(pkg);
        setFormData({
            package_id: pkg.id.toString(),
            payment_method: 'transfer',
            bank_account_id: '',
            notes: '',
            proof: null,
        });
        setDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions" />

            <div className="p-4 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Manage Your Subscriptions</h1>
                    <p className="text-gray-600 mt-2">View and renew your gym memberships</p>
                </div>

                {/* Current Subscription */}
                {currentSubscription && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                Current Subscription
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Package</p>
                                    <p className="font-semibold">{currentSubscription.package}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Amount</p>
                                    <p className="font-semibold">Rp {Number(currentSubscription.price).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Started</p>
                                    <p className="font-semibold">{new Date(currentSubscription.started_at!).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Expires</p>
                                    <p className="font-semibold text-red-600">
                                        {new Date(currentSubscription.expires_at!).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={getStatusColor(currentSubscription.status)}>
                                {currentSubscription.status.toUpperCase()}
                            </Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Available Packages */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Available Packages</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {availablePackages.map((pkg) => (
                            <Card key={pkg.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                    <CardDescription>{pkg.type}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <p className="text-sm text-gray-600">{pkg.description}</p>

                                    <div className="space-y-2 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Duration</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-semibold">{pkg.duration_days} days</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold">
                                                Rp {Number(pkg.price).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    <Dialog open={dialogOpen && selectedPackage?.id === pkg.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                handleOpenDialog(pkg);
                                            } else {
                                                setDialogOpen(false);
                                            }
                                        }}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full mt-4">
                                                <PackageIcon className="w-4 h-4 mr-2" />
                                                Subscribe Now
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Subscribe to {pkg.name}</DialogTitle>
                                                <DialogDescription>
                                                    Rp {Number(pkg.price).toLocaleString('id-ID')} for {pkg.duration_days} days
                                                </DialogDescription>
                                            </DialogHeader>
                                            <SubscriptionForm
                                                formData={formData}
                                                setFormData={setFormData}
                                                onSubmit={onSubmit}
                                                bankAccounts={bankAccounts}
                                                packageId={pkg.id}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Subscription History */}
                {subscriptionHistory.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Subscription History</h2>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    {subscriptionHistory.map((sub) => (
                                        <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-semibold">{sub.package}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(sub.started_at!).toLocaleDateString('id-ID')} -{' '}
                                                    {sub.expires_at && new Date(sub.expires_at).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-semibold">
                                                    Rp {Number(sub.price).toLocaleString('id-ID')}
                                                </p>
                                                <Badge variant={getStatusColor(sub.status)}>
                                                    {sub.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function SubscriptionForm({ formData, setFormData, onSubmit, bankAccounts, packageId }: {
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    bankAccounts: BankAccount[];
    packageId: number;
}) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData({ ...formData, proof: file });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <input type="hidden" value={packageId} onChange={(e) => {
                setFormData({ ...formData, package_id: e.target.value });
            }} />

            <div>
                <Label>Payment Method</Label>
                <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="transfer"
                            name="payment_method"
                            value="transfer"
                            checked={formData.payment_method === 'transfer'}
                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="transfer" className="text-sm font-medium cursor-pointer">Bank Transfer</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="cash"
                            name="payment_method"
                            value="cash"
                            checked={formData.payment_method === 'cash'}
                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="cash" className="text-sm font-medium cursor-pointer">Cash Payment</label>
                    </div>
                </div>
            </div>

            {formData.payment_method === 'transfer' && (
                <>
                    <div>
                        <Label htmlFor="bank_account_id">Select Bank Account</Label>
                        <Select value={formData.bank_account_id} onValueChange={(value) =>
                            setFormData({ ...formData, bank_account_id: value })
                        }>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Choose bank account" />
                            </SelectTrigger>
                            <SelectContent>
                                {bankAccounts.map((account: BankAccount) => (
                                    <SelectItem key={account.id} value={account.id.toString()}>
                                        {account.bank_name} - {account.account_name} ({account.account_number})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="proof">Payment Proof (Receipt/Screenshot)*</Label>
                        <input
                            id="proof"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-600 file:mt-0 file:mr-3 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload receipt/screenshot of your bank transfer (JPG, PNG, PDF max 5MB)</p>
                        {formData.proof && (
                            <p className="text-sm text-green-600 mt-1">✓ File selected: {formData.proof.name}</p>
                        )}
                    </div>
                </>
            )}

            <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    placeholder="Add any notes for your subscription..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1"
                />
            </div>

            <Button type="submit" className="w-full">
                Complete Subscription
            </Button>
        </form>
    );
}
