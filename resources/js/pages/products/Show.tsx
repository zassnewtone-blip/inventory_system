import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    DollarSign,
    Edit,
    Layers,
    Package,
    PackageMinus,
    PackagePlus,
    Truck,
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { type Product, type Transaction } from '../../types';

interface Props {
    product: Product;
    recent_transactions: Transaction[];
}

export default function ProductShow({ product, recent_transactions }: Props) {
    const isOutOfStock = product.current_stock <= 0;
    const isLowStock = product.current_stock <= product.minimum_stock && !isOutOfStock;

    return (
        <AppLayout title={`Product Details: ${product.name}`}>
            <Head title={`${product.name} - Details`} />

            <div className="mx-auto max-w-4xl">
                {/* Back Link & Header */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                        >
                            <ArrowLeft size={14} /> Back to Products Catalog
                        </Link>
                        <h1 className="mt-1 text-xl font-bold text-slate-800">{product.name}</h1>
                        <p className="font-mono text-xs text-slate-500">SKU: {product.sku}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/inventory/stock-in"
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            <PackagePlus size={15} />
                            <span>Stock In</span>
                        </Link>
                        <Link
                            href="/inventory/stock-out"
                            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                        >
                            <PackageMinus size={15} />
                            <span>Stock Out</span>
                        </Link>
                        <Link
                            href={`/products/${product.id}/edit`}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                        >
                            <Edit size={15} />
                            <span>Edit</span>
                        </Link>
                    </div>
                </div>

                {/* Main Product Card */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Image & Main Stock Summary */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <Package size={48} className="mx-auto text-slate-300" />
                                    <p className="mt-2 text-xs">No image available</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                                Current Stock Level
                            </span>
                            <div className="mt-1 flex items-baseline justify-between">
                                <span className="text-3xl font-extrabold text-slate-900">
                                    {product.current_stock}{' '}
                                    <span className="text-sm font-normal text-slate-500">{product.unit}</span>
                                </span>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                        isOutOfStock
                                            ? 'bg-rose-100 text-rose-800'
                                            : isLowStock
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Minimum threshold: <strong>{product.minimum_stock} {product.unit}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Product Specifications & Details */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            <h2 className="mb-4 text-sm font-bold text-slate-800">Product Specifications</h2>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <span className="text-slate-400">Unit Price</span>
                                    <p className="mt-1 text-base font-bold text-slate-900">
                                        ₱{product.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <span className="text-slate-400">Inventory Valuation</span>
                                    <p className="mt-1 text-base font-bold text-indigo-700">
                                        ₱{(product.current_stock * product.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <span className="text-slate-400">Category</span>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {product.category?.name || 'Unassigned'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <span className="text-slate-400">Supplier</span>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {product.supplier?.name || 'Unassigned'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-slate-100 pt-4">
                                <span className="text-xs font-semibold text-slate-700">Item Description</span>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                    {product.description || <span className="italic text-slate-400">No description entered.</span>}
                                </p>
                            </div>
                        </div>

                        {/* Recent Transactions for This Product */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            <h3 className="mb-3 text-sm font-bold text-slate-800">Recent Movements</h3>

                            {recent_transactions.length === 0 ? (
                                <p className="py-6 text-center text-xs text-slate-400">
                                    No transaction movements recorded for this item yet.
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recent_transactions.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between py-2.5 text-xs">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                                            t.transaction_type === 'STOCK_IN'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : t.transaction_type === 'STOCK_OUT'
                                                                ? 'bg-rose-100 text-rose-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {t.transaction_type}
                                                    </span>
                                                    <span className="font-mono text-slate-400">{t.reference_number || 'N/A'}</span>
                                                </div>
                                                <p className="mt-1 text-[11px] text-slate-500">
                                                    Stock: {t.previous_stock} → {t.new_stock} • by {t.user_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`text-sm font-bold ${
                                                        t.transaction_type === 'STOCK_IN'
                                                            ? 'text-emerald-600'
                                                            : t.transaction_type === 'STOCK_OUT'
                                                            ? 'text-rose-600'
                                                            : 'text-amber-600'
                                                    }`}
                                                >
                                                    {t.transaction_type === 'STOCK_IN' ? '+' : t.transaction_type === 'STOCK_OUT' ? '-' : '±'}
                                                    {t.quantity}
                                                </span>
                                                <p className="text-[11px] text-slate-400">{t.created_at}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

