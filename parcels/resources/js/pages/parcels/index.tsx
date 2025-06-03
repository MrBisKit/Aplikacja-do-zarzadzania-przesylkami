import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import React from 'react';
import { Parcel, PaginatedData, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import Pagination from '@/components/pagination'; // Assuming this component exists

interface ParcelsIndexProps {
    parcels: PaginatedData<Parcel>;
}

export default function ParcelsIndex({ parcels }: ParcelsIndexProps) {
    const [parcelToDelete, setParcelToDelete] = useState<Parcel | null>(null);

    const breadcrumbs = [
        { title: 'Parcels', href: route('parcels.index') },
    ];

    const handleDeleteParcel = () => {
        if (parcelToDelete) {
            console.log('Attempting to delete parcel ID:', parcelToDelete.id);
            router.delete(route('parcels.destroy', parcelToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Parcel deletion successful for ID:', parcelToDelete.id);
                    // Toast notification for success can go here (e.g., toast.success('Parcel deleted!'))
                },
                onError: (errors) => {
                    console.error('Parcel deletion failed for ID:', parcelToDelete.id, 'Errors:', errors);
                    // Toast notification for error can go here (e.g., toast.error('Failed to delete parcel.'))
                },
                onFinish: () => {
                    console.log('Inertia delete request finished for parcel ID:', parcelToDelete?.id);
                    setParcelToDelete(null); // Crucial: Ensure dialog state is reset AFTER request completion
                }
            });
        } else {
            console.warn('handleDeleteParcel called but parcelToDelete is null');
        }
    };
    return (
        <AppLayout title="Parcels" breadcrumbs={breadcrumbs}>
            <Head title="Parcels" />
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Parcels</h1>
                    <Link href={route('parcels.create')}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Parcel
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Parcel List</CardTitle>
                        <CardDescription>
                            A list of all parcels in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tracking #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Courier</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parcels.data.length > 0 ? (
                                    parcels.data.map((parcel) => (
                                        <TableRow key={parcel.id}>
                                            <TableCell className="font-medium">{parcel.tracking_number}</TableCell>
                                            <TableCell>{parcel.customer?.name}</TableCell>
                                            <TableCell>{parcel.courier ? parcel.courier.name : 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={parcel.status === 'delivered' ? 'default' : (parcel.status === 'pending' ? 'secondary' : 'outline') } 
                                                       className={cn({
                                                        'bg-green-500 text-white dark:bg-green-600 dark:text-gray-100': parcel.status === 'delivered',
                                                        'bg-yellow-400 text-gray-800 dark:bg-yellow-500 dark:text-gray-900': parcel.status === 'in_transit',
                                                        'bg-blue-500 text-white dark:bg-blue-600 dark:text-gray-100': parcel.status === 'out_for_delivery',
                                                        'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200': parcel.status === 'pending',
                                                       })}
                                                >
                                                    {parcel.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(parcel.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => router.get(route('parcels.show', parcel.id))}
                                                            className="flex items-center w-full cursor-pointer"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => router.get(route('parcels.edit', parcel.id))}
                                                            className="flex items-center w-full cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {/* Use state to control the dialog */}
                                                        {(() => {
                                                            // Create a scoped component with its own state
                                                            const [open, setOpen] = React.useState(false);
                                                            
                                                            return (
                                                                <AlertDialog open={open} onOpenChange={setOpen}>
                                                                    <AlertDialogTrigger asChild>
                                                                        <DropdownMenuItem 
                                                                            className="flex items-center w-full text-red-600 hover:!text-red-600 focus:!text-red-600 dark:text-red-500 dark:hover:!text-red-500 dark:focus:!text-red-500 cursor-pointer"
                                                                            onSelect={(e) => {
                                                                                // Prevent the dropdown from closing
                                                                                e.preventDefault();
                                                                                // Open the dialog
                                                                                setOpen(true);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                        </DropdownMenuItem>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently delete the parcel{' '}
                                                                                <strong className='px-1'>{parcel.tracking_number}</strong>
                                                                                {' '}and remove its data from our servers.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => {
                                                                                    console.log('Attempting to delete parcel ID:', parcel.id);
                                                                                    // Close the dialog first
                                                                                    setOpen(false);
                                                                                    // Then delete the parcel
                                                                                    router.delete(route('parcels.destroy', parcel.id), {
                                                                                        preserveScroll: true
                                                                                    });
                                                                                }}
                                                                                className='bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                                                                            >
                                                                                Yes, delete parcel
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            );
                                                        })()}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            No parcels found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination Links */}
                {parcels.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            {parcels.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={cn(
                                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                                        link.active
                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-300'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700',
                                        { 'cursor-not-allowed opacity-50': !link.url }
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                    as={link.url ? 'a' : 'span'} // Render as 'a' if URL exists, else 'span'
                                />
                            ))}
                        </nav>
                    </div>
                )}
            </div>
            {/* Removed the shared AlertDialog - now using inline AlertDialog in each dropdown */}
        </AppLayout>
    );
}