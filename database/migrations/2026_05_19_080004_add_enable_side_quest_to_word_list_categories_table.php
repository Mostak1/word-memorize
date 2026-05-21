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
        Schema::table('word_list_categories', function (Blueprint $table) {
            $table->boolean('enable_side_quest')->default(false)->after('side_quest_timer_seconds');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('word_list_categories', function (Blueprint $table) {
            $table->dropColumn('enable_side_quest');
        });
    }
};
