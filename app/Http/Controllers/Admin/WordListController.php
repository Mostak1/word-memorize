<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WordListController extends Controller
{
    /**
     * Display a listing of word lists.
     */
    public function index()
    {
        $wordLists = WordList::withCount('words')
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/WordLists/Index', [
            'wordLists' => $wordLists,
        ]);
    }

    /**
     * Store a newly created word list.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'price'      => 'required|numeric|min:0',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'status'     => 'required|boolean',
        ]);

        WordList::create($validated);

        return back()->with('success', 'Word list created successfully.');
    }

    /**
     * Display the specified word list with its words (searchable, sortable, paginated),
     * its subcategory list, and each word's gallery images.
     */
    public function show(Request $request, WordList $wordList)
    {
        $search  = $request->string('search')->trim()->value();
        $sortCol = in_array($request->input('sort'), ['word', 'definition'])
            ? $request->input('sort')
            : 'word';
        $sortDir = $request->input('direction') === 'desc' ? 'desc' : 'asc';

        $words = $wordList->words()
            ->with([
                'subcategory',
                'images',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('word', 'like', "%{$search}%")
                      ->orWhere('definition', 'like', "%{$search}%")
                      ->orWhere('bangla_meaning', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortCol, $sortDir)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/WordLists/Show', [
            'wordList'      => $wordList,
            'subcategories' => $wordList->subcategories,
            'words'         => $words,
            'filters'       => [
                'search'    => $search,
                'sort'      => $sortCol,
                'direction' => $sortDir,
            ],
        ]);
    }

    /**
     * Update the specified word list.
     */
    public function update(Request $request, WordList $wordList)
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'price'      => 'required|numeric|min:0',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'status'     => 'required|boolean',
        ]);

        $wordList->update($validated);

        return back()->with('success', 'Word list updated successfully.');
    }

    /**
     * Remove the specified word list.
     */
    public function destroy(WordList $wordList)
    {
        $wordList->delete();

        return back()->with('success', 'Word list deleted successfully.');
    }
}