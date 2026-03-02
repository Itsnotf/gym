import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BankAccount } from '@/types';
import { useState } from 'react';

interface BookingModalProps {
    children: React.ReactNode;
    bookingData: {
        type: 'class' | 'facility';
        name: string;
        description: string;
        price: number;
        scheduleId?: number;
        facilityId?: number;
        scheduleDate?: string;
    };
    bankAccounts: BankAccount[];
    onSubmit: (formData: any) => void;
    isLoading?: boolean;
}

export function BookingModal({
    children,
    bookingData,
    bankAccounts,
    onSubmit,
    isLoading = false,
}: BookingModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        payment_method: 'transfer',
        bank_account_id: '',
        notes: '',
        proof: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, ...bookingData });
        setOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData({ ...formData, proof: file });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Book {bookingData.type === 'class' ? 'Class' : 'Facility'}</DialogTitle>
                    <DialogDescription>
                        {bookingData.name}
                        {bookingData.scheduleDate && ` - ${bookingData.scheduleDate}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Booking Summary */}
                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                        <p className="text-sm text-slate-600">Booking Details</p>
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{bookingData.name}</p>
                            <p className="text-xl font-bold text-blue-600">
                                Rp {Number(bookingData.price).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <p className="text-xs text-slate-500">{bookingData.description}</p>
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <label htmlFor="transfer" className="text-sm font-medium cursor-pointer">
                                        Bank Transfer
                                    </label>
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
                                    <label htmlFor="cash" className="text-sm font-medium cursor-pointer">
                                        Cash Payment
                                    </label>
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
                                            {bankAccounts.map((account) => (
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
                                        required
                                        className="mt-1 block w-full text-sm text-gray-600 file:mt-0 file:mr-3 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Upload receipt/screenshot (JPG, PNG, PDF max 5MB)</p>
                                    {formData.proof && (
                                        <p className="text-sm text-green-600 mt-1">✓ File: {formData.proof.name}</p>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any notes for your booking..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="mt-1"
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                            {isLoading ? 'Processing...' : 'Confirm Booking'}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
