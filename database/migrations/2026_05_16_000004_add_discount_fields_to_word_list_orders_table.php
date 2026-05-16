<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->decimal('subtotal_amount', 8, 2)->default(0)->after('payment_method');
            $table->unsignedTinyInteger('discount_percent')->default(0)->after('subtotal_amount');
            $table->decimal('discount_amount', 8, 2)->default(0)->after('discount_percent');
            $table->decimal('payable_amount', 8, 2)->default(0)->after('discount_amount');
            $table->foreignId('referral_discount_credit_id')->nullable()->after('payable_amount')->constrained('referral_discount_credits')->nullOnDelete();
        });

        DB::table('word_list_orders')
            ->select('id')
            ->orderBy('id')
            ->chunkById(100, function ($orders) {
                foreach ($orders as $order) {
                    $subtotal = (float) DB::table('word_list_order_items')
                        ->join('word_list_categories', 'word_list_order_items.word_list_category_id', '=', 'word_list_categories.id')
                        ->where('word_list_order_items.word_list_order_id', $order->id)
                        ->sum('word_list_categories.price');

                    DB::table('word_list_orders')
                        ->where('id', $order->id)
                        ->update([
                            'subtotal_amount' => $subtotal,
                            'payable_amount' => $subtotal,
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('referral_discount_credit_id');
            $table->dropColumn([
                'subtotal_amount',
                'discount_percent',
                'discount_amount',
                'payable_amount',
            ]);
        });
    }
};
