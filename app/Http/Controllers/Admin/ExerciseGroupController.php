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
     * Display the specified exercise group with its words (searchable, sortable, paginated).
     */
    public function show(Request $request, ExerciseGroup $exerciseGroup)
    {
        $search    = $request->string('search')->trim()->value();
        $sortCol   = in_array($request->input('sort'), ['word', 'definition']) ? $request->input('sort') : 'word';
        $sortDir   = $request->input('direction') === 'desc' ? 'desc' : 'asc';

        $words = $exerciseGroup->words()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('word', 'like', "%{$search}%")
                      ->orWhere('definition', 'like', "%{$search}%")
                      ->orWhere('bangla_meaning', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortCol, $sortDir)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/ExerciseGroups/Show', [
            'exerciseGroup' => $exerciseGroup,
            'words'         => $words,
            'filters'       => [
                'search'    => $search,
                'sort'      => $sortCol,
                'direction' => $sortDir,
            ],
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