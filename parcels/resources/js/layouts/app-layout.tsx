import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { PropsWithChildren, ReactNode, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner'; // Correct import for toast
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string; // Added title prop
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { props: { flash } } = usePage<{ flash?: { success?: string; error?: string; warning?: string; info?: string } }>();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
        // Clear flash messages after displaying to prevent re-triggering on component re-renders without new flash data
        // This might require a more robust solution if Inertia doesn't clear them automatically after access,
        // or if you navigate client-side without a full page reload that would clear them.
        // For now, we assume Inertia handles this or subsequent page loads will have fresh/no flash data.
    }, [flash]);

    return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
        <Toaster richColors position="top-right" />
    </AppLayoutTemplate>
    );
};
