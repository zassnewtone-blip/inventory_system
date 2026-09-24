import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, ArrowRight, PackageMinus, Save } from 'lucide-react';
import { useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';

interface ProductOption {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    unit: string;
}

interface Props {
    products: ProductOption[];
}

const COMMON_REASONS = [
    'Sale / Customer Order',
    'Damaged / Defective Stock',
    'Expired Product',
    'Internal Company Use',
    'Store / Warehouse Transfer',
    'Customer Return to Supplier',
    'Sample / Demonstration',
    'Other',
];

export default function StockOut({ products }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        quantity: '1',
        reason: 'Sale / Customer Order',
        reference_number: '',
        notes: '',
    });

    const selectedProduct = useMemo(() => {
        return products.find((p) => String(p.id) === String(data.product_id)) || null;
    }, [products, data.product_id]);

    const qty = parseInt(data.quantity || '0', 10);
    const availableStock = selectedProduct ? selectedProduct.current_stock : 0;
    const isOverStock = selectedProduct ? qty > availableStock : false;
    const projectedStock = selectedProduct ? availableStock - (isNaN(qty) ? 0 : qty) : null;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isOverStock || qty <= 0) return;

        post('/inventory/stock-out', {
            onSuccess: () => {
                reset('quantity', 'reference_number', 'notes');
            },
        });
    };

    return (
        <AppLayout title="Stock-Out Entry">
            <Head title="Stock Out" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-800">Record Stock-Out Transaction</h1>
                    <p className="text-xs text-slate-500">
                        Dispense or deduct inventory items for sales, transfers, damages, or shrinkage
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Select Product */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                <PackageMinus size={16} />
                            </div>
                            <h2 className="text-sm font-bold text-slate-800">Product Selection</h2>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Select Product to Deduct <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">-- Choose Product --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id} disabled={p.current_stock <= 0}>
                                            {p.name} ({p.sku}) — Available: {p.current_stock} {p.unit}
                                            {p.current_stock <= 0 ? ' [OUT OF STOCK]' : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="mt-1 text-xs text-rose-600">{errors.product_id}</p>}
                            </div>

                            {/* Live Deduction Preview Banner */}
                            {selectedProduct && (
                                <div
                                    className={`rounded-xl border p-4 transition ${
                                        isOverStock
                                            ? 'border-rose-300 bg-rose-50/70 text-rose-900'
                                            : 'border-slate-200 bg-slate-50/70 text-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                                                Available In Stock
                                            </span>
                                            <p className="text-lg font-bold text-slate-800">
                                                {selectedProduct.current_stock} {selectedProduct.unit}
                                            </p>
                                        </div>

                                        <div className="flex items-center font-bold text-rose-600">
                                            <span className="text-sm">- {qty || 0}</span>
                                            <ArrowRight size={18} className="mx-2" />
                                        </div>

                                        <div className="text-center">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                                                Remaining After Out
                                            </span>
                                            <p
                                                className={`text-xl font-extrabold ${
                                                    isOverStock ? 'text-rose-600' : 'text-slate-900'
                                                }`}
                                            >
                                                {projectedStock} {selectedProduct.unit}
                                            </p>
                                        </div>
                                    </div>

                                    {isOverStock && (
                                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-100/70 p-2.5 text-xs font-medium text-rose-800">
                                            <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                                            <span>
                                                Insufficient stock! Cannot deduct {qty} units when only{' '}
                                                {availableStock} are in inventory.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quantity & Reason */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Quantity & Reason</h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Quantity to Deduct <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={availableStock > 0 ? availableStock : undefined}
                                    required
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    placeholder="Enter quantity"
                                    className={`w-full rounded-xl border py-2.5 px-3 text-xs outline-none focus:ring-2 ${
                                        isOverStock
                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                                            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                    }`}
                                />
                                {errors.quantity && <p className="mt-1 text-xs text-rose-600">{errors.quantity}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Reason for Deduction <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    {COMMON_REASONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                {errors.reason && <p className="mt-1 text-xs text-rose-600">{errors.reason}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Reference & Notes */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Tracking Reference & Notes</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Reference / Order / Receipt #
                                </label>
                                <input
                                    type="text"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    placeholder="e.g., ORD-2026-8834"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.reference_number && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.reference_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Transaction Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Optional explanation or customer destination notes..."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.notes && <p className="mt-1 text-xs text-rose-600">{errors.notes}</p>}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing || !data.product_id || qty <= 0 || isOverStock}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white shadow-md shadow-rose-600/30 transition hover:bg-rose-700 disabled:opacity-50"
                    >
                        <Save size={16} />
                        <span>{processing ? 'Processing Outbound...' : 'Complete Stock-Out Transaction'}</span>
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}

