<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $table = 'products';
    protected $fillable = [
        'external_id',
        'slug',
        'variation_id',
        'variation',
        'name',
        'name_bn',
        'sku',
        'sub_sku',
        'type',
        'selling_price',
        'purchase_price',
        'dpp_inc_tax',
        'profit_percent',
        'currency_rate',
        'is_foreign',
        'foreign_s_price_inc_tex',
        'enable_stock',
        'qty_available',
        'product_brand_id',
        'product_category_id',
        'unit',
        'product_description',
        'product_description_bn',
        'short_description',
        'short_description_bn',
        'description_bn',
        'image_url',
        'image_gallery',
        'local_image_url',
        'local_image_gallery',
        'youtube_url',
        'vedio_url',
        'weight',
        'size',
        'pack_unit',
        'generic_id',
        'generic_name',
        'strength',
        'location_id',
        'short_name',
        'discount_type',
        'discount_amount',
        'discount_starts_at',
        'discount_ends_at',
        'nearest_exp_date',
        'purchase_line_id',
        'transaction_id',
        'lot_number',
        'exp_date',
        'is_featured',
        'sort_order',
        'is_ad',
        'combo_ids',
        'combo_items_total_price',
        'sync_hash',
    ];

    protected $appends = [
        'ad_image_url',
    ];

    protected $casts = [
        'image_gallery' => 'array',
        'local_image_gallery' => 'array',
        'combo_ids' => 'array',
        'discount_starts_at' => 'datetime',
        'discount_ends_at' => 'datetime',
    ];

    public function getAdImageUrlAttribute()
    {
        $imagePath = $this->local_image_url ?: $this->image_url;

        if (!$imagePath && !empty($this->local_image_gallery)) {
            $imagePath = $this->local_image_gallery[0];
        }

        if (!$imagePath) {
            return null;
        }

        if (str_starts_with($imagePath, 'http')) {
            return $imagePath;
        }

        return 'https://fluento.org/' . ltrim($imagePath, '/');
    }

    // public function brand()
    // {
    //     return $this->belongsTo(ProductBrand::class, 'product_brand_id');
    // }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    /** Compatibility Accessors for Shop Views */

    public function getTitleAttribute()
    {
        return $this->name;
    }

    public function getPriceAttribute()
    {
        return $this->selling_price;
    }

    public function getHasActiveDiscountAttribute()
    {
        if (!$this->discount_type || $this->discount_amount <= 0) {
            return false;
        }

        $now = now();

        if ($this->discount_starts_at && $now->lt($this->discount_starts_at)) {
            return false;
        }

        if ($this->discount_ends_at && $now->gt($this->discount_ends_at)) {
            return false;
        }

        return true;
    }

    public function getDiscountedPriceAttribute()
    {
        if (!$this->has_active_discount) {
            return (float) $this->selling_price;
        }

        if ($this->discount_type === 'percentage') {
            return (float) ($this->selling_price - ($this->selling_price * ($this->discount_amount / 100)));
        }

        if ($this->discount_type === 'fixed') {
            return (float) ($this->selling_price - $this->discount_amount);
        }

        return (float) $this->selling_price;
    }

    public function getDiscountAttribute()
    {
        if (!$this->has_active_discount) {
            return null;
        }

        return $this->discounted_price;
    }

    public function getDescriptionAttribute()
    {
        return $this->product_description;
    }

    public function getImagesAttribute()
    {
        // Mock the Course->images relationship for frontend views
        $imagePath = $this->local_image_url ?: $this->image_url;

        if (!$imagePath && !empty($this->local_image_gallery)) {
            $imagePath = $this->local_image_gallery[0];
        }

        return collect([
            (object) ['image_path' => $imagePath]
        ]);
    }

    public function getLocalImagesAttribute()
    {
        // Specifically for local images, as requested
        $imagePath = $this->local_image_url;

        if (!$imagePath && !empty($this->local_image_gallery)) {
            $imagePath = $this->local_image_gallery[0];
        }

        return collect([
            (object) ['image_path' => $imagePath]
        ]);
    }

    public function translate($field)
    {
        $locale = app()->getLocale();

        if ($locale === 'bn') {
            if ($field === 'name' || $field === 'title') {
                return $this->name_bn ?: $this->name;
            }
            if ($field === 'description') {
                return $this->product_description_bn ?: ($this->description_bn ?: $this->product_description);
            }
            if ($field === 'short_description') {
                return $this->short_description_bn ?: $this->short_description;
            }
        }

        if ($field === 'title' || $field === 'name') {
            return $this->name;
        }

        if ($field === 'description') {
            return $this->product_description;
        }

        if ($field === 'short_description') {
            return $this->short_description;
        }

        return $this->{$field} ?? $this->name;
    }
}