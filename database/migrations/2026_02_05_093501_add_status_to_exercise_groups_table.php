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
        Schema::table('exercise_groups', function (Blueprint $table) {
            // Add status column with default true (active)
            $table->boolean('status')->default(true)->after('difficulty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exercise_groups', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
