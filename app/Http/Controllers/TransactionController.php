<?php

namespace App\Http\Controllers;

use App\Models\InventoryTransaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = InventoryTransaction::with(['product', 'user', 'supplier']);

        if ($type = $request->input('type')) {
            $query->where('transaction_type', $type);
        }

        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")
                         ->orWhere('sku', 'like', "%{$search}%");
                  });
            });
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $transactions = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($t) {
                return [
                    'id' => $t->id,
                    'product_name' => $t->product ? $t->product->name : 'Deleted Product',
                    'product_sku' => $t->product ? $t->product->sku : '',
                    'transaction_type' => $t->transaction_type,
                    'quantity' => $t->quantity,
                    'previous_stock' => $t->previous_stock,
                    'new_stock' => $t->new_stock,
                    'unit_cost' => $t->unit_cost,
                    'total_cost' => $t->total_cost,
                    'supplier_name' => $t->supplier ? $t->supplier->name : null,
                    'reference_number' => $t->reference_number,
                    'reason' => $t->reason,
                    'notes' => $t->notes,
                    'user_name' => $t->user ? $t->user->name : 'System',
                    'created_at' => $t->created_at->format('Y-m-d H:i'),
                ];
            });

        $products = Product::orderBy('name')->get(['id', 'name', 'sku']);

        return Inertia::render('transactions/Index', [
            'transactions' => $transactions,
            'products' => $products,
            'filters' => $request->only(['search', 'type', 'product_id', 'date_from', 'date_to']),
        ]);
    }
}

