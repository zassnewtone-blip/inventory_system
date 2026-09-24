import { Head, router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    Filter,
    History,
    RefreshCw,
    RotateCcw,
    Search,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { type PaginatedData, type Transaction } from '../../types';

interface ProductOption {
    id: number;
    name: string;
    sku: string;
}

interface Props {
    transactions: PaginatedData<Transaction>;
    products: ProductOption[];
    filters: {
        search?: string;
        type?: string;
        product_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function TransactionsIndex({ transactions, products, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [productId, setProductId] = useState(filters.product_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const applyFilters = () => {
        router.get(
            '/transactions',
            {
                search: search || undefined,
                type: type || undefined,
                product_id: productId || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const resetFilters = () => {
        setSearch('');
        setType('');
        setProductId('');
        setDateFrom('');
        setDateTo('');
        router.get('/transactions', {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = Boolean(search || type || productId || dateFrom || dateTo);

    return (
        <AppLayout title="Transaction History">
            <Head title="Transactions Log" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Inventory Transaction History</h1>
                        <p className="text-xs text-slate-500">
                            Immutable audit trail of all stock additions, deductions, and adjustments
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
                            >
                                <RotateCcw size={14} />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Search Input */}
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search ref, notes, product..."
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        {/* Transaction Type */}
                        <div>
                            <select
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    router.get(
                                        '/transactions',
                                        {
                                            search: search || undefined,
                                            type: e.target.value || undefined,
                                            product_id: productId || undefined,
                                            date_from: dateFrom || undefined,
                                            date_to: dateTo || undefined,
                                        },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="">All Transaction Types</option>
                                <option value="STOCK_IN">Stock-In (Addition)</option>
                                <option value="STOCK_OUT">Stock-Out (Deduction)</option>
                                <option value="ADJUSTMENT">Stock Adjustment (Audit)</option>
                            </select>
                        </div>

                        {/* Product Filter */}
                        <div>
                            <select
                                value={productId}
                                onChange={(e) => {
                                    setProductId(e.target.value);
                                    router.get(
                                        '/transactions',
                                        {
                                            search: search || undefined,
                                            type: type || undefined,
                                            product_id: e.target.value || undefined,
                                            date_from: dateFrom || undefined,
                                            date_to: dateTo || undefined,
                                        },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="">All Products</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.sku})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range From */}
                        <div className="relative">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    router.get(
                                        '/transactions',
                                        {
                                            search: search || undefined,
                                            type: type || undefined,
                                            product_id: productId || undefined,
                                            date_from: e.target.value || undefined,
                                            date_to: dateTo || undefined,
                                        },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                title="Date From"
                            />
                        </div>

                        {/* Date Range To */}
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    router.get(
                                        '/transactions',
                                        {
                                            search: search || undefined,
                                            type: type || undefined,
                                            product_id: productId || undefined,
                                            date_from: dateFrom || undefined,
                                            date_to: e.target.value || undefined,
                                        },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                title="Date To"
                            />
                            <button
                                type="submit"
                                className="rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                            >
                                Apply
                            </button>
                        </div>
                    </form>
                </div>

                {/* Transactions Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="py-3 px-4">Date & Time</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Product</th>
                                    <th className="py-3 px-4 text-right">Quantity</th>
                                    <th className="py-3 px-4 text-center">Stock Path</th>
                                    <th className="py-3 px-4">Reference / Reason</th>
                                    <th className="py-3 px-4">Cost Info</th>
                                    <th className="py-3 px-4">Staff / User</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {transactions.data.map((t) => (
                                    <tr key={t.id} className="transition hover:bg-slate-50/60">
                                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                                            {t.created_at}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            {t.transaction_type === 'STOCK_IN' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                                                    <ArrowDownLeft size={13} /> Stock-In
                                                </span>
                                            )}
                                            {t.transaction_type === 'STOCK_OUT' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                                                    <ArrowUpRight size={13} /> Stock-Out
                                                </span>
                                            )}
                                            {t.transaction_type === 'ADJUSTMENT' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                                    <RefreshCw size={12} /> Adjustment
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-slate-900">{t.product_name}</p>
                                            {t.product_sku && (
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {t.product_sku}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                                            {t.transaction_type === 'STOCK_IN' && (
                                                <span className="text-emerald-600">+{t.quantity}</span>
                                            )}
                                            {t.transaction_type === 'STOCK_OUT' && (
                                                <span className="text-rose-600">-{t.quantity}</span>
                                            )}
                                            {t.transaction_type === 'ADJUSTMENT' && (
                                                <span className="text-amber-600">±{t.quantity}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                                                <span className="text-slate-400">{t.previous_stock}</span>
                                                <span className="text-slate-300">→</span>
                                                <span className="font-bold text-slate-900">{t.new_stock}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 max-w-[200px]">
                                            {t.reference_number && (
                                                <p className="font-mono text-[11px] font-bold text-slate-800 truncate">
                                                    {t.reference_number}
                                                </p>
                                            )}
                                            {t.reason && (
                                                <p className="text-[11px] text-slate-600 truncate">{t.reason}</p>
                                            )}
                                            {t.notes && (
                                                <p className="text-[10px] italic text-slate-400 truncate">{t.notes}</p>
                                            )}
                                            {!t.reference_number && !t.reason && !t.notes && (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                                            {t.total_cost ? (
                                                <div>
                                                    <span className="font-bold text-slate-900">
                                                        ₱{Number(t.total_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    {t.unit_cost && (
                                                        <span className="block text-[10px] text-slate-400">
                                                            @ ₱{Number(t.unit_cost).toFixed(2)}/u
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 text-slate-700">
                                                <UserIcon size={12} className="text-slate-400" />
                                                {t.user_name}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {transactions.data.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <History size={32} className="mx-auto text-slate-300" />
                            <p className="mt-2 text-sm font-semibold text-slate-600">No transactions recorded</p>
                            <p className="text-xs text-slate-400">
                                Try changing your filter parameters or record a new stock transaction.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                            <span>
                                Showing {transactions.from || 0} to {transactions.to || 0} of {transactions.total}{' '}
                                transactions
                            </span>
                            <div className="flex items-center gap-1">
                                {transactions.links.map((link, idx) => (
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
            </div>
        </AppLayout>
    );
}

