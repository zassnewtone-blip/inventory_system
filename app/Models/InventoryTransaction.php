<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property int $user_id
 * @property string $transaction_type
 * @property int $quantity
 * @property int $previous_stock
 * @property int $new_stock
 * @property float|null $unit_cost
 * @property float|null $total_cost
 * @property int|null $supplier_id
 * @property string|null $reference_number
 * @property string|null $reason
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class InventoryTransaction extends Model
{
    /** @use HasFactory<Factory<InventoryTransaction>> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'transaction_type',
        'quantity',
        'previous_stock',
        'new_stock',
        'unit_cost',
        'total_cost',
        'supplier_id',
        'reference_number',
        'reason',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'previous_stock' => 'integer',
            'new_stock' => 'integer',
            'unit_cost' => 'float',
            'total_cost' => 'float',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Supplier, $this> */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
