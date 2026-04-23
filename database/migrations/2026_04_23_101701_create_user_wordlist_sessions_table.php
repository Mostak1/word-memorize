<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_wordlist_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wordlist_id')->constrained('wordlists')->cascadeOnDelete();
            $table->integer('regular_sessions_count')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'wordlist_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_wordlist_sessions');
    }
};
