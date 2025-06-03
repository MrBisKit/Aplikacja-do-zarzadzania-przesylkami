import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useState } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            <div className="flex items-center">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1" 
                    onClick={() => setIsScannerOpen(true)}
                >
                    <QrCode className="h-4 w-4" />
                    <span className="hidden sm:inline">Scan Barcode</span>
                </Button>
                
                <BarcodeScanner 
                    isOpen={isScannerOpen} 
                    onClose={() => setIsScannerOpen(false)} 
                />
            </div>
        </header>
    );
}
