<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Track XP earned per day to enforce the 200 XP daily cap from sessions.
   * (Users can still earn XP from other sources like mastery and lists.)
   */
  public function up(): void
  {
    Schema::table('user_daily_activities', function (Blueprint $table) {
      $table->unsignedInteger('session_xp_earned')->default(0)->after('completed');
    });
  }

  public function down(): void
  {
    Schema::table('user_daily_activities', function (Blueprint $table) {
      $table->dropColumn('session_xp_earned');
    });
  }
};
