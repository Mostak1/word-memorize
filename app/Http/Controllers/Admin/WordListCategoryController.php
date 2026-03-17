<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordListCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WordListCategoryController extends Controller
{
    public function index()
    {
        $categories = WordListCategory::withCount('wordLists')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/WordListCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:word_list_categories,name',
            'description' => 'nullable|string|max:1000',
            'status' => 'boolean',
        ]);

        WordListCategory::create($validated);

        return back(); // Inertia modal stays open until JS closes it
    }

    /**
     * Update an existing category
     */
    public function update(Request $request, WordListCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:word_list_categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
            'status' => 'boolean',
        ]);

        $category->update($validated);

        return back();
    }

    public function destroy(WordListCategory $category)
    {
        // Cascade-delete all word lists (and their words) under this category
        foreach ($category->wordLists as $wordList) {
            $wordList->words()->delete();
            $wordList->delete();
        }

        $category->delete();

        return back()->with('success', 'Category and all its word lists deleted successfully.');
    }
}