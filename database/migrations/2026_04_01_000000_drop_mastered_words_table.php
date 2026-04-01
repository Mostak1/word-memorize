<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Drop mastered_words table — mastery now determined by word_progress.box >= 4
   *
   * Mastery is now tracked entirely in word_progress:
   *   - word_progress.box == 4 → word is mastered
   *   - Decrementing box (to 3 or lower) removes mastery status
   */
  public function up(): void
  {
    Schema::dropIfExists('mastered_words');
  }

  public function down(): void
  {
    Schema::create('mastered_words', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->foreignId('word_id')->constrained()->cascadeOnDelete();
      $table->timestamps();
      $table->unique(['user_id', 'word_id']);
    });
  }
};
