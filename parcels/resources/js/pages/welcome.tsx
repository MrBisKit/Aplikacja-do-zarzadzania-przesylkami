import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

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
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row justify-center">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d] flex flex-col justify-center">
                            <div className="flex items-center justify-center"><AppLogo /></div>
                            <h1 className="text-3xl font-bold mb-4 text-[#f53003] dark:text-[#FF4433]">Track Every Delivery, Elevate Your Service</h1>
                            <p className="mb-6 text-[#706f6c] dark:text-[#A1A09A] text-lg">
                                Parcels provides courier companies with a powerful, intuitive platform to streamline package tracking and delivery management.
                            </p>
                            <div className="mb-8">
                                <h2 className="text-xl font-medium mb-3">Why Choose Parcels?</h2>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center gap-2">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f53003] dark:bg-[#FF4433] flex items-center justify-center text-white">✓</span>
                                        <span>Real-time tracking with live updates</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f53003] dark:bg-[#FF4433] flex items-center justify-center text-white">✓</span>
                                        <span>Multi-role access for admins, couriers, and warehouse staff</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f53003] dark:bg-[#FF4433] flex items-center justify-center text-white">✓</span>
                                        <span>Optimized route planning and delivery scheduling</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex gap-4 text-sm leading-normal">
                                <a
                                    href="#"
                                    className="inline-block rounded-sm border border-[#f53003] bg-[#f53003] px-5 py-2 text-sm font-medium text-white hover:bg-[#d62a00] transition-colors duration-200 dark:border-[#FF4433] dark:bg-[#FF4433] dark:hover:bg-[#e53b2b]"
                                >
                                    Get Started
                                </a>
                                <a
                                    href="#"
                                    className="inline-block rounded-sm border border-[#1b1b18] px-5 py-2 text-sm font-medium hover:bg-[#f8f8f7] transition-colors duration-200 dark:border-[#eeeeec] dark:text-[#eeeeec] dark:hover:bg-[#252523]"
                                >
                                    Learn More
                                </a>
                            </div>
                        </div>
                        <div className="relative w-full lg:w-[438px] aspect-square overflow-hidden rounded-t-lg lg:mb-0 lg:-ml-px lg:rounded-t-none lg:rounded-r-lg flex items-center justify-center">
                            <div className="w-full h-full flex items-center justify-center">
                                <img 
                                    src="/parcels.webp" 
                                    alt="Parcels Logo" 
                                    className="object-contain max-w-full max-h-full" 
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
