<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WordListOrder extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'name',
    'phone_number',
    'address',
    'profession',
    'payment_method',
    'subtotal_amount',
    'discount_percent',
    'discount_amount',
    'payable_amount',
    'referral_discount_credit_id',
    'coupon_id',
    'transaction_id',
    'status',
    'note',
    'admin_note',
  ];

  protected $casts = [
    'subtotal_amount' => 'double',
    'discount_percent' => 'integer',
    'discount_amount' => 'double',
    'payable_amount' => 'double',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function coupon()
  {
    return $this->belongsTo(Coupon::class);
  }

  public function items()
  {
    return $this->hasMany(WordListOrderItem::class);
  }

  public function categories()
  {
    return $this->belongsToMany(
      WordListCategory::class,
      'word_list_order_items',
      'word_list_order_id',
      'word_list_category_id'
    );
  }

  public function referralDiscountCredit()
  {
    return $this->belongsTo(ReferralDiscountCredit::class);
  }

  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }

  /**
   * Grant access to all categories in this order for the order's user.
   * Existing manual access should remain manual, so order revoke/delete will not remove it.
   */
  public function grantAccess(): void
  {
    $categoryIds = $this->items()
      ->pluck('word_list_category_id')
      ->unique()
      ->values();

    foreach ($categoryIds as $catId) {
      UserWordListAccess::firstOrCreate(
        [
          'user_id' => $this->user_id,
          'word_list_category_id' => $catId,
        ],
        [
          'word_list_order_id' => $this->id,
          'granted_at' => now(),
        ]
      );
    }
  }

  /**
   * Revoke access records that were granted specifically by this order.
   */
  public function revokeAccess(): void
  {
    UserWordListAccess::where('word_list_order_id', $this->id)->delete();
  }
}
