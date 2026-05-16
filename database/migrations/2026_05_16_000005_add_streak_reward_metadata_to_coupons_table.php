<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            if (!Schema::hasColumn('coupons', 'assigned_user_id')) {
                $table->unsignedBigInteger('assigned_user_id')->nullable()->after('description');
            }

            if (!Schema::hasColumn('coupons', 'source')) {
                $table->string('source', 50)->nullable()->after('assigned_user_id');
            }

            if (!Schema::hasColumn('coupons', 'achievement_id')) {
                $table->unsignedBigInteger('achievement_id')->nullable()->after('source');
            }

            if (!Schema::hasColumn('coupons', 'course_only')) {
                $table->boolean('course_only')->nullable()->default(false)->after('achievement_id');
            }
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->unique(['assigned_user_id', 'source'], 'coupons_assigned_user_source_unique');
            $table->index('achievement_id', 'coupons_achievement_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropUnique('coupons_assigned_user_source_unique');
            $table->dropIndex('coupons_achievement_id_index');
            $table->dropColumn([
                'assigned_user_id',
                'source',
                'achievement_id',
                'course_only',
            ]);
        });
    }
};
