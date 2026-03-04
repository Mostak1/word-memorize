<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReviewWord;
use Inertia\Inertia;

class ReviewWordController extends Controller
{
    public function index()
    {
        $reviewWords = ReviewWord::with([
            'user:id,name,email',
            'word:id,word,hyphenation,definition,bangla_meaning,parts_of_speech_variations,synonym,antonym,collocations,example_sentences,image_url,exercise_group_id',
            'word.exerciseGroup:id,title,difficulty',
        ])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/ReviewWords/Index', [
            'reviewWords' => $reviewWords,
        ]);
    }
}