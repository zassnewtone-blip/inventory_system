<?php

namespace App\Http\Controllers;

use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function stockInIndex(): Response
    {
        $products = Product::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'current_stock', 'unit', 'unit_price']);

        $suppliers = Supplier::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('inventory/StockIn', [
            'products' => $products,
            'suppliers' => $suppliers,
        ]);
    }

    public function stockIn(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);

            $previousStock = $product->current_stock;
            $quantity = (int) $validated['quantity'];
            $newStock = $previousStock + $quantity;

            $product->update([
                'current_stock' => $newStock,
            ]);

            $unitCost = isset($validated['unit_cost']) && $validated['unit_cost'] !== '' ? (float) $validated['unit_cost'] : null;
            $totalCost = $unitCost !== null ? $unitCost * $quantity : null;

            InventoryTransaction::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'transaction_type' => 'STOCK_IN',
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'supplier_id' => $validated['supplier_id'] ?: null,
                'reference_number' => $validated['reference_number'] ?: ('IN-' . strtoupper(uniqid())),
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return back()->with('success', 'Stock-in transaction successfully recorded.');
    }

    public function stockOutIndex(): Response
    {
        $products = Product::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'current_stock', 'unit']);

        return Inertia::render('inventory/StockOut', [
            'products' => $products,
        ]);
    }

    public function stockOut(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);

            $quantity = (int) $validated['quantity'];
            if ($quantity > $product->current_stock) {
                throw ValidationException::withMessages([
                    'quantity' => "Cannot remove {$quantity} items. Only {$product->current_stock} {$product->unit} currently in stock.",
                ]);
            }

            $previousStock = $product->current_stock;
            $newStock = $previousStock - $quantity;

            $product->update([
                'current_stock' => $newStock,
            ]);

            InventoryTransaction::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'transaction_type' => 'STOCK_OUT',
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reference_number' => $validated['reference_number'] ?: ('OUT-' . strtoupper(uniqid())),
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return back()->with('success', 'Stock-out transaction successfully recorded.');
    }

    public function adjustmentIndex(): Response
    {
        $products = Product::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'current_stock', 'unit']);

        return Inertia::render('inventory/Adjustment', [
            'products' => $products,
        ]);
    }

    public function adjustment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'adjusted_quantity' => ['required', 'integer', 'min:0'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);

            $previousStock = $product->current_stock;
            $adjustedStock = (int) $validated['adjusted_quantity'];
            $difference = $adjustedStock - $previousStock;

            $product->update([
                'current_stock' => $adjustedStock,
            ]);

            StockAdjustment::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'previous_quantity' => $previousStock,
                'adjusted_quantity' => $adjustedStock,
                'difference' => $difference,
                'reason' => $validated['reason'],
            ]);

            InventoryTransaction::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'transaction_type' => 'ADJUSTMENT',
                'quantity' => abs($difference),
                'previous_stock' => $previousStock,
                'new_stock' => $adjustedStock,
                'reference_number' => 'ADJ-' . strtoupper(uniqid()),
                'reason' => $validated['reason'],
            ]);
        });

        return back()->with('success', 'Stock adjustment successfully saved.');
    }
}

