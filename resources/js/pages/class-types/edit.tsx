import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, Form } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

interface ClassType {
    id: number;
    name: string;
    description: string;
}

interface Props {
    classType: ClassType;
}

export default function ClassTypeEditPage({ classType }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Class Types',
            href: '/class-types',
        },
        {
            title: 'Edit',
            href: `/class-types/${classType.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${classType.name}`} />
            <Form
                method="put"
                action={`/class-types/${classType.id}`}
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
                                    defaultValue={classType.name}
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
                                    defaultValue={classType.description}
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
                                Update Class Type
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
