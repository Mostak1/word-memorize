<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\WordList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizController extends Controller
{
	public function index()
	{
		$quizzes = Quiz::with(['wordList:id,title', 'creator:id,name'])
			->withCount('questions')
			->latest()
			->paginate(15);

		$wordLists = WordList::select('id', 'title')
			->orderBy('title')
			->get();

		return Inertia::render('Admin/Quizzes/Index', [
			'quizzes' => $quizzes,
			'wordLists' => $wordLists,
		]);
	}

	public function store(Request $request)
	{
		$validated = $request->validate([
			'wordlist_id' => 'required|exists:wordlists,id',
			'title' => 'nullable|string|max:255',
			'pass_mark' => 'required|integer|min:1|max:100',
			'is_active' => 'boolean',
		]);

		$quiz = Quiz::create([
			'wordlist_id' => $validated['wordlist_id'],
			'title' => $validated['title'] ?? null,
			'pass_mark' => $validated['pass_mark'],
			'is_active' => $validated['is_active'] ?? true,
			'created_by' => auth()->id(),
		]);

		return redirect()->route('admin.quizzes.show', $quiz->id)
			->with('success', 'Quiz created successfully. Now add questions to it.');

		// return redirect()->route('admin.quizzes.index')
		//   ->with('success', 'Quiz created successfully.');
	}

	public function show(Quiz $quiz)
	{

		$quiz->load([
			'wordList',
			'questions' => function ($q) {
				$q->with('word')->orderBy('sort_order');
			}
		]);

		$words = $quiz->wordList
			? $quiz->wordList->words()
				->select('id', 'word', 'definition')
				->orderBy('word')
				->get()
			: collect();

		return Inertia::render('Admin/Quizzes/Show', [
			'quiz' => $quiz,
			'words' => $words,
		]);
	}

	public function update(Request $request, Quiz $quiz)
	{
		$data = $request->validate([
			'title' => 'nullable|string|max:255',
			'pass_mark' => 'required|integer|min:1|max:100',
			'is_active' => 'boolean',
		]);

		$quiz->update($data);

		return back()->with('success', 'Quiz updated successfully.');
	}

	public function destroy(Quiz $quiz)
	{
		$quiz->delete();

		return redirect()->route('admin.quizzes.index')
			->with('success', 'Quiz deleted successfully.');
	}

	/**
	 * Return word count + words for a given word list.
	 * Called by QuizFormModal via fetch() when a word list is selected.
	 * Route: GET admin/quizzes/{wordList}/words  → admin.quizzes.wordlist-words
	 */
	public function wordListWords(WordList $wordList)
	{
		$words = $wordList->words()
			->select('id', 'word', 'definition')
			->orderBy('word')
			->get();

		return response()->json([
			'count' => $words->count(),
			'words' => $words,
		]);
	}
}