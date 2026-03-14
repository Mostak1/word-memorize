<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExerciseGroup;
use App\Models\Word;
use App\Models\WordImage;
use Illuminate\Http\Request;

class WordImageController extends Controller
{
  /**
   * Update the caption (and optionally sort_order) of a single image.
   * Useful for inline caption editing without re-submitting the whole word form.
   */
  public function update(
    Request $request,
    ExerciseGroup $exerciseGroup,
    Word $word,
    WordImage $wordImage,
  ) {
    abort_if($wordImage->word_id !== $word->id, 403);

    $validated = $request->validate([
      'caption' => 'nullable|string|max:500',
      'sort_order' => 'nullable|integer|min:0',
    ]);

    $wordImage->update($validated);

    return back()->with('success', 'Image updated.');
  }

  /**
   * Delete a single image (file + record).
   * Triggered by the "×" button on each image card in the edit dialog.
   */
  public function destroy(
    ExerciseGroup $exerciseGroup,
    Word $word,
    WordImage $wordImage,
  ) {
    abort_if($wordImage->word_id !== $word->id, 403);

    // WordImage::deleting hook removes the physical file from storage
    $wordImage->delete();

    return back()->with('success', 'Image deleted.');
  }
}