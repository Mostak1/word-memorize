<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Create user_xp table to store user XP balance.
   *
   * The balance is the single source of truth for available XP.
   */
  public function up(): void
  {
    Schema::create('user_xp', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();

      $table->unsignedBigInteger('xp_balance')->default(0);

      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('user_xp');
  }
};
