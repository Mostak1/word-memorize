<?php
namespace App\Http\Controllers;

use App\Models\BookmarkedWord;
use App\Models\Word;
use App\Support\Telemetry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    /** Toggle bookmark — add if missing, remove if present */
    public function toggle(Request $request, Word $word)
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

        Telemetry::record($request, 'bookmark_toggled', [
            'word_id' => $word->id,
            'enabled' => $isBookmarked,
            'source' => 'server',
        ]);

        return back()->with('bookmarked', $isBookmarked);
    }

    /** Show all bookmarked words */
    public function index()
    {
        $userId = Auth::id();
        $words = BookmarkedWord::where('user_id', $userId)
            ->whereHas('word')
            ->with(['word.wordList.category', 'word.images'])
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function ($entry) use ($userId) {
                $word = $entry->word;
                if (!$word) return null;

                $category = $word->wordList?->category;
                $categoryLocked = (bool) ($category?->is_locked ?? false);
                $wordListLocked = (bool) ($word->wordList?->is_locked ?? false);
                
                $hasAccess = true;

                if ($categoryLocked && $wordListLocked && $category) {
                    $hasAccess = \App\Models\UserWordListAccess::where('user_id', $userId)
                        ->where('word_list_category_id', $category->id)
                        ->exists();
                }

                $word->is_locked = $categoryLocked && $wordListLocked;
                $word->has_access = $hasAccess;
                return $word;
            });

        return Inertia::render('BookmarkedWords', ['words' => $words]);
    }
}
