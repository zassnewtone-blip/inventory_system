<?php

use App\Models\Category;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// Public Auth endpoint
Route::post('/auth/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();
    if (!$user->is_active) {
        Auth::logout();
        return response()->json(['message' => 'Account is inactive'], 403);
    }

    $request->session()->regenerate();
    return response()->json(['user' => $user, 'message' => 'Login successful']);
});

// Authenticated API endpoints
Route::middleware('auth')->group(function () {
    Route::post('/auth/logout', function (Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out successfully']);
    });

    Route::get('/auth/user', function (Request $request) {
        return response()->json($request->user());
    });

    // Products API
    Route::get('/products', function (Request $request) {
        $query = Product::with(['category', 'supplier']);
        if ($search = $request->input('search')) {
            $query->where(fn($q) => $q->where('name', 'like', "%$search%")->orWhere('sku', 'like', "%$search%"));
        }
        return response()->json($query->paginate(20));
    });

    Route::get('/products/{id}', function ($id) {
        return response()->json(Product::with(['category', 'supplier'])->findOrFail($id));
    });

    // Categories API
    Route::get('/categories', function () {
        return response()->json(Category::withCount('products')->get());
    });

    // Suppliers API
    Route::get('/suppliers', function () {
        return response()->json(Supplier::withCount('products')->get());
    });

    // Transactions API
    Route::get('/transactions', function (Request $request) {
        $query = InventoryTransaction::with(['product', 'user', 'supplier']);
        if ($type = $request->input('type')) {
            $query->where('transaction_type', $type);
        }
        return response()->json($query->latest()->paginate(20));
    });
});

