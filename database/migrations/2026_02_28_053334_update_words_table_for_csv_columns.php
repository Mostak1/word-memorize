<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('words', function (Blueprint $table) {

            $table->string('pronunciation')->nullable()->after('word');

            $table->text('ai_prompt')->nullable()->after('example_sentences');

            // if you want Bangla meaning instead of bangla_translation
            $table->renameColumn('bangla_translation', 'bangla_meaning');

        });
    }

    public function down(): void
    {
        Schema::table('words', function (Blueprint $table) {

            $table->dropColumn('pronunciation');
            $table->dropColumn('ai_prompt');

            $table->renameColumn('bangla_meaning', 'bangla_translation');

        });
    }
};