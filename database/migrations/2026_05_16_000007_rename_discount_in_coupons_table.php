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
        Schema::table('coupons', function (Blueprint $table) {
            if (Schema::hasColumn('coupons', 'discount') && !Schema::hasColumn('coupons', 'discount_percent')) {
                $table->renameColumn('discount', 'discount_percent');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            if (Schema::hasColumn('coupons', 'discount_percent') && !Schema::hasColumn('coupons', 'discount')) {
                $table->renameColumn('discount_percent', 'discount');
            }
        });
    }
};
