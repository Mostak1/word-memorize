<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExerciseGroup;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WordController extends Controller
{
    // ── Shared validation rules ───────────────────────────────────────────────

    private function wordRules(): array
    {
        return [
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'word' => 'required|string|max:255',
            'pronunciation' => 'nullable|string|max:255',
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

    public function store(Request $request, ExerciseGroup $exerciseGroup)
    {
        $validated = $request->validate(array_merge($this->wordRules(), $this->imageRules()));

        $validated['subcategory_id'] = $validated['subcategory_id'] ?: null;

        $wordData = collect($validated)->except(['images', 'new_captions'])->all();

        $word = $exerciseGroup->words()->create($wordData);

        $this->storeNewImages($request, $word, startOrder: 0);

        return back()->with('success', 'Word added successfully.');
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function update(Request $request, ExerciseGroup $exerciseGroup, Word $word)
    {
        $validated = $request->validate(array_merge($this->wordRules(), $this->imageRules(), [
            'remove_image_ids' => 'nullable|array',
            'remove_image_ids.*' => 'integer|exists:word_images,id',
            'existing_captions' => 'nullable|array',
            'existing_captions.*' => 'nullable|string|max:500',
        ]));

        $validated['subcategory_id'] = $validated['subcategory_id'] ?: null;

        $wordData = collect($validated)
            ->except(['images', 'new_captions', 'remove_image_ids', 'existing_captions'])
            ->all();

        $word->update($wordData);

        if (!empty($validated['remove_image_ids'])) {
            $word->images()
                ->whereIn('id', $validated['remove_image_ids'])
                ->get()
                ->each(fn($img) => $img->delete());
        }

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

    public function destroy(ExerciseGroup $exerciseGroup, Word $word)
    {
        $word->delete();

        return back()->with('success', 'Word deleted successfully.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Upload images and save WordImage records.
     *
     * DB stores image_url as "/words/filename.jpg"
     *   - starts with /  → clearly a relative storage path
     *   - no "storage/"  → portable across all environments
     *
     * The WordImage accessor rebuilds the full URL as:
     *   asset('storage' . $image_url)  →  asset('storage/words/filename.jpg')
     * which works on any server where public/storage symlink exists.
     */
    private function storeNewImages(Request $request, Word $word, int $startOrder): void
    {
        if (!$request->hasFile('images')) {
            return;
        }

        foreach ($request->file('images') as $index => $file) {
            // store() returns "words/filename.jpg" — prepend "/" for DB
            $storedPath = $file->store('words', 'public');
            $imageUrl = '/' . $storedPath;   // DB value: /words/filename.jpg

            $word->images()->create([
                'image_url' => $imageUrl,
                'caption' => $request->input("new_captions.{$index}") ?: null,
                'sort_order' => $startOrder + $index,
            ]);
        }
    }
}