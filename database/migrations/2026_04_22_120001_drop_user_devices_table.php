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
        Schema::dropIfExists('user_devices');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No easy way to reverse a drop without the full schema, 
        // and we don't need it back anyway.
    }
};
