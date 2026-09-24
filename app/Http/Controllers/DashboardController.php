<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\Supplier;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalProducts = Product::where('status', 'active')->count();
        $totalCategories = Category::where('is_active', true)->count();
        $totalSuppliers = Supplier::where('is_active', true)->count();
        $totalStock = (int) Product::where('status', 'active')->sum('current_stock');

        $lowStockCount = Product::where('status', 'active')
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->where('current_stock', '>', 0)
            ->count();

        $outOfStockCount = Product::where('status', 'active')
            ->where('current_stock', '<=', 0)
            ->count();

        $totalInventoryValue = (float) Product::where('status', 'active')
            ->selectRaw('SUM(current_stock * unit_price) as total_val')
            ->value('total_val') ?? 0;

        $thirtyDaysAgo = Carbon::now()->subDays(30)->startOfDay();

        $stockIn30Days = (int) InventoryTransaction::where('transaction_type', 'STOCK_IN')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->sum('quantity');

        $stockOut30Days = (int) InventoryTransaction::where('transaction_type', 'STOCK_OUT')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->sum('quantity');

        // Last 7 days movement for chart
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $start = $date->copy()->startOfDay();
            $end = $date->copy()->endOfDay();

            $in = (int) InventoryTransaction::where('transaction_type', 'STOCK_IN')
                ->whereBetween('created_at', [$start, $end])
                ->sum('quantity');

            $out = (int) InventoryTransaction::where('transaction_type', 'STOCK_OUT')
                ->whereBetween('created_at', [$start, $end])
                ->sum('quantity');

            $chartData[] = [
                'date' => $date->format('M d'),
                'stock_in' => $in,
                'stock_out' => $out,
            ];
        }

        $recentTransactions = InventoryTransaction::with(['product', 'user'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'product_name' => $t->product ? $t->product->name : 'Deleted Product',
                    'transaction_type' => $t->transaction_type,
                    'quantity' => $t->quantity,
                    'user_name' => $t->user ? $t->user->name : 'System',
                    'created_at' => $t->created_at->format('Y-m-d H:i'),
                ];
            });

        $lowStockProducts = Product::with('category')
            ->where('status', 'active')
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->orderBy('current_stock', 'asc')
            ->limit(6)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'current_stock' => $p->current_stock,
                    'minimum_stock' => $p->minimum_stock,
                    'unit' => $p->unit,
                    'stock_status' => $p->stock_status,
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'total_categories' => $totalCategories,
                'total_suppliers' => $totalSuppliers,
                'total_stock' => $totalStock,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'total_inventory_value' => round($totalInventoryValue, 2),
                'stock_in_30days' => $stockIn30Days,
                'stock_out_30days' => $stockOut30Days,
            ],
            'recent_transactions' => $recentTransactions,
            'chart_data' => $chartData,
            'low_stock_products' => $lowStockProducts,
        ]);
    }
}

