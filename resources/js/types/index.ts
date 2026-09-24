export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string | null;
    is_active: boolean;
    products_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Supplier {
    id: number;
    name: string;
    contact_person?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    is_active: boolean;
    products_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    category_id?: number | null;
    supplier_id?: number | null;
    description?: string | null;
    unit_price: number;
    current_stock: number;
    minimum_stock: number;
    unit: string;
    image_path?: string | null;
    image_url?: string | null;
    status: 'active' | 'inactive';
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
    category?: { id: number; name: string } | null;
    supplier?: { id: number; name: string } | null;
    created_at?: string;
    updated_at?: string;
}

export interface Transaction {
    id: number;
    product_name: string;
    product_sku?: string;
    transaction_type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
    quantity: number;
    previous_stock: number;
    new_stock: number;
    unit_cost?: number | null;
    total_cost?: number | null;
    supplier_name?: string | null;
    reference_number?: string | null;
    reason?: string | null;
    notes?: string | null;
    user_name: string;
    created_at: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface SharedProps {
    name: string;
    auth: {
        user: User | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
}
