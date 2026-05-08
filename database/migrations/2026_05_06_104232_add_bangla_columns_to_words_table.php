<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('words', function (Blueprint $table) {
            $table->text('bangla_collocations')->nullable()->after('collocations');
            $table->text('image_related_sentence_bangla')->nullable()->after('image_related_sentence');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('words', function (Blueprint $table) {
            $table->dropColumn(['bangla_collocations', 'image_related_sentence_bangla']);
        });
    }
};
