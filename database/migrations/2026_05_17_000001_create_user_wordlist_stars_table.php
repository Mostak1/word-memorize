<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_wordlist_stars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wordlist_id')->constrained('wordlists')->cascadeOnDelete();
            $table->unsignedTinyInteger('stars')->default(0);
            $table->timestamp('last_star_earned_at')->nullable();
            $table->timestamp('next_star_available_at')->nullable();
            $table->timestamp('last_attempted_at')->nullable();
            $table->string('last_reward_type')->nullable();
            $table->unsignedInteger('last_reward_amount')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'wordlist_id']);
            $table->index(['user_id', 'next_star_available_at']);
        });

        $this->backfillAlreadyMasteredWordlists();
    }

    public function down(): void
    {
        Schema::dropIfExists('user_wordlist_stars');
    }

    private function backfillAlreadyMasteredWordlists(): void
    {
        $now = now();

        $wordCounts = DB::table('words')
            ->select('wordlist_id', DB::raw('COUNT(*) as total_words'))
            ->whereNotNull('wordlist_id')
            ->groupBy('wordlist_id');

        $masteredCounts = DB::table('word_progress')
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->select(
                'word_progress.user_id',
                'words.wordlist_id',
                DB::raw('COUNT(DISTINCT words.id) as mastered_words'),
                DB::raw('MAX(word_progress.last_reviewed_at) as completed_at')
            )
            ->where('word_progress.box', '>=', 4)
            ->whereNotNull('words.wordlist_id')
            ->groupBy('word_progress.user_id', 'words.wordlist_id');

        DB::query()
            ->fromSub($masteredCounts, 'mastered')
            ->joinSub($wordCounts, 'word_counts', function ($join) {
                $join->on('mastered.wordlist_id', '=', 'word_counts.wordlist_id');
            })
            ->whereColumn('mastered.mastered_words', '>=', 'word_counts.total_words')
            ->orderBy('mastered.user_id')
            ->orderBy('mastered.wordlist_id')
            ->chunk(500, function ($rows) use ($now) {
                $payload = $rows->map(function ($row) use ($now) {
                    $completedAt = $row->completed_at ?: $now;

                    return [
                        'user_id' => $row->user_id,
                        'wordlist_id' => $row->wordlist_id,
                        'stars' => 1,
                        'last_star_earned_at' => $completedAt,
                        'next_star_available_at' => $now,
                        'last_attempted_at' => $completedAt,
                        'last_reward_type' => null,
                        'last_reward_amount' => 0,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                })->all();

                if (!empty($payload)) {
                    DB::table('user_wordlist_stars')->insertOrIgnore($payload);
                }
            });
    }
};
