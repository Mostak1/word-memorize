<?php

namespace App\Http\Controllers;

use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserWordController extends Controller
{
  // ── Personal category / list helpers ──────────────────────────────────────

  /**
   * Find or create the single personal WordListCategory for the logged-in user.
   */
  private function getOrCreatePersonalCategory(): WordListCategory
  {
    $user = Auth::user();

    return WordListCategory::firstOrCreate(
      ['created_by' => $user->id],
      [
        'name' => $user->name . "'s Words",
        'description' => 'My personal word collection',
        'status' => true,
        'created_by' => $user->id,
      ]
    );
  }

  /**
   * Return all WordLists belonging to the user's personal category.
   */
  private function personalWordLists(WordListCategory $category)
  {
    return WordList::where('word_list_category_id', $category->id)
      ->orderBy('title')
      ->get(['id', 'title']);
  }

  /**
   * Resolve the target wordlist_id from the request.
   *
   *  - new_wordlist_title supplied → create a fresh WordList inside the category
   *  - wordlist_id supplied        → verify it belongs to the category, use it
   *  - neither                     → fall back to (or create) a "My Words" list
   */
  private function resolveWordList(array $validated, int $categoryId): int
  {
    if (!empty($validated['new_wordlist_title'])) {
      $list = WordList::create([
        'word_list_category_id' => $categoryId,
        'title' => trim($validated['new_wordlist_title']),
        'difficulty' => 'Intermediate',
        'status' => true,
        'is_locked' => false,
        'is_public' => false,
        'created_by' => Auth::id(),
      ]);
      return $list->id;
    }

    if (!empty($validated['wordlist_id'])) {
      // Security: make sure the list actually belongs to this user's category
      $list = WordList::where('id', $validated['wordlist_id'])
        ->where('word_list_category_id', $categoryId)
        ->firstOrFail();
      return $list->id;
    }

    // Fallback — always have at least one list
    $list = WordList::firstOrCreate(
      [
        'word_list_category_id' => $categoryId,
        'title' => 'My Words',
      ],
      [
        'difficulty' => 'Intermediate',
        'status' => true,
        'is_locked' => false,
        'is_public' => false,
        'created_by' => Auth::id(),
      ]
    );
    return $list->id;
  }

  /**
   * Abort with 403 if the authenticated user does not own the word.
   */
  private function authorizeWord(Word $word): void
  {
    if ($word->created_by !== Auth::id()) {
      abort(403, 'You do not own this word.');
    }
  }

  // ── Collocations helpers ───────────────────────────────────────────────────

  /**
   * Validate that a collocations value is either empty or valid JSON
   * representing an array of { phrase, example_sentence } objects.
   *
   * Returns the canonical JSON string (or null) to store in the DB.
   */
  private function normalizeCollocations(?string $raw): ?string
  {
    if (blank($raw)) {
      return null;
    }

    $decoded = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
      // Treat a non-JSON string as a legacy plain-text value — store as-is
      // so old data is not accidentally corrupted; the frontend always sends JSON.
      return $raw;
    }

    // Re-encode only the expected keys so we don't store garbage
    $clean = array_values(
      array_filter(
        array_map(function ($item) {
          if (!is_array($item))
            return null;
          $phrase = trim($item['phrase'] ?? '');
          $sentence = trim($item['example_sentence'] ?? '');
          if ($phrase === '' && $sentence === '')
            return null;
          return ['phrase' => $phrase, 'example_sentence' => $sentence];
        }, $decoded)
      )
    );

    return count($clean) ? json_encode($clean, JSON_UNESCAPED_UNICODE) : null;
  }

  // ── Controller actions ────────────────────────────────────────────────────

  /**
   * GET /my/words
   * List all personal words, grouped or paginated.
   */
  public function index()
  {
    $category = $this->getOrCreatePersonalCategory();

    $wordListIds = WordList::where('word_list_category_id', $category->id)
      ->pluck('id');

    $words = Word::whereIn('wordlist_id', $wordListIds)
      ->with('wordList:id,title')
      ->latest()
      ->paginate(20)
      ->withQueryString();

    $wordLists = $this->personalWordLists($category);

    return Inertia::render('UserWord/Index', [
      'words' => $words,
      'category' => $category,
      'wordLists' => $wordLists,
    ]);
  }

  /**
   * POST /my/words
   * Persist a new personal word.
   */
  public function store(Request $request)
  {
    $category = $this->getOrCreatePersonalCategory();

    $validated = $this->validateWordRequest($request);
    $wordlistId = $this->resolveWordList($validated, $category->id);

    Word::create([
      ...$this->wordPayload($validated),
      'wordlist_id' => $wordlistId,
      'created_by' => Auth::id(),
    ]);

    return redirect()->route('my.words.index')
      ->with('flash', [
        'type' => 'success',
        'message' => 'Word added successfully!',
      ]);
  }

  /**
   * PUT /my/words/{word}
   * Update an existing personal word.
   */
  public function update(Request $request, Word $word)
  {
    $this->authorizeWord($word);

    $category = $this->getOrCreatePersonalCategory();

    $validated = $this->validateWordRequest($request);
    $wordlistId = $this->resolveWordList($validated, $category->id);

    $word->update([
      ...$this->wordPayload($validated),
      'wordlist_id' => $wordlistId,
    ]);

    return redirect()->route('my.words.index')
      ->with('flash', [
        'type' => 'success',
        'message' => 'Word updated successfully!',
      ]);
  }

  /**
   * DELETE /my/words/{word}
   * Remove a personal word.
   */
  public function destroy(Word $word)
  {
    $this->authorizeWord($word);
    $word->delete();

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Word deleted.',
    ]);
  }

  // ── Shared validation & payload ───────────────────────────────────────────

  private function validateWordRequest(Request $request): array
  {
    return $request->validate([
      'wordlist_id' => ['nullable', 'integer'],
      'new_wordlist_title' => ['nullable', 'string', 'max:255'],
      'word' => ['required', 'string', 'max:255'],
      'pronunciation' => ['nullable', 'string', 'max:255'],
      'ipa' => ['nullable', 'string', 'max:255'],
      'bangla_pronunciation' => ['nullable', 'string', 'max:255'],
      'parts_of_speech_variations' => ['nullable', 'string', 'max:255'],
      'definition' => ['required', 'string'],
      'bangla_meaning' => ['nullable', 'string'],
      // collocations arrives as a JSON string (array of {phrase, example_sentence})
      'collocations' => ['nullable', 'string'],
      'example_sentences' => ['nullable', 'string'],
      'synonym' => ['nullable', 'string', 'max:1000'],
      'antonym' => ['nullable', 'string', 'max:1000'],
    ]);
  }

  private function wordPayload(array $v): array
  {
    return [
      'word' => $v['word'],
      'pronunciation' => $v['pronunciation'] ?? null,
      'ipa' => $v['ipa'] ?? null,
      'bangla_pronunciation' => $v['bangla_pronunciation'] ?? null,
      'hyphenation' => $v['hyphenation'] ?? null,
      'parts_of_speech_variations' => $v['parts_of_speech_variations'] ?? null,
      'definition' => $v['definition'] ?? null,
      'bangla_meaning' => $v['bangla_meaning'] ?? null,
      // Normalize: validate structure and re-encode cleanly
      'collocations' => $this->normalizeCollocations($v['collocations'] ?? null),
      'example_sentences' => $v['example_sentences'] ?? null,
      'synonym' => $v['synonym'] ?? null,
      'antonym' => $v['antonym'] ?? null,
    ];
  }
}