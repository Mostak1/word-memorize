<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordList;
use App\Models\WordListCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class WordListController extends Controller
{
    // public function index(Request $request)
    // {
    //     $query = WordList::with('category')
    //         ->withCount('words')
    //         ->latest();

    //     if ($request->filled('category')) {
    //         $query->where('word_list_category_id', $request->category);
    //     }

    //     $wordLists = $query->paginate(10)->withQueryString();
    //     $categories = WordListCategory::orderBy('name')->get(['id', 'name']);

    //     return Inertia::render('Admin/WordLists/Index', [
    //         'wordLists' => $wordLists,
    //         'categories' => $categories,
    //         'filters' => $request->only('category'),
    //     ]);
    // }

    public function index()
    {
        $categories = WordListCategory::with([
            'wordLists' => function ($query) {
                $query->withCount('words')
                    ->orderByRaw('LENGTH(title), title');
            }
        ])
            ->withCount('wordLists')
            ->orderBy('name')
            ->paginate(10);

        return Inertia::render('Admin/WordLists/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        Log::info($request->all());
        $validated = $request->validate([
            'word_list_category_id' => 'required|exists:word_list_categories,id',
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'status' => 'required|boolean',
        ]);

        // Cast empty string from the "No category" select option to null
        $validated['word_list_category_id'] = $validated['word_list_category_id'] ?: null;

        WordList::create($validated);

        return back()->with('success', 'Word list created successfully.');
    }

    public function show(Request $request, WordList $wordList)
    {
        $search = $request->string('search')->trim()->value();
        $sortCol = in_array($request->input('sort'), ['word', 'definition'])
            ? $request->input('sort')
            : 'word';
        $sortDir = $request->input('direction') === 'desc' ? 'desc' : 'asc';

        $words = $wordList->words()
            ->with('images')
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

        // Pass categories so the "Edit List" dialog can populate its dropdown
        // $categories = WordListCategory::orderBy('name')->get(['id', 'name']);
        // dd($words);

        return Inertia::render('Admin/WordLists/Show', [
            'wordList' => $wordList->load('category'),
            'words' => $words,
            // 'categories' => $categories,
            'filters' => [
                'search' => $search,
                'sort' => $sortCol,
                'direction' => $sortDir,
            ],
        ]);
    }

    public function update(Request $request, WordList $wordList)
    {
        $validated = $request->validate([
            'word_list_category_id' => 'required|exists:word_list_categories,id',
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'status' => 'required|boolean',
        ]);

        $validated['word_list_category_id'] = $validated['word_list_category_id'] ?: null;

        $wordList->update($validated);

        return back()->with('success', 'Word list updated successfully.');
    }

    public function destroy(WordList $wordList)
    {
        $wordList->delete();

        return back()->with('success', 'Word list deleted successfully.');
    }
}