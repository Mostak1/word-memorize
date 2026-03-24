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
        Schema::table('words', function (Blueprint $table) {
            $table->text('parts_of_speech_variations')->nullable()->change();
            $table->text('definition')->nullable()->change();
            $table->text('bangla_meaning')->nullable()->change();
            $table->text('example_sentences')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('words', function (Blueprint $table) {
            $table->text('parts_of_speech_variations')->nullable(false)->change();
            $table->text('definition')->nullable(false)->change();
            $table->text('bangla_meaning')->nullable(false)->change();
            $table->text('example_sentences')->nullable(false)->change();
        });
    }
};