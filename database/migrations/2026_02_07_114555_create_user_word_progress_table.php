<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_word_progress', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('word_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedInteger('correct_count')->default(0);
            $table->unsignedInteger('wrong_count')->default(0);

            $table->enum('last_result', ['correct', 'wrong'])->nullable();

            $table->unsignedTinyInteger('mastery_level')
                ->default(0)
                ->comment('0–5 mastery scale');

            $table->timestamp('last_attempted_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'word_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_word_progress');
    }
};
