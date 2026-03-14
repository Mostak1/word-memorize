<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExerciseGroup;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class SubcategoryController extends Controller
{
  /**
   * Store a new subcategory under an exercise group.
   */
  public function store(Request $request, ExerciseGroup $exerciseGroup)
  {
    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
    ]);

    $subcategory = $exerciseGroup->subcategories()->create($validated);

    return back()->with('success', 'Subcategory created.');
  }

  /**
   * Update an existing subcategory.
   */
  public function update(Request $request, ExerciseGroup $exerciseGroup, Subcategory $subcategory)
  {
    abort_if($subcategory->exercise_group_id !== $exerciseGroup->id, 403);

    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
    ]);

    $subcategory->update($validated);

    return back()->with('success', 'Subcategory updated.');
  }

  /**
   * Delete a subcategory (words keep their data, subcategory_id becomes null via nullOnDelete).
   */
  public function destroy(ExerciseGroup $exerciseGroup, Subcategory $subcategory)
  {
    abort_if($subcategory->exercise_group_id !== $exerciseGroup->id, 403);

    $subcategory->delete();

    return back()->with('success', 'Subcategory deleted.');
  }
}