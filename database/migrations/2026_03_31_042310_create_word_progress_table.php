<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Leitner System — 5 boxes, each with a longer review interval.
     *
     *  Box 1 → 1 day   (new / just missed)
     *  Box 2 → 3 days
     *  Box 3 → 7 days
     *  Box 4 → 14 days
     *  Box 5 → 30 days  (effectively mastered — also written to mastered_words)
     *
     * next_review_at = null  means "show immediately" (brand-new word, never seen).
     */
    public function up(): void
    {
        Schema::create('word_progress', function (Blueprint $table) {
            $table->id();

            // Ensure same type as users.id
            $table->unsignedBigInteger('user_id');

            // Ensure same type as words.id
            $table->unsignedBigInteger('word_id');

            // Foreign keys (defined AFTER columns)
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('word_id')
                ->references('id')
                ->on('words')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('box')->default(1);

            $table->timestamp('next_review_at')->nullable();

            $table->unsignedInteger('correct_count')->default(0);
            $table->unsignedInteger('incorrect_count')->default(0);

            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'word_id']);
            $table->index(['user_id', 'next_review_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('word_progress');
    }
};