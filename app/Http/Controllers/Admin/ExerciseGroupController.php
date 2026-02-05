<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExerciseGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExerciseGroupController extends Controller
{
    /**
     * Display a listing of exercise groups.
     */
    public function index()
    {
        $exerciseGroups = ExerciseGroup::withCount('words')
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/ExerciseGroups/Index', [
            'exerciseGroups' => $exerciseGroups,
        ]);
    }

    /**
     * Store a newly created exercise group.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'status' => 'required|boolean',
        ]);

        ExerciseGroup::create($validated);

        // 🔑 Modal-friendly response
        return back()->with('success', 'Exercise group created successfully.');
    }

    /**
     * Display the specified exercise group with its words.
     */
    public function show(ExerciseGroup $exerciseGroup)
    {
        $exerciseGroup->load('words');

        return Inertia::render('Admin/ExerciseGroups/Show', [
            'exerciseGroup' => $exerciseGroup,
        ]);
    }

    /**
     * Update the specified exercise group.
     */
    public function update(Request $request, ExerciseGroup $exerciseGroup)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'status' => 'required|boolean',
        ]);

        $exerciseGroup->update($validated);

        // 🔑 Modal-friendly response
        return back()->with('success', 'Exercise group updated successfully.');
    }

    /**
     * Remove the specified exercise group.
     */
    public function destroy(ExerciseGroup $exerciseGroup)
    {
        $exerciseGroup->delete();

        return back()->with('success', 'Exercise group deleted successfully.');
    }
}
