<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('words', function (Blueprint $table) {
            // Placed after hyphenation (col 6) to keep related columns together
            $table->string('bangla_pronunciation')->nullable()->after('pronunciation');
        });
    }

    public function down(): void
    {
        Schema::table('words', function (Blueprint $table) {
            $table->dropColumn('bangla_pronunciation');
        });
    }
};