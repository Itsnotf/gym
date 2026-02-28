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

interface Props {
    users: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Members',
        href: '/members',
    },
    {
        title: 'Create',
        href: '/members/create',
    },
];

export default function MemberCreatePage({ users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Member" />
            <Form
                method="post"
                action="/members"
                resetOnSuccess={true}
                className="flex flex-col gap-6 p-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="user_id">User</Label>
                                <Select name="user_id">
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
                                Create Member
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
