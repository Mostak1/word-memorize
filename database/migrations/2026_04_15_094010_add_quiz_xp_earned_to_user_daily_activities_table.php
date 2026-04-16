<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_daily_activities', function (Blueprint $table) {
            $table->unsignedInteger('quiz_xp_earned')->default(0)->after('session_xp_earned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_daily_activities', function (Blueprint $table) {
            $table->dropColumn('quiz_xp_earned');
        });
    }
};
