<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telemetry_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_uuid', 100)->unique();
            $table->foreignId('telemetry_session_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('telemetry_page_view_id')->nullable()->constrained()->nullOnDelete();
            $table->string('page_view_client_id', 100)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('anonymous_id', 100)->nullable()->index();
            $table->string('name', 80);
            $table->string('path', 1024)->nullable();
            $table->string('route_name', 160)->nullable();
            $table->string('component', 160)->nullable();
            $table->timestamp('occurred_at');
            $table->json('properties')->nullable();
            $table->timestamps();

            $table->index(['name', 'occurred_at']);
            $table->index(['telemetry_session_id', 'occurred_at']);
            $table->index(['user_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetry_events');
    }
};
