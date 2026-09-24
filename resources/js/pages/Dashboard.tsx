import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Boxes,
    DollarSign,
    Package,
    PackageMinus,
    PackagePlus,
    Tag,
    Truck,
    XCircle,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import AppLayout from '../layouts/AppLayout';

interface Stats {
    total_products: number;
    total_categories: number;
    total_suppliers: number;
    total_stock: number;
    low_stock_count: number;
    out_of_stock_count: number;
    total_inventory_value: number;
    stock_in_30days: number;
    stock_out_30days: number;
}

interface ChartPoint {
    date: string;
    stock_in: number;
    stock_out: number;
}

interface RecentTx {
    id: number;
    product_name: string;
    transaction_type: string;
    quantity: number;
    user_name: string;
    created_at: string;
}

interface LowStockItem {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    minimum_stock: number;
    unit: string;
    stock_status: string;
}

interface Props {
    stats: Stats;
    recent_transactions: RecentTx[];
    chart_data: ChartPoint[];
    low_stock_products: LowStockItem[];
}

export default function Dashboard({
    stats,
    recent_transactions,
    chart_data,
    low_stock_products,
}: Props) {
    return (
        <AppLayout title="Dashboard Overview">
            <Head title="Dashboard" />

            {/* Quick Actions Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Inventory Dashboard</h1>
                    <p className="text-xs text-slate-500">Live operational overview of stock, movements, and alerts</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/inventory/stock-in"
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
                    >
                        <PackagePlus size={15} />
                        <span>Stock In</span>
                    </Link>
                    <Link
                        href="/inventory/stock-out"
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-600/20 transition hover:bg-rose-700"
                    >
                        <PackageMinus size={15} />
                        <span>Stock Out</span>
                    </Link>
                    <Link
                        href="/products/create"
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
                    >
                        <Package size={15} />
                        <span>Add Product</span>
                    </Link>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Products */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Total Products</span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-bold text-slate-800">{stats.total_products}</span>
                        <span className="ml-2 text-xs text-slate-500">active catalog items</span>
                    </div>
                </div>

                {/* Total Stock */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Total Stock Qty</span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Boxes size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-bold text-slate-800">{stats.total_stock.toLocaleString()}</span>
                        <span className="ml-2 text-xs text-slate-500">units in warehouse</span>
                    </div>
                </div>

                {/* Low Stock Items */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs transition hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-amber-700">Low Stock Alert</span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-bold text-amber-900">{stats.low_stock_count}</span>
                        <span className="ml-2 text-xs text-amber-700">need reordering</span>
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-xs transition hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-rose-700">Out of Stock</span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                            <XCircle size={20} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-bold text-rose-900">{stats.out_of_stock_count}</span>
                        <span className="ml-2 text-xs text-rose-700">zero stock</span>
                    </div>
                </div>
            </div>

            {/* Secondary Metric Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <ArrowDownRight size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] font-medium text-slate-500">Stock In (30d)</p>
                            <p className="text-lg font-bold text-slate-800">+{stats.stock_in_30days.toLocaleString()} units</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                            <ArrowUpRight size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] font-medium text-slate-500">Stock Out (30d)</p>
                            <p className="text-lg font-bold text-slate-800">-{stats.stock_out_30days.toLocaleString()} units</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                            <Tag size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] font-medium text-slate-500">Categories / Suppliers</p>
                            <p className="text-lg font-bold text-slate-800">{stats.total_categories} / {stats.total_suppliers}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                            <DollarSign size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] font-medium text-slate-500">Total Inventory Value</p>
                            <p className="text-lg font-bold text-slate-800">₱{stats.total_inventory_value.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movement Chart & Low Stock Products */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Chart: 7-Day Movements */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Stock Movement Trends</h3>
                            <p className="text-xs text-slate-400">Incoming vs Outgoing inventory over the last 7 days</p>
                        </div>
                        <Link href="/reports/stock-movement" className="text-xs font-semibold text-indigo-600 hover:underline">
                            Full Report →
                        </Link>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderRadius: '10px',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '12px',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="stock_in" name="Stock In" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                                <Bar dataKey="stock_out" name="Stock Out" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Low Stock Items List */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Low Stock Monitor</h3>
                            <p className="text-xs text-slate-400">Items nearing or at zero stock</p>
                        </div>
                        <Link href="/reports/low-stock" className="text-xs font-semibold text-indigo-600 hover:underline">
                            View all
                        </Link>
                    </div>

                    {low_stock_products.length === 0 ? (
                        <div className="flex h-52 flex-col items-center justify-center text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <Package size={20} />
                            </div>
                            <p className="mt-2 text-xs font-medium text-slate-600">All stock levels healthy</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {low_stock_products.map((item) => {
                                const isOut = item.current_stock <= 0;
                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between rounded-xl border p-3 ${
                                            isOut ? 'border-rose-200 bg-rose-50/50' : 'border-amber-200 bg-amber-50/50'
                                        }`}
                                    >
                                        <div className="truncate pr-2">
                                            <p className="truncate text-xs font-bold text-slate-800">{item.name}</p>
                                            <p className="text-[11px] text-slate-500">
                                                SKU: {item.sku} • Min: {item.minimum_stock}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                                                    isOut ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {item.current_stock} {item.unit}
                                            </span>
                                            <div className="mt-1">
                                                <Link
                                                    href="/inventory/stock-in"
                                                    className="text-[10px] font-semibold text-indigo-600 hover:underline"
                                                >
                                                    + Restock
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Recent Inventory Transactions</h3>
                        <p className="text-xs text-slate-400">Latest stock entries, releases, and adjustments</p>
                    </div>
                    <Link href="/transactions" className="text-xs font-semibold text-indigo-600 hover:underline">
                        View All Transactions →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400">
                                <th className="pb-3 font-semibold">Product</th>
                                <th className="pb-3 font-semibold">Type</th>
                                <th className="pb-3 font-semibold">Quantity</th>
                                <th className="pb-3 font-semibold">Logged By</th>
                                <th className="pb-3 font-semibold">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {recent_transactions.map((tx) => {
                                const isStockIn = tx.transaction_type === 'STOCK_IN';
                                const isStockOut = tx.transaction_type === 'STOCK_OUT';
                                return (
                                    <tr key={tx.id} className="hover:bg-slate-50/60">
                                        <td className="py-3 font-medium text-slate-900">{tx.product_name}</td>
                                        <td className="py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                                    isStockIn
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : isStockOut
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {tx.transaction_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 font-bold">
                                            <span className={isStockIn ? 'text-emerald-600' : isStockOut ? 'text-rose-600' : 'text-amber-600'}>
                                                {isStockIn ? '+' : isStockOut ? '-' : '±'}{tx.quantity}
                                            </span>
                                        </td>
                                        <td className="py-3 text-slate-500">{tx.user_name}</td>
                                        <td className="py-3 text-slate-400">{tx.created_at}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {recent_transactions.length === 0 && (
                        <p className="py-8 text-center text-xs text-slate-400">No recent transactions recorded</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

