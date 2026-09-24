<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Guest authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated application routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/', function () {
        return redirect()->route('dashboard');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Products Module
    Route::resource('products', ProductController::class);

    // Categories Module
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Suppliers Module
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    // Inventory Stock In & Out
    Route::get('/inventory/stock-in', [InventoryController::class, 'stockInIndex'])->name('inventory.stock-in');
    Route::post('/inventory/stock-in', [InventoryController::class, 'stockIn']);

    Route::get('/inventory/stock-out', [InventoryController::class, 'stockOutIndex'])->name('inventory.stock-out');
    Route::post('/inventory/stock-out', [InventoryController::class, 'stockOut']);

    // Transactions History
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');

    // Reports
    Route::get('/reports/inventory', [ReportController::class, 'inventory'])->name('reports.inventory');
    Route::get('/reports/stock-movement', [ReportController::class, 'stockMovement'])->name('reports.stock-movement');
    Route::get('/reports/low-stock', [ReportController::class, 'lowStock'])->name('reports.low-stock');

    // Admin Only routes
    Route::middleware('admin')->group(function () {
        // Stock Adjustment
        Route::get('/inventory/adjustment', [InventoryController::class, 'adjustmentIndex'])->name('inventory.adjustment');
        Route::post('/inventory/adjustment', [InventoryController::class, 'adjustment']);

        // User Management
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    });
});
