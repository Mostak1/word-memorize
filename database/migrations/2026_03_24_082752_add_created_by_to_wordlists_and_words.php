<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('word_list_categories', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('status');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
        // WordList table
        Schema::table('wordlists', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('is_locked');
            $table->boolean('is_public')->default(false)->after('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        // Word table
        Schema::table('words', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('antonym');
            $table->boolean('is_public')->default(false)->after('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('word_list_categories', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        });

        Schema::table('words', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn(['created_by', 'is_public']);
        });

        Schema::table('wordlists', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn(['created_by', 'is_public']);
        });
    }
};