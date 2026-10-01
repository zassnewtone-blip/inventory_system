<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $sku
 * @property int|null $category_id
 * @property int|null $supplier_id
 * @property string|null $description
 * @property float $unit_price
 * @property int $current_stock
 * @property int $minimum_stock
 * @property string $unit
 * @property string|null $image_path
 * @property string $status
 * @property string $stock_status
 * @property string|null $image_url
 */
class Product extends Model
{
    /** @use HasFactory<Factory<Product>> */
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'category_id',
        'supplier_id',
        'description',
        'unit_price',
        'current_stock',
        'minimum_stock',
        'unit',
        'image_path',
        'status',
    ];

    protected $appends = [
        'stock_status',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'float',
            'current_stock' => 'integer',
            'minimum_stock' => 'integer',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Supplier, $this> */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /** @return HasMany<InventoryTransaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /** @return HasMany<StockAdjustment, $this> */
    public function adjustments(): HasMany
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->current_stock <= 0) {
            return 'out_of_stock';
        }
        if ($this->current_stock <= $this->minimum_stock) {
            return 'low_stock';
        }

        return 'in_stock';
    }

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        return asset('storage/'.$this->image_path);
    }
}
