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
            'is_locked' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('word_categories', 'public');
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
            'is_locked' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'remove_thumbnail' => 'nullable|boolean',
        ]);

        if (!empty($validated['remove_thumbnail'])) {
            if ($category->thumbnail) {
                $storagePath = ltrim($category->thumbnail, '/');
                if (Storage::disk('public')->exists($storagePath)) {
                    Storage::disk('public')->delete($storagePath);
                }
            }
            $validated['thumbnail'] = null;
        }

        if ($request->hasFile('thumbnail')) {
            if ($category->thumbnail) {
                $storagePath = ltrim($category->thumbnail, '/');
                if (Storage::disk('public')->exists($storagePath)) {
                    Storage::disk('public')->delete($storagePath);
                }
            }
            $path = $request->file('thumbnail')->store('word_categories', 'public');
            $validated['thumbnail'] = '/' . $path;
        }

        unset($validated['remove_thumbnail']);

        $category->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(WordListCategory $category)
    {
        foreach ($category->wordLists as $wordList) {
            $wordList->words()->delete();
            $wordList->delete();
        }

        $category->delete();

        return back()->with('success', 'Category and all its word lists deleted successfully.');
    }
}
