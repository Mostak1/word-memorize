<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasteredWordController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->value();

        // Fetch mastered words (box >= 4) from word_progress
        $masteredWords = WordProgress::where('box', '>=', WordProgress::MASTERED_BOX)
            ->with([
                'user:id,name,email',
                'word:id,word,definition,bangla_meaning,parts_of_speech_variations,wordlist_id',
                'word.wordList:id,title,difficulty',
            ])
            ->when($search, function ($query, $search) {
                $query->whereHas(
                    'word',
                    fn($q) =>
                    $q->where('word', 'like', "%{$search}%")
                        ->orWhere('definition', 'like', "%{$search}%")
                )
                    ->orWhereHas(
                        'user',
                        fn($q) =>
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                    );
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'total' => WordProgress::where('box', '>=', WordProgress::MASTERED_BOX)->count(),
            'unique_users' => WordProgress::where('box', '>=', WordProgress::MASTERED_BOX)
                ->distinct('user_id')
                ->count('user_id'),
            'unique_words' => WordProgress::where('box', '>=', WordProgress::MASTERED_BOX)
                ->distinct('word_id')
                ->count('word_id'),
        ];

        return Inertia::render('Admin/MasteredWords/Index', [
            'masteredWords' => $masteredWords,
            'stats' => $stats,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Demote a mastered word back to L3 (remove from mastery).
     * This is useful for admin correction if a word was incorrectly marked as mastered.
     */
    public function destroy(WordProgress $masteredWord)
    {
        $masteredWord->update(['box' => 3]);

        return back()->with('success', 'Word demoted from mastery (moved to Level 3).');
    }
}