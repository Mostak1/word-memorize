<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * NOTE: The legacy `image_url` and `image_related_sentence` columns on the
     * `words` table are intentionally left in place for backward compatibility.
     * New image uploads use this `word_images` table exclusively.
     */
    public function up(): void
    {
        Schema::create('word_images', function (Blueprint $table) {
            $table->id();

            $table->foreignId('word_id')
                ->constrained()
                ->cascadeOnDelete(); // deleting a Word removes all its images

            $table->string('image_url');           // relative storage path  e.g. /storage/words/abc.jpg
            $table->string('caption')->nullable(); // sentence that describes the image
            $table->unsignedSmallInteger('sort_order')->default(0); // display order

            $table->timestamps();

            $table->index(['word_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('word_images');
    }
};