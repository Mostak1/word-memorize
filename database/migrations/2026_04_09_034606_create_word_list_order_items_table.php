<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('word_list_order_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('word_list_order_id')
                ->constrained('word_list_orders')
                ->cascadeOnDelete();

            $table->foreignId('word_list_category_id')
                ->constrained('word_list_categories')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(
                ['word_list_order_id', 'word_list_category_id'],
                'wl_order_category_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('word_list_order_items');
    }
};