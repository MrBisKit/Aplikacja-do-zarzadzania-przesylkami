import { type BreadcrumbItem, type Customer, type Parcel } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, ArrowLeft } from 'lucide-react';

interface CustomerShowProps {
    customer: Customer & {
        parcels: Parcel[];
    };
}

export default function CustomerShow({ customer }: CustomerShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Customers',
            href: route('customers.index'),
        },
        {
            title: customer.name,
            href: route('customers.show', customer.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer: ${customer.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Link href={route('customers.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
                            </Button>
                        </Link>
                        <Link href={route('customers.edit', customer.id)}>
                            <Button>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Customer
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Customer Details Card */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle>Customer Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                                    <p className="mt-1 text-base">{customer.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                                    <p className="mt-1 text-base whitespace-pre-line">{customer.address}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</h3>
                                    <p className="mt-1 text-base">{customer.phone_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Since</h3>
                                    <p className="mt-1 text-base">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Parcels Card */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Customer Parcels</CardTitle>
                                <CardDescription>
                                    Parcels associated with this customer
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Add debug information to help troubleshoot */}
                                <div className="mb-4 text-sm text-gray-500">
                                    {customer.parcels ? 
                                        `${Array.isArray(customer.parcels) ? customer.parcels.length : 0} parcels found` : 
                                        'No parcels data available'}
                                </div>
                                
                                {customer.parcels && Array.isArray(customer.parcels) && customer.parcels.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tracking #</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Recipient</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customer.parcels.map((parcel) => (
                                                <TableRow key={parcel.id}>
                                                    <TableCell className="font-medium">{parcel.tracking_number}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={parcel.status === 'delivered' ? 'default' : (parcel.status === 'pending' ? 'secondary' : 'outline') } 
                                                               className={cn({
                                                                'bg-green-500 text-white dark:bg-green-600 dark:text-gray-100': parcel.status === 'delivered',
                                                                'bg-yellow-400 text-gray-800 dark:bg-yellow-500 dark:text-gray-900': parcel.status === 'in_transit',
                                                                'bg-blue-500 text-white dark:bg-blue-600 dark:text-gray-100': parcel.status === 'out_for_delivery',
                                                                'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200': parcel.status === 'pending',
                                                                'bg-red-500 text-white dark:bg-red-600 dark:text-gray-100': parcel.status === 'failed_attempt' || parcel.status === 'cancelled',
                                                                'bg-orange-500 text-white dark:bg-orange-600 dark:text-gray-100': parcel.status === 'returned'
                                                               })}>
                                                            {parcel.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{parcel.recipient_name}</TableCell>
                                                    <TableCell>{new Date(parcel.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => router.get(route('parcels.show', parcel.id))}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 dark:text-gray-400">No parcels found for this customer.</p>
                                        <Link href={route('parcels.create')}>
                                            <Button variant="outline" className="mt-4">
                                                Create New Parcel
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
