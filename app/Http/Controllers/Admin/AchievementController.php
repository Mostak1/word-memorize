<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AchievementController extends Controller
{
  public function index()
  {
    $achievements = Achievement::orderBy('category')
      ->orderBy('tier')
      ->orderBy('milestone_value')
      ->get()
      ->groupBy('category');

    return Inertia::render('Admin/Achievements/Index', [
      'achievements' => $achievements,
    ]);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'key' => 'required|string|max:255|unique:achievements,key',
      'name' => 'required|string|max:255',
      'description' => 'required|string|max:1000',
      'icon' => 'nullable|string|max:255',
      'category' => 'required|string|in:streak,xp,morning,perfect',
      'tier' => 'required|integer|min:1|max:5',
      'milestone_value' => 'required|integer|min:1',
    ]);

    Achievement::create($validated);

    return back()->with('success', 'Achievement created successfully.');
  }

  public function update(Request $request, Achievement $achievement)
  {
    $validated = $request->validate([
      'key' => ['required', 'string', 'max:255', Rule::unique('achievements')->ignore($achievement->id)],
      'name' => 'required|string|max:255',
      'description' => 'required|string|max:1000',
      'icon' => 'nullable|string|max:255',
      'category' => 'required|string|in:streak,xp,morning,perfect',
      'tier' => 'required|integer|min:1|max:5',
      'milestone_value' => 'required|integer|min:1',
    ]);

    $achievement->update($validated);

    return back()->with('success', 'Achievement updated successfully.');
  }

  public function destroy(Achievement $achievement)
  {
    // Check if achievement has been awarded to users
    if ($achievement->userAchievements()->exists()) {
      return back()->with('error', 'Cannot delete achievement that has been awarded to users.');
    }

    $achievement->delete();

    return back()->with('success', 'Achievement deleted successfully.');
  }
}