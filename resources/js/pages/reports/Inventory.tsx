import { Head, router } from '@inertiajs/react';
import {
    Boxes,
    CircleDollarSign,
    Download,
    FileSpreadsheet,
    Package,
    Printer,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';

interface ReportProduct {
    id: number;
    name: string;
    sku: string;
    category: string;
    supplier: string;
    current_stock: number;
    minimum_stock: number;
    unit_price: number;
    inventory_value: number;
    unit: string;
    status: string;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface CategoryOption {
    id: number;
    name: string;
}

interface Props {
    products: ReportProduct[];
    categories: CategoryOption[];
    total_value: number;
    total_stock: number;
    filters: {
        search?: string;
        category_id?: string;
    };
}

export default function InventoryReport({
    products,
    categories,
    total_value,
    total_stock,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/reports/inventory',
            {
                search: search || undefined,
                category_id: categoryId || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const exportToCSV = () => {
        const headers = [
            'SKU',
            'Product Name',
            'Category',
            'Supplier',
            'Current Stock',
            'Unit',
            'Unit Price (PHP)',
            'Inventory Value (PHP)',
            'Status',
            'Stock Condition',
        ];

        const rows = products.map((p) => [
            `"${p.sku.replace(/"/g, '""')}"`,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.category.replace(/"/g, '""')}"`,
            `"${p.supplier.replace(/"/g, '""')}"`,
            p.current_stock,
            `"${p.unit}"`,
            p.unit_price.toFixed(2),
            p.inventory_value.toFixed(2),
            `"${p.status}"`,
            `"${p.stock_status.replace(/_/g, ' ').toUpperCase()}"`,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
            'download',
            `inventory_valuation_report_${new Date().toISOString().split('T')[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printReport = () => {
        window.print();
    };

    const lowStockCount = products.filter(
        (p) => p.stock_status === 'low_stock' || p.stock_status === 'out_of_stock'
    ).length;

    return (
        <AppLayout title="Inventory Valuation Report">
            <Head title="Inventory Valuation Report" />

            <div className="space-y-6">
                {/* Header & Print/Export actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Inventory Valuation Report</h1>
                        <p className="text-xs text-slate-500">
                            Current asset appraisal, stock levels, and category asset distribution
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-700 transition"
                        >
                            <Download size={14} className="text-emerald-600" />
                            <span>Export CSV</span>
                        </button>
                        <button
                            onClick={printReport}
                            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
                        >
                            <Printer size={14} />
                            <span>Print Report</span>
                        </button>
                    </div>
                </div>

                {/* KPI Overview Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Total Inventory Valuation</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <CircleDollarSign size={18} />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-slate-900">
                            ₱{Number(total_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">Sum of (Stock × Unit Price)</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Total Physical Units</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Boxes size={18} />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-slate-900">
                            {Number(total_stock).toLocaleString()}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">Total counted items across all SKUs</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Active SKUs Listed</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                <Package size={18} />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-slate-900">{products.length}</p>
                        <p className="mt-1 text-[11px] text-slate-400">Cataloged product items in report</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Attention Required</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <ShieldAlert size={18} />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-amber-600">{lowStockCount}</p>
                        <p className="mt-1 text-[11px] text-slate-400">Items at or below safety stock threshold</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by SKU or product name..."
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="w-full sm:w-64">
                            <select
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    router.get(
                                        '/reports/inventory',
                                        {
                                            search: search || undefined,
                                            category_id: e.target.value || undefined,
                                        },
                                        { preserveState: true, replace: true }
                                    );
                                }}
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

                        <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Valuation Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="py-3 px-4">Product / SKU</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Supplier</th>
                                    <th className="py-3 px-4 text-right">In Stock</th>
                                    <th className="py-3 px-4 text-right">Unit Price</th>
                                    <th className="py-3 px-4 text-right">Inventory Valuation</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {products.map((p) => (
                                    <tr key={p.id} className="transition hover:bg-slate-50/60">
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-slate-900">{p.name}</p>
                                            <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">{p.category}</td>
                                        <td className="py-3 px-4 text-slate-500">{p.supplier}</td>
                                        <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                                            <span
                                                className={
                                                    p.current_stock <= 0
                                                        ? 'text-rose-600'
                                                        : p.current_stock <= p.minimum_stock
                                                        ? 'text-amber-600'
                                                        : 'text-slate-900'
                                                }
                                            >
                                                {p.current_stock} {p.unit}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap text-slate-600">
                                            ₱{Number(p.unit_price).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap text-slate-900">
                                            ₱{Number(p.inventory_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            {p.stock_status === 'in_stock' && (
                                                <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                                    In Stock
                                                </span>
                                            )}
                                            {p.stock_status === 'low_stock' && (
                                                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                                    Low Stock
                                                </span>
                                            )}
                                            {p.stock_status === 'out_of_stock' && (
                                                <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-200 bg-slate-50/80 font-bold text-slate-900">
                                <tr>
                                    <td colSpan={3} className="py-3 px-4 uppercase tracking-wider text-xs">
                                        Total Inventory Portfolio
                                    </td>
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                        {Number(total_stock).toLocaleString()} units
                                    </td>
                                    <td className="py-3 px-4 text-right">—</td>
                                    <td className="py-3 px-4 text-right text-emerald-700 font-extrabold whitespace-nowrap">
                                        ₱{Number(total_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {products.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <FileSpreadsheet size={32} className="mx-auto text-slate-300" />
                            <p className="mt-2 text-sm font-semibold text-slate-600">No products match this report query</p>
                            <p className="text-xs text-slate-400">Try choosing a different category or clearing search.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

