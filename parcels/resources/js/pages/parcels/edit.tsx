import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Parcel, Customer, User, ParcelHistory } from '@/types';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';

interface ParcelEditProps {
    parcel: Parcel & {
        history: (ParcelHistory & {
            user: User | null;
        })[];
    };
    statuses: string[];
    couriers: User[];
    customers: Customer[];
}

// Using Record<string, any> to satisfy FormDataType constraint
type ParcelFormData = Record<string, any>;

export default function ParcelEdit({ parcel, statuses, couriers, customers }: ParcelEditProps) {
    const { data, setData, put, errors, processing, setError, clearErrors } = useForm({
        sender_name: parcel.sender_name,
        sender_address: parcel.sender_address,
        recipient_name: parcel.recipient_name,
        recipient_address: parcel.recipient_address,
        recipient_phone: parcel.recipient_phone || '',
        status: parcel.status,
        weight: parcel.weight || '',
        dimensions: parcel.dimensions || '',
        notes: parcel.notes || '',
        user_id: parcel.user_id || '',
        customer_id: parcel.customer_id || '',
        history_note: '',
    });

    const [statusChanged, setStatusChanged] = useState(false);

    useEffect(() => {
        setStatusChanged(data.status !== parcel.status);
    }, [data.status, parcel.status]);

    function formatStatus(status: string): string {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Form validation
    const validateForm = (): boolean => {
        let isValid = true;
        const formErrors: Record<string, string> = {};
        
        // Required fields validation
        if (!data.status) {
            formErrors.status = 'Status is required';
            isValid = false;
        }
        
        if (!data.sender_name) {
            formErrors.sender_name = 'Sender name is required';
            isValid = false;
        }
        
        if (!data.sender_address) {
            formErrors.sender_address = 'Sender address is required';
            isValid = false;
        }
        
        if (!data.recipient_name) {
            formErrors.recipient_name = 'Recipient name is required';
            isValid = false;
        }
        
        if (!data.recipient_address) {
            formErrors.recipient_address = 'Recipient address is required';
            isValid = false;
        }
        
        // Format validation
        if (data.dimensions && !/^\d+x\d+x\d+$|^\d+x\d+x\d+\s+\w+$/.test(data.dimensions)) {
            formErrors.dimensions = 'Dimensions must be in format: LxWxH (e.g. 30x20x15)';
            isValid = false;
        }
        
        if (data.weight && (isNaN(Number(data.weight)) || Number(data.weight) <= 0)) {
            formErrors.weight = 'Weight must be a positive number';
            isValid = false;
        }
        
        if (data.recipient_phone && !/^\+?[\d\s-()]+$/.test(data.recipient_phone)) {
            formErrors.recipient_phone = 'Please enter a valid phone number';
            isValid = false;
        }
        
        // Set errors if any
        if (!isValid) {
            clearErrors();
            // Cast to any to avoid TypeScript errors with dynamic keys
            Object.entries(formErrors).forEach(([key, value]) => {
                setError(key as any, value);
            });
        }
        
        return isValid;
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        // Client-side validation before submission
        if (validateForm()) {
            put(route('parcels.update', parcel.id), {
                onSuccess: () => {
                    // Form will be reset automatically on success as we'll be redirected
                },
            });
        }
    }

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Parcels', href: route('parcels.index') },
        { title: parcel.tracking_number, href: route('parcels.show', parcel.id) },
        { title: 'Edit', href: route('parcels.edit', parcel.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Parcel ${parcel.tracking_number}`} />
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Parcel</h1>
                    <div className="ml-auto flex gap-4">
                        <Link href={route('parcels.show', parcel.id)}>
                            <Button variant="outline" size="default">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Parcel
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Parcel Edit Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Parcel Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Status */}
                                    <div>
                                        <Label htmlFor="status">Status*</Label>
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
                                        {errors.status && (
                                            <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                                        )}
                                    </div>

                                    {/* Customer Selection */}
                                    <div className="flex gap-6 items-end">
                                        <div className="w-1/2">
                                            <Label htmlFor="customer_id">Customer</Label>
                                            <Select
                                                value={data.customer_id ? String(data.customer_id) : 'none'}
                                                onValueChange={(value) => {
                                                    if (value === 'none') {
                                                        setData('customer_id', '' as any);
                                                    } else {
                                                        setData('customer_id', value);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger id="customer_id">
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_id && (
                                                <p className="text-sm text-red-500 mt-1">{errors.customer_id}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <Link href={route('customers.create')} target="_blank">
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="default"
                                                >
                                                    Add New Customer
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Sender Information */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sender Details</h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="sender_name">Sender Name*</Label>
                                                <Input
                                                    id="sender_name"
                                                    value={data.sender_name}
                                                    onChange={(e) => setData('sender_name', e.target.value)}
                                                />
                                                {errors.sender_name && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.sender_name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Label htmlFor="sender_address">Sender Address*</Label>
                                            <Textarea
                                                id="sender_address"
                                                value={data.sender_address}
                                                onChange={(e) => setData('sender_address', e.target.value)}
                                                rows={3}
                                            />
                                            {errors.sender_address && (
                                                <p className="text-sm text-red-500 mt-1">{errors.sender_address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recipient Information */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recipient Details</h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="recipient_name">Recipient Name*</Label>
                                                <Input
                                                    id="recipient_name"
                                                    value={data.recipient_name}
                                                    onChange={(e) => setData('recipient_name', e.target.value)}
                                                />
                                                {errors.recipient_name && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.recipient_name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="recipient_phone">Recipient Phone</Label>
                                                <Input
                                                    id="recipient_phone"
                                                    value={data.recipient_phone}
                                                    onChange={(e) => setData('recipient_phone', e.target.value)}
                                                />
                                                {errors.recipient_phone && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.recipient_phone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Label htmlFor="recipient_address">Recipient Address*</Label>
                                            <Textarea
                                                id="recipient_address"
                                                value={data.recipient_address}
                                                onChange={(e) => setData('recipient_address', e.target.value)}
                                                rows={3}
                                            />
                                            {errors.recipient_address && (
                                                <p className="text-sm text-red-500 mt-1">{errors.recipient_address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Parcel Information */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Parcel Information</h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="weight">Weight (kg)</Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.weight}
                                                    onChange={(e) => setData('weight', e.target.value)}
                                                />
                                                {errors.weight && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="dimensions">Dimensions (e.g., 30x20x10 cm)</Label>
                                                <Input
                                                    id="dimensions"
                                                    value={data.dimensions}
                                                    onChange={(e) => setData('dimensions', e.target.value)}
                                                    placeholder="e.g. 30x20x15"
                                                />
                                                {errors.dimensions && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.dimensions}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                rows={3}
                                            />
                                            {errors.notes && (
                                                <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Assignment */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignment</h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="user_id">Assigned Courier</Label>
                                                <Select
                                                    value={data.user_id ? data.user_id.toString() : 'none'}
                                                    onValueChange={(value) => {
                                                        if (value === 'none') {
                                                            setData('user_id', null as any);
                                                        } else {
                                                            setData('user_id', parseInt(value));
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger id="user_id">
                                                        <SelectValue placeholder="Select courier" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {couriers.map((courier) => (
                                                            <SelectItem key={courier.id} value={courier.id.toString()}>
                                                                {courier.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.user_id && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.user_id}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Change History Note */}
                                    {statusChanged && (
                                        <div className="mt-4">
                                            <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                                                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                                <AlertDescription>
                                                    You are changing the status from <Badge className="mx-1">{formatStatus(parcel.status)}</Badge> to <Badge className="mx-1">{formatStatus(data.status)}</Badge>
                                                </AlertDescription>
                                            </Alert>
                                            <div className="mt-3">
                                                <Label htmlFor="history_note">Add a note about this status change (optional)</Label>
                                                <Textarea
                                                    id="history_note"
                                                    value={data.history_note}
                                                    onChange={(e) => setData('history_note', e.target.value)}
                                                    placeholder="e.g. Customer requested delivery delay"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                                    <Link href={route('parcels.show', parcel.id)}>
                                        <Button variant="outline" type="button">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>

                    {/* Parcel History Card */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {parcel.history && parcel.history.length > 0 ? (
                                    <div className="relative">
                                        {/* Vertical timeline line */}
                                        <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                                        
                                        {parcel.history.map((historyItem, index, array) => (
                                            <div key={historyItem.id} className={`${index === array.length - 1 ? 'mb-0' : 'mb-6'} flex items-start`}>
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 relative z-10">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300">{index + 1}</span>
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
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">No status changes recorded yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
