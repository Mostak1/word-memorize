<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordList;
use App\Models\Word;
use App\Models\WordImage;
use Illuminate\Http\Request;

class WordImageController extends Controller
{
    /**
     * Update the caption (and optionally sort_order) of a single image.
     */
    public function update(
        Request $request,
        WordList $wordList,
        Word $word,
        WordImage $wordImage,
    ) {
        abort_if($wordImage->word_id !== $word->id, 403);

        $validated = $request->validate([
            'caption'    => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $wordImage->update($validated);

        return back()->with('success', 'Image updated.');
    }

    /**
     * Delete a single image (file + record).
     */
    public function destroy(
        WordList $wordList,
        Word $word,
        WordImage $wordImage,
    ) {
        abort_if($wordImage->word_id !== $word->id, 403);

        $wordImage->delete();

        return back()->with('success', 'Image deleted.');
    }
}