<?php
namespace App\Http\Controllers;

use App\Models\BookmarkedWord;
use App\Models\Word;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    /** Toggle bookmark — add if missing, remove if present */
    public function toggle(Word $word)
    {
        $userId = Auth::id();

        $existing = BookmarkedWord::where('user_id', $userId)
            ->where('word_id', $word->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isBookmarked = false;
        } else {
            BookmarkedWord::create(['user_id' => $userId, 'word_id' => $word->id]);
            $isBookmarked = true;
        }

        return back()->with('bookmarked', $isBookmarked);
    }

    /** Show all bookmarked words */
    public function index()
    {
        $words = BookmarkedWord::where('user_id', Auth::id())
            ->with(['word.wordList', 'word.images'])
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn($entry) => $entry->word);

        return Inertia::render('BookmarkedWords', ['words' => $words]);
    }
}