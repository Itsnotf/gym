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

interface ClassType {
    id: number;
    name: string;
}

interface TrainerUser {
    name: string;
}

interface Trainer {
    id: number;
    user: TrainerUser;
}

interface ClassSessionData {
    id: number;
    class_type_id: number;
    trainer_id: number;
    capacity: number;
    waitlist_limit: number;
    allow_guest_booking: boolean;
    classType: ClassType;
    trainer: Trainer;
}

interface Props {
    classSession: ClassSessionData;
    classTypes: ClassType[];
    trainers: Trainer[];
}

export default function ClassSessionEditPage({ classSession, classTypes, trainers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Class Sessions',
            href: '/class-sessions',
        },
        {
            title: 'Edit',
            href: `/class-sessions/${classSession.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Class Session" />
            <Form
                method="put"
                action={`/class-sessions/${classSession.id}`}
                resetOnSuccess={true}
                className="flex flex-col gap-6 p-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="class_type_id">Class Type</Label>
                                <Select name="class_type_id" defaultValue={classSession.class_type_id.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a class type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classTypes.map((classType) => (
                                            <SelectItem key={classType.id} value={classType.id.toString()}>
                                                {classType.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.class_type_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="trainer_id">Trainer</Label>
                                <Select name="trainer_id" defaultValue={classSession.trainer_id.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a trainer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {trainers.map((trainer) => (
                                            <SelectItem key={trainer.id} value={trainer.id.toString()}>
                                                {trainer.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.trainer_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        name="capacity"
                                        min={1}
                                        max={100}
                                        defaultValue={classSession.capacity}
                                    />
                                    <InputError message={errors.capacity} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="waitlist_limit">Waitlist Limit</Label>
                                    <Input
                                        id="waitlist_limit"
                                        type="number"
                                        name="waitlist_limit"
                                        min={0}
                                        max={50}
                                        defaultValue={classSession.waitlist_limit}
                                    />
                                    <InputError message={errors.waitlist_limit} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="allow_guest_booking">Allow Guest Booking</Label>
                                    <Select
                                        name="allow_guest_booking"
                                        defaultValue={classSession.allow_guest_booking ? '1' : '0'}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Yes</SelectItem>
                                            <SelectItem value="0">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.allow_guest_booking} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Update Class Session
                            </Button>
                            <Link href="/class-sessions">
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
