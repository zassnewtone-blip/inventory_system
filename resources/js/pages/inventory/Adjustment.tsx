import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowRight, CheckCircle2, MinusCircle, PlusCircle, Scale, ShieldAlert } from 'lucide-react';
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
    'Annual / Periodic Physical Inventory Count',
    'Discrepancy Reconciliation / Audit Correction',
    'Damaged / Spoiled Stock Write-Off',
    'Found Unrecorded Physical Stock',
    'System Calibration / Initial Correction',
    'Theft / Unaccounted Shrinkage',
    'Other Administrative Adjustment',
];

export default function Adjustment({ products }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        adjusted_quantity: '',
        reason: 'Annual / Periodic Physical Inventory Count',
    });

    const selectedProduct = useMemo(() => {
        return products.find((p) => String(p.id) === String(data.product_id)) || null;
    }, [products, data.product_id]);

    const adjustedQty = parseInt(data.adjusted_quantity || '0', 10);
    const currentStock = selectedProduct ? selectedProduct.current_stock : 0;
    const difference = selectedProduct && data.adjusted_quantity !== '' ? adjustedQty - currentStock : 0;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || data.adjusted_quantity === '') return;

        post('/inventory/adjustment', {
            onSuccess: () => {
                reset('adjusted_quantity');
            },
        });
    };

    return (
        <AppLayout title="Stock Adjustment">
            <Head title="Stock Adjustment (Admin)" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-800">Inventory Stock Adjustment</h1>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                <ShieldAlert size={12} /> Admin Only
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Reconcile physical inventory counts with system records and create an audit log
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Select Product */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                <Scale size={16} />
                            </div>
                            <h2 className="text-sm font-bold text-slate-800">Product for Stock Count</h2>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Select Target Product <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.product_id}
                                    onChange={(e) => {
                                        setData('product_id', e.target.value);
                                        const found = products.find((p) => String(p.id) === e.target.value);
                                        if (found) {
                                            setData('adjusted_quantity', String(found.current_stock));
                                        }
                                    }}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">-- Choose Product to Reconcile --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku}) — System Stock: {p.current_stock} {p.unit}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="mt-1 text-xs text-rose-600">{errors.product_id}</p>}
                            </div>

                            {/* Discrepancy Preview */}
                            {selectedProduct && data.adjusted_quantity !== '' && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                                                System Recorded Stock
                                            </span>
                                            <p className="text-lg font-bold text-slate-800">
                                                {selectedProduct.current_stock} {selectedProduct.unit}
                                            </p>
                                        </div>

                                        <ArrowRight size={18} className="text-slate-400" />

                                        <div className="text-center">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                                                Actual Physical Count
                                            </span>
                                            <p className="text-lg font-bold text-indigo-600">
                                                {adjustedQty} {selectedProduct.unit}
                                            </p>
                                        </div>

                                        <div className="border-l border-slate-200 pl-4 text-center">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                                                Variance / Discrepancy
                                            </span>
                                            <div className="flex items-center justify-center gap-1">
                                                {difference > 0 ? (
                                                    <span className="flex items-center gap-1 font-extrabold text-emerald-600">
                                                        <PlusCircle size={14} /> +{difference} {selectedProduct.unit} (Surplus)
                                                    </span>
                                                ) : difference < 0 ? (
                                                    <span className="flex items-center gap-1 font-extrabold text-rose-600">
                                                        <MinusCircle size={14} /> {difference} {selectedProduct.unit} (Deficit)
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                                                        <CheckCircle2 size={14} /> 0 (Match)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Adjusted Quantity & Reason */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Count & Audit Trail</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    New Actual Physical Count <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={data.adjusted_quantity}
                                    onChange={(e) => setData('adjusted_quantity', e.target.value)}
                                    placeholder="Enter physical counted stock"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.adjusted_quantity && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.adjusted_quantity}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Audit Reason / Justification <span className="text-rose-500">*</span>
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

                    <button
                        type="submit"
                        disabled={processing || !data.product_id || data.adjusted_quantity === ''}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700 disabled:opacity-50"
                    >
                        <Scale size={16} />
                        <span>{processing ? 'Applying Adjustment...' : 'Apply Stock Adjustment & Save Audit'}</span>
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}

