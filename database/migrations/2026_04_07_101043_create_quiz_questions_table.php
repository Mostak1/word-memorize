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
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')
                ->constrained()
                ->onDelete('cascade');
            $table->foreignId('word_id')
                ->nullable()
                ->constrained('words')
                ->onDelete('set null');
            $table->enum('type', [
                'mcq_single',      // Single correct answer (classic MCQ)
                'mcq_multiple',    // Multiple correct answers
                'matching',        // Match left side with right side
                'true_false',
                // You can add more later: 'true_false', 'fill_in_blank', etc.
            ])->default('mcq_single');
            $table->text('question');
            $table->json('options')->nullable();           // e.g. ["Option 1", "Option 2", "Option 3", "Option 4"]
            // For matching type: store pairs as JSON
            // Example: [{"left": "Apple", "right": "Fruit"}, ...]
            $table->json('matching_pairs')->nullable();
            $table->string('correct_answer');              // exact string that must match one of the options
            $table->text('explanation')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['quiz_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};