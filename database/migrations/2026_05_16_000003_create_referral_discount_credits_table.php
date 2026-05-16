<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referral_discount_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('referral_id')->constrained()->cascadeOnDelete();
            $table->enum('source', ['new_user', 'referrer']);
            $table->unsignedTinyInteger('discount_percent');
            $table->enum('status', ['available', 'used'])->default('available');
            $table->foreignId('used_order_id')->nullable()->constrained('word_list_orders')->nullOnDelete();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_discount_credits');
    }
};
