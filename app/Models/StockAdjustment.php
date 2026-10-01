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
 * @property int $previous_quantity
 * @property int $adjusted_quantity
 * @property int $difference
 * @property string $reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class StockAdjustment extends Model
{
    /** @use HasFactory<Factory<StockAdjustment>> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'previous_quantity',
        'adjusted_quantity',
        'difference',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'previous_quantity' => 'integer',
            'adjusted_quantity' => 'integer',
            'difference' => 'integer',
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
}
