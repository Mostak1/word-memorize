<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    public const TYPE_PRODUCT = 'product';
    public const TYPE_SERVICE = 'service';
    public const TYPE_COURSE = 'course';

    public const PLACEMENT_SESSION_COMPLETE = 'session_complete';

    public const TYPES = [
        self::TYPE_PRODUCT,
        self::TYPE_SERVICE,
        self::TYPE_COURSE,
    ];

    public const PLACEMENTS = [
        self::PLACEMENT_SESSION_COMPLETE,
    ];

    protected $fillable = [
        'type',
        'placement',
        'product_id',
        'title',
        'description',
        'url',
        'cta_label',
        'thumbnail',
        'priority',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail) {
            return null;
        }
        if (str_starts_with($this->thumbnail, 'http') || str_starts_with($this->thumbnail, 'data:')) {
            return $this->thumbnail;
        }
        return asset('storage/' . ltrim($this->thumbnail, '/'));
    }

    public function toRecommendationPayload(): ?array
    {
        if ($this->type === self::TYPE_PRODUCT) {
            if ($this->product_id) {
                if (!$this->product) {
                    return null;
                }

                if (!$this->product->slug) {
                    return null;
                }

                $adImageUrl = $this->thumbnail_url ?: $this->product->ad_image_url;
                if (!$adImageUrl) {
                    return null;
                }

                return [
                    'id' => $this->id,
                    'type' => self::TYPE_PRODUCT,
                    'placement' => $this->placement,
                    'product_id' => $this->product->id,
                    'title' => $this->product->name,
                    'description' => 'A selected Fluento product that can support your next study session.',
                    'href' => 'https://fluento.org/shop/' . $this->product->slug,
                    'cta' => 'View in Shop',
                    'ad_image_url' => $adImageUrl,
                    'selling_price' => $this->product->selling_price,
                    'priority' => $this->priority,
                ];
            }

            // URL-based product promotion
            if (!$this->url || !$this->title || !$this->cta_label) {
                return null;
            }

            return [
                'id' => $this->id,
                'type' => self::TYPE_PRODUCT,
                'placement' => $this->placement,
                'title' => $this->title,
                'description' => $this->description,
                'href' => $this->url,
                'cta' => $this->cta_label,
                'ad_image_url' => $this->thumbnail_url,
                'selling_price' => 0,
                'priority' => $this->priority,
            ];
        }

        return [
            'id' => $this->id,
            'type' => $this->type,
            'placement' => $this->placement,
            'title' => $this->title,
            'description' => $this->description,
            'href' => $this->url,
            'cta' => $this->cta_label,
            'ad_image_url' => $this->thumbnail_url,
            'priority' => $this->priority,
        ];
    }
}
