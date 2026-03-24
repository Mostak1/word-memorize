<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_streaks', function (Blueprint $table) {
            // Records the date we last silently bridged a 1-day gap for this user.
            // Used to enforce the once-per-week auto-save rule.
            $table->date('last_auto_save_at')->nullable()->after('freeze_count');
        });
    }

    public function down(): void
    {
        Schema::table('user_streaks', function (Blueprint $table) {
            $table->dropColumn('last_auto_save_at');
        });
    }
};