<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('words', function (Blueprint $table) {
            // Drop the old foreign key constraint first
            $table->dropForeign(['exercise_group_id']);

            // Rename the column
            $table->renameColumn('exercise_group_id', 'wordlist_id');
        });

        Schema::table('words', function (Blueprint $table) {
            // Re-add the foreign key pointing at the renamed table
            $table->foreign('wordlist_id')
                  ->references('id')
                  ->on('wordlists')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('words', function (Blueprint $table) {
            $table->dropForeign(['wordlist_id']);
            $table->renameColumn('wordlist_id', 'exercise_group_id');
        });

        Schema::table('words', function (Blueprint $table) {
            $table->foreign('exercise_group_id')
                  ->references('id')
                  ->on('exercise_groups')
                  ->onDelete('cascade');
        });
    }
};