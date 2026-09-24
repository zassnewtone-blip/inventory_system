<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function inventory(Request $request): Response
    {
        $query = Product::with(['category', 'supplier']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->orderBy('name', 'asc')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'category' => $p->category ? $p->category->name : 'Uncategorized',
                    'supplier' => $p->supplier ? $p->supplier->name : 'N/A',
                    'current_stock' => $p->current_stock,
                    'minimum_stock' => $p->minimum_stock,
                    'unit_price' => $p->unit_price,
                    'inventory_value' => round($p->current_stock * $p->unit_price, 2),
                    'unit' => $p->unit,
                    'status' => $p->status,
                    'stock_status' => $p->stock_status,
                ];
            });

        $totalValue = $products->sum('inventory_value');
        $totalStock = $products->sum('current_stock');

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('reports/Inventory', [
            'products' => $products,
            'categories' => $categories,
            'total_value' => round($totalValue, 2),
            'total_stock' => $totalStock,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function stockMovement(Request $request): Response
    {
        $dateFrom = $request->input('date_from', Carbon::now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));

        $startDate = Carbon::parse($dateFrom)->startOfDay();
        $endDate = Carbon::parse($dateTo)->endOfDay();

        $products = Product::with(['transactions' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        }])
        ->orderBy('name')
        ->get()
        ->map(function ($p) {
            $stockIn = $p->transactions->where('transaction_type', 'STOCK_IN')->sum('quantity');
            $stockOut = $p->transactions->where('transaction_type', 'STOCK_OUT')->sum('quantity');
            $adjustments = $p->transactions->where('transaction_type', 'ADJUSTMENT')->count();

            return [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'unit' => $p->unit,
                'stock_in' => $stockIn,
                'stock_out' => $stockOut,
                'adjustments' => $adjustments,
                'current_stock' => $p->current_stock,
            ];
        });

        return Inertia::render('reports/StockMovement', [
            'products' => $products,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function lowStock(): Response
    {
        $products = Product::with(['category', 'supplier'])
            ->where('status', 'active')
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->orderBy('current_stock', 'asc')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'category' => $p->category ? $p->category->name : 'Uncategorized',
                    'supplier' => $p->supplier ? $p->supplier->name : 'N/A',
                    'current_stock' => $p->current_stock,
                    'minimum_stock' => $p->minimum_stock,
                    'unit' => $p->unit,
                    'stock_status' => $p->stock_status,
                ];
            });

        return Inertia::render('reports/LowStock', [
            'products' => $products,
        ]);
    }
}

