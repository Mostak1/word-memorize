<?php

namespace App\Http\Controllers;

use App\Models\Word;
use App\Models\WordAttempt;
use App\Models\UserWordProgress;
use DB;
use Illuminate\Http\Request;
use Log;

class WordAttemptController extends Controller
{
    public function store(Request $request, Word $word)
    {
        Log::info($request->all());
        $request->validate([
            'result' => ['required', 'in:known,unknown'],
        ]);

        $progress = UserWordProgress::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'word_id' => $word->id,
            ],
            // [
            //     'mastery_level' => 0,
            // ]
        );

        // if ($request->result === 'known') {
        //     $progress->mastery_level = min($progress->mastery_level + 1, 5);
        // } else {
        //     $progress->mastery_level = max($progress->mastery_level - 1, 0);
        // }

        // ✅ ENUM value as STRING
        $progress->last_result = $request->result === 'known'
            ? 'correct'
            : 'wrong';

        $progress->save();

        // Fixed flash message structure for Inertia
        return redirect()->back()->with('flash', [
            'toast' => [
                'type' => $request->result === 'known' ? 'success' : 'error',
                'message' => $request->result === 'known'
                    ? 'Marked as known 👍'
                    : 'Marked as unknown ❌',
            ]
        ]);
    }
}