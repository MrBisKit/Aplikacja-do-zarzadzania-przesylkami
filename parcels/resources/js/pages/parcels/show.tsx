import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeftIcon, Loader2, Pencil, ClockIcon, TruckIcon, AlertCircle } from 'lucide-react';
import { Parcel } from '@/types';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ParcelShowProps {
    parcel: Parcel;
    statuses: string[];
}

// Helper function to format date strings
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

// Helper function to format status
const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function ParcelShow({ parcel, statuses }: ParcelShowProps) {
    const breadcrumbs = [
        { title: 'Parcels', href: route('parcels.index') },
        { title: `Details for ${parcel.tracking_number}`, href: route('parcels.show', parcel.id) },
    ];

    const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
    
    const { data, setData, put, processing, errors, reset } = useForm({
        status: parcel.status,
        history_note: '',
    });
    
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('parcels.updateStatus', parcel.id), {
            onSuccess: () => {
                setStatusPopoverOpen(false);
                reset();
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Parcel ${parcel.tracking_number}`} />
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Parcel: {parcel.tracking_number}</h1>
                    <div className="ml-auto flex gap-4">
                        <Link href={route('parcels.edit', parcel.id)}>
                            <Button>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Parcel
                            </Button>
                        </Link>
                        <Button
                            variant="default"
                            size="default"
                            onClick={() => {
                                setIsGeneratingLabel(true);
                                window.open(route('parcels.label', parcel.id), '_blank');
                                setTimeout(() => {
                                    setIsGeneratingLabel(false);
                                }, 3000);
                            }}
                            disabled={isGeneratingLabel}
                        >
                            {isGeneratingLabel ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Label (PDF)'
                            )}
                        </Button>
                        <Link href={route('parcels.index')}>
                            <Button variant="outline" size="default">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Parcels
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Parcel Status Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Parcel Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</h3>
                                <div className="flex items-center mt-1 space-x-2">
                                    <Badge 
                                        className={cn({
                                            'bg-green-500 text-white dark:bg-green-600 dark:text-gray-100': parcel.status === 'delivered',
                                            'bg-yellow-400 text-gray-800 dark:bg-yellow-500 dark:text-gray-900': parcel.status === 'in_transit',
                                            'bg-blue-500 text-white dark:bg-blue-600 dark:text-gray-100': parcel.status === 'out_for_delivery',
                                            'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200': parcel.status === 'pending',
                                            'bg-red-500 text-white dark:bg-red-600 dark:text-gray-100': parcel.status === 'failed_attempt' || parcel.status === 'cancelled',
                                            'bg-orange-500 text-white dark:bg-orange-600 dark:text-gray-100': parcel.status === 'returned'
                                        })}
                                    >
                                        {formatStatus(parcel.status)}
                                    </Badge>
                                    <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                Change Status
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" align="start">
                                            <div className="p-4 border-b">
                                                <h4 className="font-medium">Update Parcel Status</h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Change status from <Badge className="mx-1 text-xs">{formatStatus(parcel.status)}</Badge>
                                                </p>
                                            </div>
                                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">New Status</Label>
                                                    <Select 
                                                        value={data.status} 
                                                        onValueChange={(value) => setData('status', value)}
                                                    >
                                                        <SelectTrigger id="status">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statuses.map((status) => (
                                                                <SelectItem key={status} value={status}>
                                                                    {formatStatus(status)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="history_note">Add a note (optional)</Label>
                                                    <Textarea
                                                        id="history_note"
                                                        value={data.history_note}
                                                        onChange={(e) => setData('history_note', e.target.value)}
                                                        placeholder="e.g. Customer requested delivery delay"
                                                        rows={2}
                                                    />
                                                </div>
                                                
                                                <div className="flex justify-end space-x-2">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => setStatusPopoverOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        size="sm"
                                                        disabled={processing || data.status === parcel.status}
                                                    >
                                                        {processing ? 'Saving...' : 'Update'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Courier</h3>
                                <p className="mt-1 text-base">{parcel.courier?.name || 'Not assigned'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</h3>
                                <p className="mt-1 text-base">
                                    {parcel.customer ? (
                                        <Link 
                                            href={route('customers.show', parcel.customer.id)}
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            {parcel.customer.name}
                                        </Link>
                                    ) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                                <p className="mt-1 text-base">{formatDate(parcel.created_at)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                                <p className="mt-1 text-base">{formatDate(parcel.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parcel Details Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sender</h3>
                                        <p className="mt-1 text-base font-medium">{parcel.sender_name}</p>
                                        <p className="mt-1 text-sm whitespace-pre-line">{parcel.sender_address}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</h3>
                                        <p className="mt-1 text-base">{parcel.weight ? `${parcel.weight} kg` : 'N/A'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h3>
                                        <p className="mt-1 text-base whitespace-pre-line">{parcel.notes || 'No notes'}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recipient</h3>
                                        <p className="mt-1 text-base font-medium">{parcel.recipient_name}</p>
                                        <p className="mt-1 text-sm whitespace-pre-line">{parcel.recipient_address}</p>
                                        {parcel.recipient_phone && <p className="mt-1 text-sm">Phone: {parcel.recipient_phone}</p>}
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</h3>
                                        <p className="mt-1 text-base">{parcel.dimensions || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parcel History Card */}
                    <Card className="md:col-span-3 mt-4">
                        <CardHeader>
                            <CardTitle>Parcel History</CardTitle>
                            <CardDescription>Tracking history for this parcel</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                {/* Vertical timeline line */}
                                <div className="absolute left-7 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                                
                                {/* Current status */}
                                <div className="mb-8 flex items-start">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 relative z-10">
                                        <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="flex items-center">
                                            <h3 className="text-lg font-semibold">{formatStatus(parcel.status)}</h3>
                                            <Badge 
                                                className={cn("ml-2", {
                                                    'bg-green-500 text-white dark:bg-green-600 dark:text-gray-100': parcel.status === 'delivered',
                                                    'bg-yellow-400 text-gray-800 dark:bg-yellow-500 dark:text-gray-900': parcel.status === 'in_transit',
                                                    'bg-blue-500 text-white dark:bg-blue-600 dark:text-gray-100': parcel.status === 'out_for_delivery',
                                                    'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200': parcel.status === 'pending',
                                                    'bg-red-500 text-white dark:bg-red-600 dark:text-gray-100': parcel.status === 'failed_attempt' || parcel.status === 'cancelled',
                                                    'bg-orange-500 text-white dark:bg-orange-600 dark:text-gray-100': parcel.status === 'returned'
                                                })}
                                            >
                                                Current Status
                                            </Badge>
                                        </div>
                                        <time className="text-sm text-gray-500 dark:text-gray-400">{formatDate(parcel.updated_at)}</time>
                                        <p className="mt-1 text-gray-700 dark:text-gray-300">Current status of the parcel</p>
                                    </div>
                                </div>
                                
                                {/* History items - filter out the most recent one if it matches current status */}
                                {parcel.history && parcel.history.length > 0 ? (
                                    parcel.history
                                        .filter((historyItem, index) => 
                                            // Skip the first history item if it matches the current status
                                            !(index === 0 && historyItem.new_status === parcel.status)
                                        )
                                        .map((historyItem, index, array) => (
                                        <div key={historyItem.id} className={`${index === array.length - 1 ? 'mb-0' : 'mb-8'} flex items-start`}>
                                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 relative z-10">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{index + 1}</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <Badge className={cn({
                                                        'bg-green-500 text-white dark:bg-green-600 dark:text-gray-100': historyItem.new_status === 'delivered',
                                                        'bg-yellow-400 text-gray-800 dark:bg-yellow-500 dark:text-gray-900': historyItem.new_status === 'in_transit',
                                                        'bg-blue-500 text-white dark:bg-blue-600 dark:text-gray-100': historyItem.new_status === 'out_for_delivery',
                                                        'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200': historyItem.new_status === 'pending',
                                                        'bg-red-500 text-white dark:bg-red-600 dark:text-gray-100': historyItem.new_status === 'failed_attempt' || historyItem.new_status === 'cancelled',
                                                        'bg-orange-500 text-white dark:bg-orange-600 dark:text-gray-100': historyItem.new_status === 'returned'
                                                    })}>
                                                        {formatStatus(historyItem.new_status)}
                                                    </Badge>
                                                </div>
                                                {historyItem.old_status && (
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        From: {formatStatus(historyItem.old_status)}
                                                    </p>
                                                )}
                                                <time className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(historyItem.created_at)}
                                                </time>
                                                {historyItem.notes && (
                                                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                                        "{historyItem.notes}"
                                                    </p>
                                                )}
                                                {historyItem.user && (
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Updated by: {historyItem.user.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="mb-0 flex items-start">
                                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 relative z-10">
                                            <ClockIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold">Parcel Created</h3>
                                            <time className="text-sm text-gray-500 dark:text-gray-400">{formatDate(parcel.created_at)}</time>
                                            <p className="mt-1 text-gray-700 dark:text-gray-300">Parcel was registered in the system</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
