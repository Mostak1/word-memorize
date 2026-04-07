<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            // ── Display preferences ───────────────────────────────────────────
            // Controls whether Bangla columns (bangla_meaning, bangla_pronunciation,
            // etc.) are shown in word tables, word detail cards, and exercise sessions.
            $table->boolean('show_bangla')->default(true);

            $table->timestamps();

            $table->unique('user_id'); // one row per user
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};