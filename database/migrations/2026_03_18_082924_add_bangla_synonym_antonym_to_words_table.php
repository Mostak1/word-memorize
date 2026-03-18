<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('words', function (Blueprint $table) {
            $table->text('bangla_synonym')->nullable()->after('antonym');
            $table->text('bangla_antonym')->nullable()->after('bangla_synonym');
        });
    }

    public function down(): void
    {
        Schema::table('words', function (Blueprint $table) {
            $table->dropColumn(['bangla_synonym', 'bangla_antonym']);
        });
    }
};