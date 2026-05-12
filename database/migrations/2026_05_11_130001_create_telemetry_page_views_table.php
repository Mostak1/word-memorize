<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telemetry_page_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('telemetry_session_id')->constrained()->cascadeOnDelete();
            $table->string('page_view_id', 100)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('anonymous_id', 100)->index();
            $table->string('path', 1024);
            $table->string('route_name', 160)->nullable();
            $table->string('component', 160)->nullable();
            $table->string('title', 255)->nullable();
            $table->string('referrer', 1024)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('duration_ms')->default(0);
            $table->unsignedInteger('active_duration_ms')->default(0);
            $table->unsignedTinyInteger('max_scroll_depth')->default(0);
            $table->string('exit_reason', 80)->nullable();
            $table->timestamps();

            $table->index(['telemetry_session_id', 'started_at']);
            $table->index(['user_id', 'started_at']);
            $table->index(['component', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetry_page_views');
    }
};
