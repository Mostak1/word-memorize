<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordList;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class SubcategoryController extends Controller
{
    /**
     * Store a new subcategory under a word list.
     */
    public function store(Request $request, WordList $wordList)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $wordList->subcategories()->create($validated);

        return back()->with('success', 'Subcategory created.');
    }

    /**
     * Update an existing subcategory.
     */
    public function update(Request $request, WordList $wordList, Subcategory $subcategory)
    {
        abort_if($subcategory->wordlist_id !== $wordList->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $subcategory->update($validated);

        return back()->with('success', 'Subcategory updated.');
    }

    /**
     * Delete a subcategory.
     */
    public function destroy(WordList $wordList, Subcategory $subcategory)
    {
        abort_if($subcategory->wordlist_id !== $wordList->id, 403);

        $subcategory->delete();

        return back()->with('success', 'Subcategory deleted.');
    }
}