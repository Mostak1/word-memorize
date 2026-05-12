<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telemetry_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('client_session_id', 100)->unique();
            $table->string('anonymous_id', 100)->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->string('landing_path', 1024)->nullable();
            $table->string('exit_path', 1024)->nullable();
            $table->string('referrer', 1024)->nullable();
            $table->string('device_type', 40)->nullable();
            $table->string('browser', 80)->nullable();
            $table->string('platform', 120)->nullable();
            $table->string('timezone', 80)->nullable();
            $table->string('locale', 40)->nullable();
            $table->string('user_agent_hash', 64)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->unsignedInteger('pageview_count')->default(0);
            $table->unsignedInteger('event_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'started_at']);
            $table->index('last_seen_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetry_sessions');
    }
};
