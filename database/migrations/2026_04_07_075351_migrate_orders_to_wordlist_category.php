<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Add is_locked to word_list_categories
        Schema::table('word_list_categories', function (Blueprint $table) {
            $table->boolean('is_locked')->default(false)->after('price');
        });

        // 2. Rename wordlist_id → word_list_category_id in word_list_orders
        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->dropForeign(['wordlist_id']);
            $table->renameColumn('wordlist_id', 'word_list_category_id');
        });
        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->foreign('word_list_category_id')
                ->references('id')
                ->on('word_list_categories')
                ->onDelete('cascade');
        });

        // 3. Remove price and is_locked from wordlists
        Schema::table('wordlists', function (Blueprint $table) {
            $table->dropColumn(['price']);
        });
    }

    public function down(): void
    {
        Schema::table('wordlists', function (Blueprint $table) {
            $table->boolean('is_locked')->default(false)->after('price');
        });

        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->dropForeign(['word_list_category_id']);
            $table->renameColumn('word_list_category_id', 'wordlist_id');
        });
        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->foreign('wordlist_id')->references('id')->on('wordlists')->onDelete('cascade');
        });

        Schema::table('word_list_categories', function (Blueprint $table) {
            $table->dropColumn('is_locked');
        });
    }
};