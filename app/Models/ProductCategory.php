<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductCategory extends Model
{
    use SoftDeletes;

    protected $table = 'product_categories';
    protected $fillable = [
        'external_id',
        'name',
        'parent_id',
        'ecommerce_name',
        'business_id',
        'short_code',
        'is_ecommerce',
        'woocommerce_cat_id',
        'category_type',
        'description',
        'slug'
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}