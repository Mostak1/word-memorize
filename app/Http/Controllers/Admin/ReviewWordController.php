<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReviewWord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewWordController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->value();

        $reviewWords = ReviewWord::with([
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
            'total' => ReviewWord::count(),
            'unique_users' => ReviewWord::distinct('user_id')->count('user_id'),
            'unique_words' => ReviewWord::distinct('word_id')->count('word_id'),
        ];

        return Inertia::render('Admin/ReviewWords/Index', [
            'reviewWords' => $reviewWords,
            'stats' => $stats,
            'filters' => ['search' => $search],
        ]);
    }

    public function destroy(ReviewWord $reviewWord)
    {
        $reviewWord->delete();

        return back()->with('success', 'Review entry removed.');
    }
}