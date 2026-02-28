import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';

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

interface Props {
    bankAccount: BankAccount;
}

export default function BankAccountEditPage({ bankAccount }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Bank Accounts',
            href: '/admin/bank-accounts',
        },
        {
            title: bankAccount.bank_name,
            href: `/admin/bank-accounts/${bankAccount.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${bankAccount.bank_name}`} />
            <Form method="put" action={`/admin/bank-accounts/${bankAccount.id}`} className="flex flex-col gap-6 p-4">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="bank_name">Bank Name</Label>
                                    <Input
                                        id="bank_name"
                                        name="bank_name"
                                        required
                                        defaultValue={bankAccount.bank_name}
                                    />
                                    <InputError message={errors.bank_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="account_name">Account Name</Label>
                                    <Input
                                        id="account_name"
                                        name="account_name"
                                        required
                                        defaultValue={bankAccount.account_name}
                                    />
                                    <InputError message={errors.account_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="account_number">Account Number</Label>
                                    <Input
                                        id="account_number"
                                        name="account_number"
                                        required
                                        defaultValue={bankAccount.account_number}
                                    />
                                    <InputError message={errors.account_number} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="branch">Branch</Label>
                                    <Input id="branch" name="branch" defaultValue={bankAccount.branch ?? ''} />
                                    <InputError message={errors.branch} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="instructions">Payment Instructions</Label>
                                    <Textarea
                                        id="instructions"
                                        name="instructions"
                                        rows={6}
                                        defaultValue={bankAccount.instructions ?? ''}
                                    />
                                    <InputError message={errors.instructions} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="display_order">Display Order</Label>
                                    <Input
                                        id="display_order"
                                        name="display_order"
                                        type="number"
                                        min={0}
                                        defaultValue={bankAccount.display_order ?? 0}
                                    />
                                    <InputError message={errors.display_order} />
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-3">
                                    <Checkbox
                                        id="is_active"
                                        name="is_active"
                                        value="1"
                                        defaultChecked={bankAccount.is_active}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">
                                        Mark as active
                                    </Label>
                                </div>
                                <InputError message={errors.is_active} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Update bank account
                            </Button>
                            <Link href="/admin/bank-accounts">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </AppLayout>
    );
}
