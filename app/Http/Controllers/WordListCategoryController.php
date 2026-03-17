<?php

namespace App\Http\Controllers;

use App\Models\WordList;
use App\Models\WordListCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WordListCategoryController extends Controller
{
    public function index()
    {
        $wordListCategories = WordListCategory::withCount('wordlists')
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('WordListCategoryIndex', [
            'wordListCategories' => $wordListCategories,
        ]);
    }

    public function showWordlists(WordListCategory $category)
    {
        $wordLists = WordList::withCount('words')
            ->where('word_list_category_id', $category->id)
            ->where('status', true)
            ->orderBy('difficulty')
            ->orderBy('title')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Wordlist', [
            'wordLists' => $wordLists,
            'category' => $category,
            'currentCategory' => $category->name,
        ]);
    }
}