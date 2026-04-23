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
        Schema::table('user_daily_activities', function (Blueprint $table) {
            $table->boolean('is_freeze')->default(false)->after('completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_daily_activities', function (Blueprint $table) {
            $table->dropColumn('is_freeze');
        });
    }
};
