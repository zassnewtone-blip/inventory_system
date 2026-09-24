import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, DollarSign, Package, PackagePlus, Save, Truck } from 'lucide-react';
import { useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { type Supplier } from '../../types';

interface ProductOption {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    unit: string;
    unit_price: number;
}

interface Props {
    products: ProductOption[];
    suppliers: Supplier[];
}

export default function StockIn({ products, suppliers }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        supplier_id: '',
        quantity: '1',
        unit_cost: '',
        reference_number: '',
        notes: '',
    });

    const selectedProduct = useMemo(() => {
        return products.find((p) => String(p.id) === String(data.product_id)) || null;
    }, [products, data.product_id]);

    const qty = parseInt(data.quantity || '0', 10);
    const unitCost = parseFloat(data.unit_cost || '0');
    const totalCost = !isNaN(qty) && !isNaN(unitCost) ? qty * unitCost : 0;
    const projectedStock = selectedProduct ? selectedProduct.current_stock + (isNaN(qty) ? 0 : qty) : null;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory/stock-in', {
            onSuccess: () => {
                reset('quantity', 'unit_cost', 'reference_number', 'notes');
            },
        });
    };

    return (
        <AppLayout title="Stock-In Entry">
            <Head title="Stock In" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-800">Record Stock-In Transaction</h1>
                    <p className="text-xs text-slate-500">
                        Receive inventory items into warehouse storage and increment quantity
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Select Product */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <PackagePlus size={16} />
                            </div>
                            <h2 className="text-sm font-bold text-slate-800">Product & Supplier</h2>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Select Product <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">-- Choose Product to Receive --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku}) — Current: {p.current_stock} {p.unit}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="mt-1 text-xs text-rose-600">{errors.product_id}</p>}
                            </div>

                            {/* Live Calculation Preview Banner */}
                            {selectedProduct && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-800">
                                                Current Stock
                                            </span>
                                            <p className="text-lg font-bold text-slate-800">
                                                {selectedProduct.current_stock} {selectedProduct.unit}
                                            </p>
                                        </div>

                                        <div className="flex items-center text-emerald-600">
                                            <span className="text-sm font-bold">+ {qty || 0}</span>
                                            <ArrowRight size={18} className="mx-2" />
                                        </div>

                                        <div className="text-center">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-800">
                                                New Projected Stock
                                            </span>
                                            <p className="text-xl font-extrabold text-emerald-700">
                                                {projectedStock} {selectedProduct.unit}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Supplier Source
                                </label>
                                <select
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">-- Optional: Select Supplier --</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.supplier_id && <p className="mt-1 text-xs text-rose-600">{errors.supplier_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Quantities & Costs */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Quantity & Inbound Cost</h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Quantity Received <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    placeholder="Enter positive amount"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.quantity && <p className="mt-1 text-xs text-rose-600">{errors.quantity}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Unit Purchase Cost (₱)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.unit_cost}
                                    onChange={(e) => setData('unit_cost', e.target.value)}
                                    placeholder="Optional unit cost"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.unit_cost && <p className="mt-1 text-xs text-rose-600">{errors.unit_cost}</p>}
                            </div>
                        </div>

                        {totalCost > 0 && (
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                                <span className="text-slate-500">Calculated Batch Purchase Cost:</span>
                                <span className="font-bold text-slate-900">
                                    ₱{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Reference & Notes */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Tracking Reference & Notes</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Reference / PO / Invoice Number
                                </label>
                                <input
                                    type="text"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    placeholder="e.g., PO-2026-0917"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.reference_number && <p className="mt-1 text-xs text-rose-600">{errors.reference_number}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Transaction Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Optional notes or delivery remarks..."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.notes && <p className="mt-1 text-xs text-rose-600">{errors.notes}</p>}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing || !data.product_id || qty <= 0}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <Save size={16} />
                        <span>{processing ? 'Processing Inbound...' : 'Complete Stock-In Transaction'}</span>
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}

