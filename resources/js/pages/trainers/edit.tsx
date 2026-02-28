import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, Form } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface User {
    id: number;
    name: string;
    email: string;
}

interface Trainer {
    id: number;
    user_id: number;
    specialty: string;
    user: User;
}

interface Props {
    trainer: Trainer;
    users: User[];
}

export default function TrainerEditPage({ trainer, users }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Trainers',
            href: '/trainers',
        },
        {
            title: 'Edit',
            href: `/trainers/${trainer.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${trainer.user.name}`} />
            <Form
                method="put"
                action={`/trainers/${trainer.id}`}
                resetOnSuccess={true}
                className="flex flex-col gap-6 p-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="user_id">User</Label>
                                <Select name="user_id" defaultValue={trainer.user_id.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.user_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="specialty">Specialty</Label>
                                <Input
                                    id="specialty"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    name="specialty"
                                    placeholder="e.g., Yoga, Fitness, CrossFit"
                                    defaultValue={trainer.specialty}
                                />
                                <InputError
                                    message={errors.specialty}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Update Trainer
                            </Button>
                            <Link href="/trainers">
                                <Button variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </AppLayout>
    );
}
