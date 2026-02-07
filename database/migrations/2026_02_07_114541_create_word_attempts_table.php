<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('word_attempts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('word_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('exercise_group_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('result', ['correct', 'wrong']);

            $table->timestamp('attempted_at')->useCurrent();

            $table->index(['user_id', 'word_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('word_attempts');
    }
};
