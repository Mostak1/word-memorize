<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UserFollow extends Pivot
{
  protected $table = 'user_follows';

  public $timestamps = true;

  protected $fillable = [
    'user_id',
    'following_id',
  ];
}
