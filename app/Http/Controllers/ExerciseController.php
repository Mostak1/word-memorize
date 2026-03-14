<?php

namespace App\Http\Controllers;

use App\Models\ExerciseGroup;
use App\Models\Subcategory;
use App\Models\Word;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExerciseController extends Controller
{
    /**
     * Display a listing of all exercise groups
     */
    public function index()
    {
        $exerciseGroups = ExerciseGroup::withCount('words')
            ->where('status', true)
            ->orderBy('difficulty')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Exercise', [
            'exerciseGroups' => $exerciseGroups,
        ]);
    }

    /**
     * Display a specific exercise group:
     * - If it has subcategories → show subcategory list
     * - If no subcategories → show words directly (fallback)
     */
    public function show(Request $request, $id)
    {
        $exerciseGroup = ExerciseGroup::withCount('words')->findOrFail($id);

        // Load subcategories with their word counts
        $subcategories = Subcategory::where('exercise_group_id', $id)
            ->withCount('words')
            ->orderBy('name')
            ->get();

        if ($subcategories->isEmpty()) {
            // No subcategories — fall back to showing words directly
            $words = $exerciseGroup->words()
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('ExerciseDetail', [
                'exerciseGroup' => $exerciseGroup,
                'subcategories' => [],
                'words' => $words,
            ]);
        }

        // Has subcategories — pass them, no words needed on this screen
        return Inertia::render('ExerciseDetail', [
            'exerciseGroup' => $exerciseGroup,
            'subcategories' => $subcategories,
            'words' => null,
        ]);
    }

    /**
     * Show words for a specific subcategory within an exercise group
     */
    public function showSubcategory(Request $request, $groupId, $subcategoryId)
    {
        $exerciseGroup = ExerciseGroup::withCount('words')->findOrFail($groupId);

        $subcategory = Subcategory::where('id', $subcategoryId)
            ->where('exercise_group_id', $groupId)
            ->withCount('words')
            ->firstOrFail();

        $words = Word::where('exercise_group_id', $groupId)
            ->where('subcategory_id', $subcategoryId)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('ExerciseSubcategory', [
            'exerciseGroup' => $exerciseGroup,
            'subcategory' => $subcategory,
            'words' => $words,
        ]);
    }

    /**
     * Start an exercise session for a specific group
     */
    public function start($id)
    {
        $exerciseGroup = ExerciseGroup::with('words')->findOrFail($id);

        $words = $exerciseGroup->words->shuffle();

        return Inertia::render('ExerciseSession', [
            'exerciseGroup' => $exerciseGroup,
            'words' => $words,
        ]);
    }

    /**
     * Get exercise groups filtered by difficulty
     */
    public function byDifficulty($difficulty)
    {
        $exerciseGroups = ExerciseGroup::difficulty($difficulty)
            ->withCount('words')
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Exercise', [
            'exerciseGroups' => $exerciseGroups,
            'currentDifficulty' => $difficulty,
        ]);
    }

    /**
     * Display a single word detail page
     */
    public function showWord($id)
    {
        $word = Word::with('exerciseGroup')->findOrFail($id);

        return Inertia::render('WordDetail', [
            'word' => $word,
            'exerciseGroup' => $word->exerciseGroup,
        ]);
    }
}