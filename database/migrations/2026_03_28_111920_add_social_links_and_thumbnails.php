<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            // JSON array of { platform, url, is_active, order }
            $table->json('social_links')->nullable()->after('custom_css');
        });

        Schema::table('links', function (Blueprint $table) {
            // Path to a thumbnail image stored in public disk
            $table->string('thumbnail')->nullable()->after('icon');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('social_links');
        });

        Schema::table('links', function (Blueprint $table) {
            $table->dropColumn('thumbnail');
        });
    }
};