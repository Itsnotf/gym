import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, Form } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
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

interface Member {
    id: number;
    user_id: number;
    user: User;
}

interface Props {
    member: Member;
    users: User[];
}

export default function MemberEditPage({ member, users }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Members',
            href: '/members',
        },
        {
            title: 'Edit',
            href: `/members/${member.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${member.user.name}`} />
            <Form
                method="put"
                action={`/members/${member.id}`}
                resetOnSuccess={true}
                className="flex flex-col gap-6 p-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="user_id">User</Label>
                                <Select name="user_id" defaultValue={member.user_id.toString()}>
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
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Update Member
                            </Button>
                            <Link href="/members">
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
