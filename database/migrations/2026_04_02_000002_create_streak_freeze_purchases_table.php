<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Track streak freeze purchases.
   * 
   * Used to:
   *   - Enforce cost escalation (1st: 1000 XP, 2nd+: 2000 XP)
   *   - Display purchase history
   *   - Determine which freezes are claimed/used
   */
  public function up(): void
  {
    Schema::create('streak_freeze_purchases', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();

      // How much XP was paid for this freeze
      $table->unsignedInteger('xp_cost')->default(1000);

      // When was it purchased
      $table->timestamp('purchased_at')->useCurrent();

      // Whether this freeze has been used/claimed
      $table->boolean('is_used')->default(false);

      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('streak_freeze_purchases');
  }
};
