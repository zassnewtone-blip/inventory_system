import { Head, Link } from '@inertiajs/react';
import {
    AlertOctagon,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Download,
    PackagePlus,
    Printer,
    ShieldAlert,
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';

interface LowStockProduct {
    id: number;
    name: string;
    sku: string;
    category: string;
    supplier: string;
    current_stock: number;
    minimum_stock: number;
    unit: string;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface Props {
    products: LowStockProduct[];
}

export default function LowStock({ products }: Props) {
    const outOfStockCount = products.filter((p) => p.current_stock <= 0).length;
    const lowStockCount = products.filter(
        (p) => p.current_stock > 0 && p.current_stock <= p.minimum_stock
    ).length;

    const exportToCSV = () => {
        const headers = [
            'SKU',
            'Product Name',
            'Category',
            'Supplier',
            'Current Stock',
            'Minimum Safety Stock',
            'Required Restock Deficit',
            'Unit',
            'Condition',
        ];

        const rows = products.map((p) => {
            const deficit = Math.max(0, p.minimum_stock - p.current_stock);
            return [
                `"${p.sku.replace(/"/g, '""')}"`,
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.category.replace(/"/g, '""')}"`,
                `"${p.supplier.replace(/"/g, '""')}"`,
                p.current_stock,
                p.minimum_stock,
                deficit,
                `"${p.unit}"`,
                `"${p.stock_status.replace(/_/g, ' ').toUpperCase()}"`,
            ];
        });

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
            'download',
            `low_stock_restock_report_${new Date().toISOString().split('T')[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout title="Low Stock Alerts & Restock">
            <Head title="Low & Out of Stock Alerts" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Low & Depleted Stock Monitor</h1>
                        <p className="text-xs text-slate-500">
                            Actionable inventory list for replenishment and purchase order generation
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-700 transition"
                        >
                            <Download size={14} className="text-emerald-600" />
                            <span>Export Replenishment List</span>
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
                        >
                            <Printer size={14} />
                            <span>Print</span>
                        </button>
                    </div>
                </div>

                {/* Status Banners */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                            <AlertOctagon size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                                Critical: Out of Stock
                            </span>
                            <p className="text-2xl font-extrabold text-rose-900">
                                {outOfStockCount} {outOfStockCount === 1 ? 'Product' : 'Products'}
                            </p>
                            <p className="text-xs text-rose-600">
                                Zero available stock. Cannot fulfill incoming customer orders.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                Warning: Low Stock Threshold
                            </span>
                            <p className="text-2xl font-extrabold text-amber-900">
                                {lowStockCount} {lowStockCount === 1 ? 'Product' : 'Products'}
                            </p>
                            <p className="text-xs text-amber-600">
                                Available inventory is at or below recommended reorder point.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="py-3 px-4">Product / SKU</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Supplier</th>
                                    <th className="py-3 px-4 text-right">In Stock</th>
                                    <th className="py-3 px-4 text-right">Min Reorder</th>
                                    <th className="py-3 px-4 text-right">Replenish Deficit</th>
                                    <th className="py-3 px-4 text-center">Condition</th>
                                    <th className="py-3 px-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {products.map((p) => {
                                    const deficit = Math.max(0, p.minimum_stock - p.current_stock);
                                    const isOut = p.current_stock <= 0;
                                    return (
                                        <tr key={p.id} className="transition hover:bg-slate-50/60">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900">{p.name}</p>
                                                <span className="font-mono text-[10px] text-slate-400">
                                                    {p.sku}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">{p.category}</td>
                                            <td className="py-3 px-4 text-slate-500">{p.supplier}</td>
                                            <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                                                <span className={isOut ? 'text-rose-600' : 'text-amber-600'}>
                                                    {p.current_stock} {p.unit}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                                                {p.minimum_stock} {p.unit}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                                                +{deficit} {p.unit} needed
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                {isOut ? (
                                                    <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                                                        OUT OF STOCK
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                                        LOW STOCK
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <Link
                                                    href="/inventory/stock-in"
                                                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                                                >
                                                    <PackagePlus size={14} />
                                                    <span>Restock</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {products.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                            <p className="mt-2 text-sm font-semibold text-slate-800">
                                Inventory is well stocked!
                            </p>
                            <p className="text-xs text-slate-400">
                                No products are currently below their minimum safety stock levels.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

