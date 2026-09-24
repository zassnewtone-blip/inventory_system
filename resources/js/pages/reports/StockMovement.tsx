import { Head, router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    Download,
    MoveHorizontal,
    Printer,
    RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';

interface MovementProduct {
    id: number;
    name: string;
    sku: string;
    unit: string;
    stock_in: number;
    stock_out: number;
    adjustments: number;
    current_stock: number;
}

interface Props {
    products: MovementProduct[];
    filters: {
        date_from: string;
        date_to: string;
    };
}

export default function StockMovement({ products, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const applyDateRange = (from: string, to: string) => {
        setDateFrom(from);
        setDateTo(to);
        router.get(
            '/reports/stock-movement',
            { date_from: from, date_to: to },
            { preserveState: true, replace: true }
        );
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyDateRange(dateFrom, dateTo);
    };

    const setPreset = (days: number) => {
        const to = new Date().toISOString().split('T')[0];
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        const from = fromDate.toISOString().split('T')[0];
        applyDateRange(from, to);
    };

    const setThisMonth = () => {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const to = new Date().toISOString().split('T')[0];
        applyDateRange(from, to);
    };

    const totalIn = products.reduce((acc, p) => acc + (p.stock_in || 0), 0);
    const totalOut = products.reduce((acc, p) => acc + (p.stock_out || 0), 0);
    const totalAdjustments = products.reduce((acc, p) => acc + (p.adjustments || 0), 0);
    const netFlow = totalIn - totalOut;

    const exportToCSV = () => {
        const headers = [
            'SKU',
            'Product Name',
            'Stock In (+)',
            'Stock Out (-)',
            'Net Flow',
            'Adjustment Count',
            'Current Stock',
            'Unit',
        ];

        const rows = products.map((p) => [
            `"${p.sku.replace(/"/g, '""')}"`,
            `"${p.name.replace(/"/g, '""')}"`,
            p.stock_in,
            p.stock_out,
            p.stock_in - p.stock_out,
            p.adjustments,
            p.current_stock,
            `"${p.unit}"`,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
            'download',
            `stock_movement_${filters.date_from}_to_${filters.date_to}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout title="Stock Movement Report">
            <Head title="Stock Movement Report" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Stock Movement Report</h1>
                        <p className="text-xs text-slate-500">
                            Flow of goods received, dispensed, and reconciled over time
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
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
                        >
                            <Printer size={14} />
                            <span>Print</span>
                        </button>
                    </div>
                </div>

                {/* Date Controls & Presets */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Custom Date Form */}
                        <form onSubmit={handleCustomSubmit} className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500">Period:</span>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <span className="text-xs text-slate-400">to</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                            >
                                Apply Period
                            </button>
                        </form>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400">Quick:</span>
                            <button
                                type="button"
                                onClick={() => setPreset(7)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
                            >
                                7 Days
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreset(30)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
                            >
                                30 Days
                            </button>
                            <button
                                type="button"
                                onClick={setThisMonth}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
                            >
                                This Month
                            </button>
                        </div>
                    </div>
                </div>

                {/* Movement Metrics Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Inbound Received</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <ArrowDownLeft size={18} />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-emerald-600">
                            +{Number(totalIn).toLocaleString()}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">Units received via stock-in</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Outbound Dispensed</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <ArrowUpRight size={18} />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-rose-600">
                            -{Number(totalOut).toLocaleString()}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">Units dispensed or deducted</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Net Inventory Velocity</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <MoveHorizontal size={18} />
                            </div>
                        </div>
                        <p
                            className={`mt-2 text-2xl font-extrabold ${
                                netFlow >= 0 ? 'text-indigo-600' : 'text-amber-600'
                            }`}
                        >
                            {netFlow >= 0 ? `+${netFlow.toLocaleString()}` : netFlow.toLocaleString()}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">Difference (Stock In minus Stock Out)</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Audit Adjustments</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <RefreshCw size={18} />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-slate-800">
                            {Number(totalAdjustments).toLocaleString()}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">Reconciliations performed</p>
                    </div>
                </div>

                {/* Movement Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="py-3 px-4">Product Name / SKU</th>
                                    <th className="py-3 px-4 text-right">Inbound (+)</th>
                                    <th className="py-3 px-4 text-right">Outbound (-)</th>
                                    <th className="py-3 px-4 text-right">Net Flow</th>
                                    <th className="py-3 px-4 text-center">Adjustments</th>
                                    <th className="py-3 px-4 text-right">Current Available Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {products.map((p) => {
                                    const net = p.stock_in - p.stock_out;
                                    return (
                                        <tr key={p.id} className="transition hover:bg-slate-50/60">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900">{p.name}</p>
                                                <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                +{p.stock_in} {p.unit}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                                                -{p.stock_out} {p.unit}
                                            </td>
                                            <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                                                <span
                                                    className={
                                                        net > 0
                                                            ? 'text-emerald-700'
                                                            : net < 0
                                                            ? 'text-rose-700'
                                                            : 'text-slate-400'
                                                    }
                                                >
                                                    {net > 0 ? `+${net}` : net} {p.unit}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                {p.adjustments > 0 ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                        {p.adjustments} audit{p.adjustments > 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                                                {p.current_stock} {p.unit}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-200 bg-slate-50/80 font-bold text-slate-900">
                                <tr>
                                    <td className="py-3 px-4 uppercase tracking-wider text-xs">
                                        Total Velocity Summary
                                    </td>
                                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 whitespace-nowrap">
                                        +{Number(totalIn).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right font-extrabold text-rose-600 whitespace-nowrap">
                                        -{Number(totalOut).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                                        {netFlow >= 0 ? `+${netFlow.toLocaleString()}` : netFlow.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-center">{totalAdjustments}</td>
                                    <td className="py-3 px-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {products.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <MoveHorizontal size={32} className="mx-auto text-slate-300" />
                            <p className="mt-2 text-sm font-semibold text-slate-600">No stock movement recorded</p>
                            <p className="text-xs text-slate-400">
                                No stock transactions occurred within the selected date timeframe.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

