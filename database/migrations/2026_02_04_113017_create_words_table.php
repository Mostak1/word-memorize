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
        Schema::create('words', function (Blueprint $table) {
            $table->id();

            $table->foreignId('exercise_group_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('word');
            $table->string('hyphenation')->nullable();

            $table->text('parts_of_speech_variations');
            $table->text('definition');
            $table->text('bangla_translation');

            $table->text('collocations')->nullable();
            $table->text('example_sentences');

            $table->text('synonym')->nullable();
            $table->text('antonym')->nullable();

            $table->string('image_url')->nullable();
            $table->text('image_related_sentence')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('words');
    }
};
