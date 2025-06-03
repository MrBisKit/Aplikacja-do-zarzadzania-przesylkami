import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeftIcon } from 'lucide-react';

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

            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add New Customer</h1>
                    <Link href={route('customers.index')}>
                        <Button variant="outline" size="default">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Customers
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
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

                                <div className="mb-6">
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <Input
                                        id="phone_number"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                    />
                                    {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2 border-t px-6 pt-6">
                                <Link href={route('customers.index')}>
                                    <Button type="button" variant="outline" size="default">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} size="default">
                                    Create Customer
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
        </AppLayout>
    );
}
