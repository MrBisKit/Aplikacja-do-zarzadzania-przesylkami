import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { Parcel } from '@/types'; // Assuming Parcel type is defined in types/index.d.ts
import { useState } from 'react';
import { Loader2 } from 'lucide-react'; // Assuming lucide-react is used

interface ParcelShowProps {
    parcel: Parcel;
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

export default function ParcelShow({ parcel }: ParcelShowProps) {
    const breadcrumbs = [
        { title: 'Parcels', href: route('parcels.index') },
        { title: `Details for ${parcel.tracking_number}`, href: route('parcels.show', parcel.id) },
    ];

    const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Parcel ${parcel.tracking_number}`} />
            <div className="p-4">
                <div className="container mx-auto py-4">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold">Parcel Details</h1>
                        <div className="ml-auto flex gap-4">
                            <Button
                                variant="default"
                                onClick={() => {
                                    setIsGeneratingLabel(true);
                                    window.open(route('parcels.label', parcel.id), '_blank');
                                    // Reset loading state after a short delay, as we don't get direct feedback from the new tab
                                    setTimeout(() => {
                                        setIsGeneratingLabel(false);
                                    }, 3000); // Adjust delay as needed (e.g., 3-5 seconds)
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
                            <Button variant="outline">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Parcels
                            </Button>
                        </Link>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tracking Number: {parcel.tracking_number}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Status</h3>
                                    <p className="text-muted-foreground">{formatStatus(parcel.status)}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Sender</h3>
                                    <p className="text-muted-foreground">{parcel.sender_name}</p>
                                    <p className="text-sm text-muted-foreground">{parcel.sender_address}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Recipient</h3>
                                    <p className="text-muted-foreground">{parcel.recipient_name}</p>
                                    <p className="text-sm text-muted-foreground">{parcel.recipient_address}</p>
                                    {parcel.recipient_phone && <p className="text-sm text-muted-foreground">Phone: {parcel.recipient_phone}</p>}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Weight</h3>
                                    <p className="text-muted-foreground">{parcel.weight ? `${parcel.weight} kg` : 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Dimensions</h3>
                                    <p className="text-muted-foreground">{parcel.dimensions || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Assigned Courier</h3>
                                    <p className="text-muted-foreground">{parcel.courier?.name || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Customer</h3>
                                    <p className="text-muted-foreground">{parcel.customer?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Notes</h3>
                                    <p className="text-muted-foreground">{parcel.notes || 'No notes'}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Created At</h3>
                                    <p className="text-muted-foreground">{formatDate(parcel.created_at)}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Last Updated</h3>
                                    <p className="text-muted-foreground">{formatDate(parcel.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
