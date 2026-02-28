import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';

interface ClassSessionOption {
    id: number;
    label: string;
    trainer?: string | null;
}

interface FacilityOption {
    id: number;
    name: string;
}

interface Props {
    classSessions: ClassSessionOption[];
    facilities: FacilityOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Packages', href: '/admin/packages' },
    { title: 'Create', href: '/admin/packages/create' },
];

export default function PackageCreatePage({ classSessions, facilities }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Package" />
            <Form method="post" action="/admin/packages" className="space-y-6 p-4">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Package Name</Label>
                                    <Input id="name" name="name" required placeholder="Unlimited Classes" />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Package Type</Label>
                                    <Input id="type" name="type" required placeholder="class / all_access / facility" />
                                    <InputError message={errors.type} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" rows={5} placeholder="Highlight included perks" />
                                    <InputError message={errors.description} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price (IDR)</Label>
                                    <Input id="price" name="price" type="number" min={0} step={1000} required />
                                    <InputError message={errors.price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="duration_days">Duration (days)</Label>
                                    <Input id="duration_days" name="duration_days" type="number" min={1} defaultValue={30} required />
                                    <InputError message={errors.duration_days} />
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-3">
                                    <Checkbox id="is_active" name="is_active" defaultChecked value="1" />
                                    <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">
                                        Mark as active
                                    </Label>
                                </div>
                                <InputError message={errors.is_active} />
                            </div>
                            <div className="space-y-6">
                                <div className="rounded-xl border p-4">
                                    <p className="font-semibold mb-3">Attach Class Sessions</p>
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                        {classSessions.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No class sessions available.</p>
                                        )}
                                        {classSessions.map((session) => (
                                            <label key={session.id} className="flex items-start gap-3 rounded-lg border border-transparent p-2 hover:border-muted">
                                                <Checkbox name="class_session_ids[]" value={session.id} />
                                                <span className="text-sm">
                                                    {session.label}
                                                    {session.trainer && (
                                                        <span className="block text-xs text-muted-foreground">Trainer {session.trainer}</span>
                                                    )}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.class_session_ids} />
                                </div>
                                <div className="rounded-xl border p-4">
                                    <p className="font-semibold mb-3">Attach Facilities</p>
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                                        {facilities.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No facilities available.</p>
                                        )}
                                        {facilities.map((facility) => (
                                            <label key={facility.id} className="flex items-center gap-3 rounded-lg border border-transparent p-2 hover:border-muted">
                                                <Checkbox name="facility_ids[]" value={facility.id} />
                                                <span className="text-sm">{facility.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.facility_ids} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Save package
                            </Button>
                            <Link href="/admin/packages">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </AppLayout>
    );
}
