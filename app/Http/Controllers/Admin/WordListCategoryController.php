<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordListCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('thumbnail')) {
            // Store under storage/app/public/word_categories/
            $path = $request->file('thumbnail')->store('word_categories', 'public');
            // Persist as "/word_categories/filename.ext" (leading slash)
            $validated['thumbnail'] = '/' . $path;
        }

        $validated['created_by'] = auth()->id();

        WordListCategory::create($validated);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, WordListCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:word_list_categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
            'status' => 'boolean',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'remove_thumbnail' => 'nullable|boolean',
        ]);

        // ── Handle thumbnail removal ──────────────────────────────────────────
        if (!empty($validated['remove_thumbnail'])) {
            if ($category->thumbnail) {
                $storagePath = ltrim($category->thumbnail, '/');
                if (Storage::disk('public')->exists($storagePath)) {
                    Storage::disk('public')->delete($storagePath);
                }
            }
            $validated['thumbnail'] = null;
        }

        // ── Handle new thumbnail upload ───────────────────────────────────────
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail first
            if ($category->thumbnail) {
                $storagePath = ltrim($category->thumbnail, '/');
                if (Storage::disk('public')->exists($storagePath)) {
                    Storage::disk('public')->delete($storagePath);
                }
            }

            $path = $request->file('thumbnail')->store('word_categories', 'public');
            $validated['thumbnail'] = '/' . $path;
        }

        // Remove helper flag before mass-assigning
        unset($validated['remove_thumbnail']);

        $category->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(WordListCategory $category)
    {
        // Cascade-delete all word lists (and their words) under this category
        foreach ($category->wordLists as $wordList) {
            $wordList->words()->delete();
            $wordList->delete();
        }

        // Model booted() hook auto-deletes the thumbnail file
        $category->delete();

        return back()->with('success', 'Category and all its word lists deleted successfully.');
    }
}