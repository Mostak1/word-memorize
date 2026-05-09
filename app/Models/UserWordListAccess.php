<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserWordListAccess extends Model
{
  protected $table = 'user_word_list_access';
  protected $fillable = [
    'user_id',
    'word_list_category_id',
    'word_list_order_id',
    'course_id',
    'course_title',
    'granted_at',
  ];

  protected $casts = [
    'granted_at' => 'datetime',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function category()
  {
    return $this->belongsTo(WordListCategory::class, 'word_list_category_id');
  }

  public function order()
  {
    return $this->belongsTo(WordListOrder::class, 'word_list_order_id');
  }
}