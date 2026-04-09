<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WordListOrderItem extends Model
{
  protected $fillable = [
    'word_list_order_id',
    'word_list_category_id',
  ];

  public function order()
  {
    return $this->belongsTo(WordListOrder::class, 'word_list_order_id');
  }

  public function category()
  {
    return $this->belongsTo(WordListCategory::class, 'word_list_category_id');
  }
}