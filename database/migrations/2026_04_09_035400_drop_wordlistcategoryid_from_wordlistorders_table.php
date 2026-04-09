<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->dropForeign(['word_list_category_id']);
            $table->dropColumn('word_list_category_id');

            $table->string('payment_method')->nullable()->after('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->foreignId('word_list_category_id')
                ->after('user_id')
                ->constrained('word_list_categories')
                ->cascadeOnDelete();
        });
    }
};