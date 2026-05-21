<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('word_list_categories', function (Blueprint $table) {
            $table->unsignedInteger('side_quest_xp_cost')->default(2000)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('word_list_categories', function (Blueprint $table) {
            $table->dropColumn('side_quest_xp_cost');
        });
    }
};
