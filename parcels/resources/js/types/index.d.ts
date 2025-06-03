import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    routeName?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role: string; // Added for user roles
    [key: string]: unknown; // This allows for additional properties...
}

export interface Customer {
    id: number;
    name: string;
    address: string;
    phone_number: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    parcels?: Parcel[];
    [key: string]: unknown;
}

export interface Parcel {
    id: number;
    tracking_number: string;
    sender_name: string;
    sender_address: string;
    recipient_name: string;
    recipient_address: string;
    recipient_phone?: string | null;
    status: string;
    weight?: number | null;
    dimensions?: string | null;
    notes?: string | null;
    user_id?: number | null; // Courier ID
    customer_id?: number | null;
    created_at: string;
    updated_at: string;
    courier?: User | null;
    customer?: Customer | null;
    history?: ParcelHistory[];
    available_couriers?: User[]; // Available couriers for assignment
}

export interface ParcelHistory {
    id: number;
    parcel_id: number;
    old_status: string | null;
    new_status: string;
    user_id: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    user?: User | null;
}

export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
