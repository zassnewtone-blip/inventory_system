import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    Eye,
    Filter,
    Package,
    Plus,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { type Category, type PaginatedData, type Product, type Supplier } from '../../types';

interface Props {
    products: PaginatedData<Product>;
    categories: Category[];
    suppliers: Supplier[];
    filters: {
        search?: string;
        category_id?: string;
        supplier_id?: string;
        status?: string;
    };
}

export default function ProductsIndex({ products, categories, suppliers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/products',
            {
                search: search || undefined,
                category_id: categoryId || undefined,
                supplier_id: supplierId || undefined,
                status: status || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setCategoryId('');
        setSupplierId('');
        setStatus('');
        router.get('/products', {}, { preserveState: true });
    };

    const confirmDelete = (product: Product) => {
        if (confirm(`Are you sure you want to delete product "${product.name}"? This action cannot be undone.`)) {
            router.delete(`/products/${product.id}`);
        }
    };

    const renderStockBadge = (status: string, current: number, min: number) => {
        if (current <= 0) {
            return (
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                    Out of Stock
                </span>
            );
        }
        if (current <= min) {
            return (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    Low Stock
                </span>
            );
        }
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                In Stock
            </span>
        );
    };

    return (
        <AppLayout title="Product Management">
            <Head title="Products" />

            {/* Header with Title and Add Product */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Products Catalog</h1>
                    <p className="text-xs text-slate-500">
                        Total {products.total} products registered in the inventory database
                    </p>
                </div>
                <Link
                    href="/products/create"
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                    <Plus size={16} />
                    <span>Add New Product</span>
                </Link>
            </div>

            {/* Search and Filters Bar */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, SKU..."
                            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Supplier Filter */}
                    <div>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2 text-xs font-semibold text-white transition hover:bg-slate-900"
                        >
                            <Filter size={14} />
                            <span>Filter</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            title="Reset filters"
                        >
                            <RotateCcw size={15} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Products Table Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Product</th>
                                <th className="py-3 px-4 font-semibold">SKU</th>
                                <th className="py-3 px-4 font-semibold">Category</th>
                                <th className="py-3 px-4 font-semibold">Supplier</th>
                                <th className="py-3 px-4 font-semibold">Unit Price</th>
                                <th className="py-3 px-4 font-semibold">Current Stock</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                                <th className="py-3 px-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/60">
                                    {/* Product Name & Image */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="h-9 w-9 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                                    <Package size={18} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-slate-900">{product.name}</p>
                                                <p className="text-[11px] text-slate-400">Unit: {product.unit}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* SKU */}
                                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                                        {product.sku}
                                    </td>

                                    {/* Category */}
                                    <td className="py-3 px-4 text-slate-600">
                                        {product.category?.name || <span className="text-slate-400 italic">None</span>}
                                    </td>

                                    {/* Supplier */}
                                    <td className="py-3 px-4 text-slate-600">
                                        {product.supplier?.name || <span className="text-slate-400 italic">None</span>}
                                    </td>

                                    {/* Unit Price */}
                                    <td className="py-3 px-4 font-semibold text-slate-900">
                                        ₱{product.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>

                                    {/* Current Stock */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800">
                                                {product.current_stock}
                                            </span>
                                            {renderStockBadge(product.stock_status, product.current_stock, product.minimum_stock)}
                                        </div>
                                    </td>

                                    {/* Active/Inactive */}
                                    <td className="py-3 px-4">
                                        <span
                                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                product.status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {product.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Link
                                                href={`/products/${product.id}`}
                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            <Link
                                                href={`/products/${product.id}/edit`}
                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                                                title="Edit Product"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => confirmDelete(product)}
                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {products.data.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <Package size={32} className="mx-auto text-slate-300" />
                            <p className="mt-2 text-sm font-semibold text-slate-600">No products found</p>
                            <p className="text-xs text-slate-400">Try adjusting your search criteria or add a new product.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                        <span>
                            Showing {products.from || 0} to {products.to || 0} of {products.total} products
                        </span>
                        <div className="flex items-center gap-1">
                            {products.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-lg px-2.5 py-1 font-medium transition ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : link.url
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'cursor-not-allowed text-slate-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

