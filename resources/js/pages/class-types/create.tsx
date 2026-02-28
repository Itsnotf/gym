import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, Form } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Class Types',
        href: '/class-types',
    },
    {
        title: 'Create',
        href: '/class-types/create',
    },
];

export default function ClassTypeCreatePage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Class Type" />
            <Form
                method="post"
                action="/class-types"
                resetOnSuccess={true}
                className="flex flex-col gap-6 p-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    name="name"
                                    placeholder="Class type name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    required
                                    tabIndex={2}
                                    name="description"
                                    placeholder="Class type description"
                                    rows={5}
                                />
                                <InputError
                                    message={errors.description}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Create Class Type
                            </Button>
                            <Link href="/class-types">
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
