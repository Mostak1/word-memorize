<?php

namespace App\Http\Controllers;

use App\Models\ExerciseGroup;
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
            ->orderBy('difficulty')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Exercise', [
            'exerciseGroups' => $exerciseGroups,
        ]);
    }

    /**
     * Display a specific exercise group with its words (paginated)
     */
    public function show(Request $request, $id)
    {
        $exerciseGroup = ExerciseGroup::withCount('words')->findOrFail($id);

        $words = $exerciseGroup->words()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('ExerciseDetail', [
            'exerciseGroup' => $exerciseGroup,
            'words'         => $words,
        ]);
    }

    /**
     * Start an exercise session for a specific group
     */
    public function start($id)
    {
        $exerciseGroup = ExerciseGroup::with('words')->findOrFail($id);

        // Shuffle words for random order
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