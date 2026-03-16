<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasteredWord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasteredWordController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->value();

        $masteredWords = MasteredWord::with([
            'user:id,name,email',
            'word:id,word,definition,bangla_meaning,parts_of_speech_variations,wordlist_id',
            'word.wordList:id,title,difficulty',
        ])
            ->when($search, function ($query, $search) {
                $query->whereHas('word', fn($q) =>
                    $q->where('word', 'like', "%{$search}%")
                      ->orWhere('definition', 'like', "%{$search}%")
                )
                ->orWhereHas('user', fn($q) =>
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                );
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'total'        => MasteredWord::count(),
            'unique_users' => MasteredWord::distinct('user_id')->count('user_id'),
            'unique_words' => MasteredWord::distinct('word_id')->count('word_id'),
        ];

        return Inertia::render('Admin/MasteredWords/Index', [
            'masteredWords' => $masteredWords,
            'stats'         => $stats,
            'filters'       => ['search' => $search],
        ]);
    }

    public function destroy(MasteredWord $masteredWord)
    {
        $masteredWord->delete();

        return back()->with('success', 'Mastered entry removed.');
    }
}