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
    'transaction_id',
    'status',
    'note',
    'admin_note',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
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

  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }

  /**
   * Grant access to all categories in this order for the order's user.
   * Uses upsert so it's safe to call multiple times.
   */
  public function grantAccess(): void
  {
    $categoryIds = $this->items()->pluck('word_list_category_id');

    $rows = $categoryIds->map(fn($catId) => [
      'user_id' => $this->user_id,
      'word_list_category_id' => $catId,
      'word_list_order_id' => $this->id,
      'granted_at' => now(),
      'created_at' => now(),
      'updated_at' => now(),
    ])->all();

    UserWordListAccess::upsert(
      $rows,
      ['user_id', 'word_list_category_id'], // unique keys
      ['word_list_order_id', 'granted_at', 'updated_at']
    );
  }

  /**
   * Revoke access records that were granted specifically by this order.
   */
  public function revokeAccess(): void
  {
    UserWordListAccess::where('word_list_order_id', $this->id)->delete();
  }
}