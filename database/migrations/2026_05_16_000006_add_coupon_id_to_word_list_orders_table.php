<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure 'coupons' table uses InnoDB to support foreign keys
        // (MyISAM does not support foreign key constraints)
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE coupons ENGINE = InnoDB');
        }

        Schema::table('word_list_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('word_list_orders', 'coupon_id')) {
                $table->foreignId('coupon_id')
                    ->nullable()
                    ->after('referral_discount_credit_id')
                    ->constrained('coupons')
                    ->nullOnDelete();
            } else {
                // Column exists (possibly from a failed previous run or manual add),
                // but we still need to ensure the foreign key constraint is created.
                $table->foreign('coupon_id')
                    ->references('id')
                    ->on('coupons')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('word_list_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('coupon_id');
        });
    }
};
