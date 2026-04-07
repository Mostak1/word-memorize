<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WordListOrder extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'word_list_category_id',
    'name',
    'phone_number',
    'address',
    'profession',
    'transaction_id',
    'status',
    'note',
    'admin_note',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function category()
  {
    return $this->belongsTo(WordListCategory::class, 'word_list_category_id');
  }

  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }
}