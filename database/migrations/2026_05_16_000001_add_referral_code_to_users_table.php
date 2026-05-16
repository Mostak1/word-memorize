<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 16)->nullable()->unique()->after('remember_token');
        });

        DB::table('users')
            ->whereNull('referral_code')
            ->orderBy('id')
            ->select('id')
            ->chunkById(100, function ($users) {
                foreach ($users as $user) {
                    do {
                        $code = 'VPX' . Str::upper(Str::random(5));
                    } while (DB::table('users')->where('referral_code', $code)->exists());

                    DB::table('users')
                        ->where('id', $user->id)
                        ->update(['referral_code' => $code]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['referral_code']);
            $table->dropColumn('referral_code');
        });
    }
};
