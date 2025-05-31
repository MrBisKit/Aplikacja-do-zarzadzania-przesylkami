import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Parcel, PaginatedData } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import Pagination from '@/components/pagination'; // Assuming this component exists

interface ParcelsIndexProps {
    parcels: PaginatedData<Parcel>;
}

export default function ParcelsIndex({ parcels }: ParcelsIndexProps) {
    return (
        <AppLayout

            breadcrumbs={[
                { title: 'Parcels', href: route('parcels.index') },
            ]}
        >
            <Head title="Parcels" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Parcels Management
                        </h2>
                        <Link href={route('parcels.create')}>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Parcel
                            </Button>
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {parcels.data.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tracking #</TableHead>
                                                <TableHead>Sender</TableHead>
                                                <TableHead>Recipient</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Courier</TableHead>
                                                <TableHead>Created At</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parcels.data.map((parcel) => (
                                                <TableRow key={parcel.id}>
                                                    <TableCell className="font-medium">{parcel.tracking_number}</TableCell>
                                                    <TableCell>{parcel.sender_name}</TableCell>
                                                    <TableCell>{parcel.recipient_name}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                                parcel.status === 'delivered'
                                                                    ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20'
                                                                    : parcel.status === 'pending'
                                                                    ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20'
                                                                    : parcel.status === 'in_transit' || parcel.status === 'out_for_delivery'
                                                                    ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20'
                                                                    : parcel.status === 'cancelled' || parcel.status === 'failed_attempt' || parcel.status === 'returned'
                                                                    ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20'
                                                                    : 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20'
                                                            }`}
                                                        >
                                                            {parcel.status.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{parcel.courier?.name || <span className="text-gray-400 italic">N/A</span>}</TableCell>
                                                    <TableCell>{new Date(parcel.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={route('parcels.show', parcel.id)} className="mr-2">
                                                            <Button variant="outline" size="sm">View</Button>
                                                        </Link>
                                                        {/* TODO: Add Edit/Delete buttons later */}
                                                        {/* <Link href={route('parcels.edit', parcel.id)}><Button variant="outline" size="sm">Edit</Button></Link> */}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {parcels.links && parcels.data.length > 0 && (
                                        <Pagination className="mt-6" links={parcels.links} />
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 dark:text-gray-400">No parcels found.</p>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new parcel.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}