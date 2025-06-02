import { type SharedData } from '@/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react'; // For loading spinner in button
import { Head, Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [showTrackingForm, setShowTrackingForm] = useState(false);
    const [trackingNumberInput, setTrackingNumberInput] = useState('');
    const [trackingResult, setTrackingResult] = useState<object | null>(null);
    const [trackingError, setTrackingError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTrackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setTrackingResult(null);
        setTrackingError(null);
        if (!trackingNumberInput.trim()) {
            setTrackingError('Please enter a tracking number.');
            setIsLoading(false);
            return;
        }

        try {
            // The route() helper is not available client-side for API routes like this directly
            // unless you have Ziggy or a similar package installed and configured.
            // We'll construct the URL manually.
            const response = await fetch(`/track-parcel/${encodeURIComponent(trackingNumberInput)}`);

            if (!response.ok) {
                const errorData = await response.json();
                setTrackingError(errorData.message || `Error: ${response.status}`);
                setTrackingResult(null);
            } else {
                const data = await response.json();
                setTrackingResult(data);
                setTrackingError(null);
            }
        } catch (error) {
            console.error('Tracking API call failed:', error);
            setTrackingError('Failed to retrieve tracking information. Please try again later.');
            setTrackingResult(null);
        }
        setIsLoading(false);
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Log in
                                </Link>
                                <Button 
                                    onClick={() => setShowTrackingForm(true)}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal  hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#00000] dark:hover:border-[#62605b]"
                                >
                                    Track Parcel
                                </Button>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row justify-center">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-10 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d] flex flex-col justify-center gap-2">
                            {showTrackingForm ? (
                                <Card className="w-full max-w-md mx-auto">
                                    <CardHeader>
                                        <div className="flex items-center justify-center mb-4"><AppLogo /></div>
                                        <CardTitle className="text-2xl text-center">Track Your Parcel</CardTitle>
                                        <CardDescription className="text-center">
                                            Enter your tracking number below to see its status.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleTrackSubmit} className="space-y-4">
                                            <div>
                                                <Input
                                                    type="text"
                                                    name="trackingNumber"
                                                    id="trackingNumber"
                                                    value={trackingNumberInput}
                                                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                                                    placeholder="Enter your tracking number"
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => { setShowTrackingForm(false); setTrackingResult(null); setTrackingError(null); setTrackingNumberInput(''); }}
                                                    disabled={isLoading}
                                                    className="w-full sm:w-auto"
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full sm:w-auto"
                                                >
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                                                    {isLoading ? 'Tracking...' : 'Track Parcel'}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                    {trackingResult && (
                                        <CardFooter className="flex-col items-start gap-2 pt-4">
                                            <h3 className="text-lg font-medium">Parcel Status</h3>
                                            <Alert variant="default" className="w-full bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50">
                                                <AlertDescription className="text-green-600 dark:text-green-400">
                                                    <div className="space-y-1 text-sm">
                                                        <p><strong>Tracking Number:</strong> {(trackingResult as any).tracking_number}</p>
                                                        <p><strong>Status:</strong> {(trackingResult as any).status}</p>
                                                        <p><strong>Weight:</strong> {(trackingResult as any).weight} kg</p>
                                                        <p><strong>Dimensions:</strong> {(trackingResult as any).dimensions}</p>
                                                        <p><strong>Created At:</strong> {new Date((trackingResult as any).created_at).toLocaleString()}</p>
                                                        <p><strong>Last Updated:</strong> {new Date((trackingResult as any).updated_at).toLocaleString()}</p>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        </CardFooter>
                                    )}
                                    {trackingError && (
                                        <CardFooter className="flex-col items-start gap-2 pt-4">
                                             <Alert variant="destructive" className="w-full">
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription>
                                                    {trackingError}
                                                </AlertDescription>
                                            </Alert>
                                        </CardFooter>
                                    )}
                                </Card>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-2"><AppLogo /></div>
                                    <h1 className="font-medium">Track Every Delivery, Elevate Your Service</h1>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                        Parcels provides courier companies with a powerful, intuitive platform to streamline package tracking and delivery management.
                                    </p>
                                    <ul className="flex flex-col">
                                        <li className="relative flex items-center gap-4 py-2 before:absolute before:top-1/2 before:bottom-0 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                            <span className="relative bg-white py-1 dark:bg-[#161615]">
                                                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
                                                </span>
                                            </span>
                                            <span>
                                            Real-time tracking with live updates
                                            </span>
                                        </li>
                                        <li className="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                            <span className="relative bg-white py-1 dark:bg-[#161615]">
                                                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
                                                </span>
                                            </span>
                                            <span>
                                            Optimized delivery scheduling
                                            </span>
                                        </li>
                                    </ul>
                                </>
                            )}
                        </div>
                        <div className="relative w-full lg:w-[438px] aspect-square overflow-hidden rounded-t-lg lg:mb-0 lg:-ml-px lg:rounded-t-none lg:rounded-r-lg flex items-center justify-center">
                            <div className="w-full h-full flex items-center justify-center">
                                <img 
                                    src="/parcels.webp" 
                                    alt="Parcels Logo" 
                                    className="object-cover max-w-full max-h-full" 
                                />
                            </div>
                            <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-t-none lg:rounded-r-lg dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]" />
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
