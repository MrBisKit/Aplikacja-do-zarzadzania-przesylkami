import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility for classnames

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

export default function Pagination({ links, className }: PaginationProps) {
    if (links.length <= 3) { // Previous, Current Page, Next (or less if at start/end)
        return null;
    }

    return (
        <nav className={cn('flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6', className)}>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    {/* Optional: Add 'Showing X to Y of Z results' text here if needed */}
                </div>
                <div>
                    <span className="relative z-0 inline-flex rounded-md shadow-sm">
                        {links.map((link, index) => {
                            if (link.url === null) {
                                return (
                                    <span
                                        key={`span-${index}`}
                                        aria-disabled="true"
                                        className={cn(
                                            'relative inline-flex cursor-not-allowed items-center rounded-md px-4 py-2 text-sm font-medium text-gray-500 ring-1 ring-inset ring-gray-300 dark:text-gray-400 dark:ring-gray-600',
                                            { 'rounded-l-md': index === 0, 'rounded-r-md': index === links.length - 1 }
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    ></span>
                                );
                            }
                            return (
                                <Link
                                    key={`link-${index}`}
                                    href={link.url}
                                    className={cn(
                                        'relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-800',
                                        { 'bg-indigo-600 text-white focus:outline-indigo-600 dark:bg-indigo-500 dark:text-white': link.active },
                                        { 'rounded-l-md': index === 0, 'rounded-r-md': index === links.length - 1 }
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </span>
                </div>
            </div>
        </nav>
    );
}
