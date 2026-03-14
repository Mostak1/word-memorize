<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExerciseGroup;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WordController extends Controller
{
    public function store(Request $request, ExerciseGroup $exerciseGroup)
    {
        $validated = $request->validate([
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'word' => 'required|string|max:255',
            'pronunciation' => 'nullable|string|max:255',
            'hyphenation' => 'nullable|string',
            'parts_of_speech_variations' => 'required|string',
            'definition' => 'required|string',
            'bangla_meaning' => 'required|string',
            'collocations' => 'nullable|string',
            'example_sentences' => 'required|string',
            'ai_prompt' => 'nullable|string',
            'synonym' => 'nullable|string',
            'antonym' => 'nullable|string',
            'image_url' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'image_related_sentence' => 'nullable|string',
        ]);

        // Treat empty string as null for the FK
        $validated['subcategory_id'] = $validated['subcategory_id'] ?: null;

        // Handle image upload
        if ($request->hasFile('image_url')) {
            $path = $request->file('image_url')->store('words', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        $exerciseGroup->words()->create($validated);

        return back()->with('success', 'Word added successfully');
    }

    public function update(Request $request, ExerciseGroup $exerciseGroup, Word $word)
    {
        $validated = $request->validate([
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'word' => 'required|string|max:255',
            'pronunciation' => 'nullable|string|max:255',
            'hyphenation' => 'nullable|string',
            'parts_of_speech_variations' => 'required|string',
            'definition' => 'required|string',
            'bangla_meaning' => 'required|string',
            'collocations' => 'nullable|string',
            'example_sentences' => 'required|string',
            'ai_prompt' => 'nullable|string',
            'synonym' => 'nullable|string',
            'antonym' => 'nullable|string',
            'image_url' => 'nullable|file|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'remove_image' => 'nullable|boolean',
            'image_related_sentence' => 'nullable|string',
        ]);

        // Treat empty string as null for the FK
        $validated['subcategory_id'] = $validated['subcategory_id'] ?: null;

        // Handle image upload / removal
        if ($request->hasFile('image_url')) {
            // Delete old image
            if ($word->image_url) {
                $oldPath = ltrim(str_replace('/storage/', '', parse_url($word->image_url, PHP_URL_PATH)), '/');
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $path = $request->file('image_url')->store('words', 'public');
            $validated['image_url'] = Storage::url($path);
        } elseif ($request->boolean('remove_image')) {
            if ($word->image_url) {
                $oldPath = ltrim(str_replace('/storage/', '', parse_url($word->image_url, PHP_URL_PATH)), '/');
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $validated['image_url'] = null;
        } else {
            // Keep existing image — don't overwrite it
            unset($validated['image_url']);
        }

        unset($validated['remove_image']);

        $word->update($validated);

        return back()->with('success', 'Word updated successfully');
    }

    /**
     * Remove the specified word.
     */
    public function destroy(ExerciseGroup $exerciseGroup, Word $word)
    {
        if ($word->image_url) {
            $path = ltrim(str_replace('/storage/', '', parse_url($word->image_url, PHP_URL_PATH)), '/');
            Storage::disk('public')->delete($path);
        }

        $word->delete();

        return back()->with('success', 'Word deleted successfully');
    }
}