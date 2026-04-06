<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('word_list_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('wordlist_id')->constrained('wordlists')->onDelete('cascade');

            $table->string('name'); // name for order
            $table->string('phone_number');
            $table->text('address');
            $table->string('profession')->nullable();
            $table->string('transaction_id')->nullable(); // user sends bkash tx id
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->text('note')->nullable();       // user note
            $table->text('admin_note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('word_list_orders');
    }
};