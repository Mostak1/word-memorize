<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_word_list_access', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('word_list_category_id')
                ->constrained('word_list_categories')
                ->cascadeOnDelete();
            // nullable: allows manual grants without an order
            $table->foreignId('word_list_order_id')
                ->nullable()
                ->constrained('word_list_orders')
                ->nullOnDelete();
            $table->timestamp('granted_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'word_list_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_word_list_access');
    }
};
