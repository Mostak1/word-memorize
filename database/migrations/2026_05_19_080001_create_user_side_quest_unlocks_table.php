<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_side_quest_unlocks', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('word_list_category_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('best_score')->default(0); // maximum correct answers in one run (out of 20)
            $table->unsignedInteger('best_lives_remaining')->default(0); // maximum remaining hearts (0 to 3)
            $table->unsignedInteger('attempts_count')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->primary(['user_id', 'word_list_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_side_quest_unlocks');
    }
};
