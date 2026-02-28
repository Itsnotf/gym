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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Facilities',
        href: '/admin/facilities',
    },
    {
        title: 'Create',
        href: '/admin/facilities/create',
    },
];

export default function FacilityCreatePage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Facility" />
            <Form method="post" action="/admin/facilities" className="flex flex-col gap-6 p-4">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Facility Name</Label>
                                    <Input id="name" name="name" required placeholder="Premium Weight Room" />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        rows={6}
                                        placeholder="Describe capacity, equipment, or experience"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input id="capacity" name="capacity" type="number" min={1} defaultValue={10} />
                                    <InputError message={errors.capacity} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="waitlist_limit">Waitlist Limit</Label>
                                    <Input id="waitlist_limit" name="waitlist_limit" type="number" min={0} defaultValue={5} />
                                    <InputError message={errors.waitlist_limit} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="hourly_rate">Hourly Rate (IDR)</Label>
                                    <Input id="hourly_rate" name="hourly_rate" type="number" min={0} step={0.01} defaultValue={0} />
                                    <InputError message={errors.hourly_rate} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-3">
                                        <Checkbox id="requires_membership" name="requires_membership" value="1" defaultChecked />
                                        <Label htmlFor="requires_membership" className="cursor-pointer text-sm font-medium">
                                            Requires active membership
                                        </Label>
                                    </div>
                                    <InputError message={errors.requires_membership} />
                                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-3">
                                        <Checkbox id="is_active" name="is_active" value="1" defaultChecked />
                                        <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">
                                            Mark as active
                                        </Label>
                                    </div>
                                    <InputError message={errors.is_active} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Save facility
                            </Button>
                            <Link href="/admin/facilities">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </AppLayout>
    );
}
