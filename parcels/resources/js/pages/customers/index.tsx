import { type BreadcrumbItem, type Customer } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: route('customers.index'),
    },
];

interface CustomersIndexProps {
    customers: {
        data: Customer[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        // Other pagination data
    };
}

export default function CustomersIndex({ customers }: CustomersIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
                    <Link href={route('customers.create')}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Manage Customers</CardTitle>
                        <CardDescription>View and manage your customer database.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.data.length > 0 ? (
                                    customers.data.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">{customer.id}</TableCell>
                                            <TableCell>{customer.name}</TableCell>
                                            <TableCell>{customer.address}</TableCell>
                                            <TableCell>{customer.phone_number || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => router.get(route('customers.show', customer.id))}
                                                            className="flex items-center w-full cursor-pointer"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => router.get(route('customers.edit', customer.id))}
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
                                                                                This action cannot be undone. This will permanently delete the customer{' '}
                                                                                <strong className='px-1'>{customer.name}</strong>
                                                                                {' '}and remove their data from our servers.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => {
                                                                                    console.log('Attempting to delete customer ID:', customer.id);
                                                                                    // Close the dialog first
                                                                                    setOpen(false);
                                                                                    // Then delete the customer
                                                                                    router.delete(route('customers.destroy', customer.id), {
                                                                                        preserveScroll: true
                                                                                    });
                                                                                }}
                                                                                className='bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                                                                            >
                                                                                Yes, delete customer
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
                                        <TableCell colSpan={5} className="text-center">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination Links */}
                {customers.links && customers.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <Pagination links={customers.links} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
