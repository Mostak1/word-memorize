<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;

class QuizQuestionController extends Controller
{
    private const TYPES = ['mcq_single', 'mcq_multiple', 'matching', 'true_false', 'fill_blank'];

    private function rules(): array
    {
        return [
            'type' => 'required|in:' . implode(',', self::TYPES),
            'word_id' => 'nullable|exists:words,id',
            'question' => 'required|string',
            'options' => 'nullable|array',
            'correct_answer' => 'required',
            'matching_pairs' => 'nullable|array',
            'matching_pairs.*.left' => 'nullable|string',
            'matching_pairs.*.right' => 'nullable|string',
            'explanation' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }

    private function prepareData(array $data): array
    {
        // For mcq_multiple the correct_answer arrives as an array — JSON-encode it
        if ($data['type'] === 'mcq_multiple' && is_array($data['correct_answer'])) {
            $data['correct_answer'] = json_encode($data['correct_answer']);
        }

        // matching type stores pairs; correct_answer sentinel = "matching"
        if ($data['type'] === 'matching') {
            $data['correct_answer'] = 'matching';
        }

        return $data;
    }

    public function store(Request $request, Quiz $quiz)
    {
        $data = $this->prepareData($request->validate($this->rules()));
        $data['sort_order'] = ($quiz->questions()->max('sort_order') ?? -1) + 1;

        $quiz->questions()->create($data);

        return back()->with('success', 'Question added successfully.');
    }

    public function update(Request $request, Quiz $quiz, QuizQuestion $question)
    {
        $data = $this->prepareData($request->validate($this->rules()));

        $question->update($data);

        return back()->with('success', 'Question updated successfully.');
    }

    public function destroy(Quiz $quiz, QuizQuestion $question)
    {
        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }

    public function reorder(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|exists:quiz_questions,id',
            'order.*.sort_order' => 'required|integer|min:0',
        ]);

        // Security: only questions belonging to this quiz
        $ids = array_column($validated['order'], 'id');
        if (QuizQuestion::whereIn('id', $ids)->where('quiz_id', '!=', $quiz->id)->exists()) {
            abort(403, 'Unauthorized');
        }

        foreach ($validated['order'] as $item) {
            QuizQuestion::where('id', $item['id'])->update([
                'sort_order' => $item['sort_order'],
            ]);
        }

        return redirect()->route('admin.quizzes.show', $quiz->id)->with('success', 'Questions reordered successfully.');
    }
}