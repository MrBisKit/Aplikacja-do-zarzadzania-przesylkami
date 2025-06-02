import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: route('customers.index'),
    },
    {
        title: 'Add New',
        href: route('customers.create'),
    },
];

interface CustomerFormData {
    name: string;
    address: string;
    phone_number: string;
    [key: string]: string | File | Blob | null | undefined;
}

export default function CustomerCreate() {
    const { data, setData, post, processing, errors, reset } = useForm<CustomerFormData>({
        name: '',
        address: '',
        phone_number: '',
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('customers.store'), {
            onSuccess: () => reset(), // Reset form on success
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Customer" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Customer</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <Label htmlFor="name">Name*</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address">Address*</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <Input
                                        id="phone_number"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                    />
                                    {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Customer
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
