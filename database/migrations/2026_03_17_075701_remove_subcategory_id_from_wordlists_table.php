<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('words', function (Blueprint $table) {
            // Drop FK constraint first, then the column
            $table->dropForeign(['subcategory_id']);
            $table->dropColumn('subcategory_id');
        });
    }

    public function down(): void
    {
        Schema::table('words', function (Blueprint $table) {
            $table->foreignId('subcategory_id')
                ->nullable()
                ->constrained('subcategories')
                ->nullOnDelete();
        });
    }
};