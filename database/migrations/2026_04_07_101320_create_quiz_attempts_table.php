<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');
            $table->foreignId('quiz_id')
                ->constrained()
                ->onDelete('cascade');
            $table->unsignedInteger('correct_count');
            $table->unsignedInteger('total_questions');
            $table->decimal('score', 5, 2);           // percentage e.g. 85.50
            $table->boolean('passed');
            $table->json('answers')->nullable();      // { "question_id_1": "selected answer", ... }
            $table->timestamp('attempted_at')->useCurrent();
            $table->timestamp('next_attempt_at')->nullable(); // for "retry tomorrow" logic
            $table->timestamps();

            $table->index(['user_id', 'quiz_id', 'attempted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};