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
    Schema::create('user_devices', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('device_fingerprint', 128);
      $table->string('session_id')->nullable();
      $table->string('ip_address')->nullable();
      $table->text('user_agent')->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamp('last_activity')->nullable();
      $table->timestamps();

      $table->unique(['user_id', 'device_fingerprint'], 'user_device_user_fingerprint_unique');
      $table->index(['user_id', 'is_active']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('user_devices');
  }
};
