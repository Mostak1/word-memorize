<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('subcategories');
    }

    public function down(): void
    {
        Schema::create('subcategories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wordlist_id')->constrained('wordlists')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });
    }
};