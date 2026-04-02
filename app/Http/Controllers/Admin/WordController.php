<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Word;
use App\Models\WordList;
use Illuminate\Http\Request;

class WordController extends Controller
{
    // ── Shared validation rules ───────────────────────────────────────────────

    private function wordRules(): array
    {
        return [
            'word' => 'required|string|max:255',
            'pronunciation' => 'nullable|string|max:255',
            'ipa' => 'nullable|string|max:255',
            'bangla_pronunciation' => 'nullable|string|max:255',
            'hyphenation' => 'nullable|string',
            'parts_of_speech_variations' => 'required|string',
            'definition' => 'required|string',
            'bangla_meaning' => 'required|string',
            'collocations' => 'nullable|string',
            'example_sentences' => 'required|string',
            'ai_prompt' => 'nullable|string',
            'synonym' => 'nullable|string',
            'antonym' => 'nullable|string',
            'is_public' => 'boolean',
        ];
    }

    private function imageRules(): array
    {
        return [
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'new_captions' => 'nullable|array',
            'new_captions.*' => 'nullable|string|max:500',
        ];
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    public function store(Request $request, WordList $wordList)
    {
        $validated = $request->validate(array_merge($this->wordRules(), $this->imageRules()));

        $wordData = collect($validated)->except(['images', 'new_captions'])->all();

        $wordData['is_public'] = $wordData['is_public'] ?? true;  // ← add this
        $wordData['created_by'] = auth()->id();

        $word = $wordList->words()->create($wordData);

        $this->storeNewImages($request, $word, startOrder: 0);

        return back()->with('success', 'Word added successfully.');
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function update(Request $request, WordList $wordList, Word $word)
    {
        $validated = $request->validate(array_merge($this->wordRules(), $this->imageRules(), [
            'remove_image_ids' => 'nullable|array',
            'remove_image_ids.*' => 'integer|exists:word_images,id',
            'existing_captions' => 'nullable|array',
            'existing_captions.*' => 'nullable|string|max:500',
        ]));

        $wordData = collect($validated)
            ->except(['images', 'new_captions', 'remove_image_ids', 'existing_captions'])
            ->all();

        $word->update($wordData);

        // Delete images marked for removal
        if (!empty($validated['remove_image_ids'])) {
            $word->images()
                ->whereIn('id', $validated['remove_image_ids'])
                ->get()
                ->each(fn($img) => $img->delete());
        }

        // Update captions for remaining existing images
        if (!empty($validated['existing_captions'])) {
            foreach ($validated['existing_captions'] as $imageId => $caption) {
                $word->images()
                    ->where('id', (int) $imageId)
                    ->update(['caption' => $caption ?? null]);
            }
        }

        $maxOrder = $word->images()->max('sort_order') ?? -1;
        $this->storeNewImages($request, $word, startOrder: $maxOrder + 1);

        return back()->with('success', 'Word updated successfully.');
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function destroy(WordList $wordList, Word $word)
    {
        $word->delete();

        return back()->with('success', 'Word deleted successfully.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function storeNewImages(Request $request, Word $word, int $startOrder): void
    {
        if (!$request->hasFile('images')) {
            return;
        }

        foreach ($request->file('images') as $index => $file) {
            $storedPath = $file->store('words', 'public');

            $word->images()->create([
                'image_url' => '/' . $storedPath, // DB stores: /words/filename.jpg
                'caption' => $request->input("new_captions.{$index}") ?: null,
                'sort_order' => $startOrder + $index,
            ]);
        }
    }
}