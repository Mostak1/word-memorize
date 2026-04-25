<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_streaks', function (Blueprint $table) {
            $table->boolean('broken_streak_notified')->default(false)->after('last_auto_save_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_streaks', function (Blueprint $table) {
            $table->dropColumn('broken_streak_notified');
        });
    }
};
