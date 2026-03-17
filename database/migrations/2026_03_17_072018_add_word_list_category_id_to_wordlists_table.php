<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('wordlists', function (Blueprint $table) {
            $table->foreignId('word_list_category_id')
                ->nullable()
                ->after('id')
                ->constrained('word_list_categories')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('wordlists', function (Blueprint $table) {
            $table->dropForeign(['word_list_category_id']);
            $table->dropColumn('word_list_category_id');
        });
    }
};