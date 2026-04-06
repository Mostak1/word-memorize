<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WordListOrder extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'wordlist_id',
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

  public function wordlist()
  {
    return $this->belongsTo(WordList::class);
  }

  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }
}