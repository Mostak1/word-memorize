<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('error_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('page_url');
            $table->string('page_title')->nullable();
            $table->text('description');
            $table->string('image_path')->nullable(); // stored in storage/app/public/error-reports/
            $table->enum('status', ['open', 'resolved', 'dismissed'])->default('open');
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('error_reports');
    }
};