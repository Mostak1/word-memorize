<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;

class AcademicWordListSeeder extends Seeder
{
    /**
     * Path to the CSV file (relative to Laravel project root).
     */
    protected string $filePath = 'database/data/Academic_word_list_updated_v2.csv';

    /**
     * Category name used throughout seeding / unseeding.
     */
    private const CATEGORY_NAME = 'Academic Word List';

    /**
     * Columns updated when a word already exists (upsert).
     * 'word', 'wordlist_id', and 'created_at' are intentionally excluded.
     */
    private const UPSERT_UPDATE_COLUMNS = [
        'parts_of_speech_variations',
        'ipa',
        'pronunciation',
        'bangla_pronunciation',
        'definition',
        'bangla_meaning',
        'collocations',
        'example_sentences',
        'synonym',
        'antonym',
        'bangla_synonym',
        'bangla_antonym',
        'image_related_sentence',
        'ai_prompt',
        'updated_at',
    ];

    // ── Column index map (0-based) ─────────────────────────────────────────
    //  0  Word
    //  1  Type                   (→ parts_of_speech_variations)
    //  2  IPA Pronunciation      (→ ipa)
    //  3  Sounds like            (→ pronunciation)
    //  4  Bangla pronunciation
    //  5  Word Family            (not stored separately)
    //  6  Definition
    //  7  Bangla definition      (→ bangla_meaning)
    //  8  Collocations           | also holds "Sublist N" label in separator rows
    //  9  Example Sentence 1     |
    // 10  Example Sentence 2     |-- all merged → example_sentences (joined by ' ')
    // 15  More sentences examples|
    // 11  Synonym
    // 12  Antonym
    // 13  Image-Related Sentence
    // 14  AI Image Prompt
    // 16  Bangla Synonym         (→ bangla_synonym)
    // 17  Bangla Antonym         (→ bangla_antonym)
    //
    // Separator rows: col 0 is empty, col 8 contains "Sublist N"
    // → ends the current WordList and starts a new one.
    // Rows before the first separator belong to "Sublist 1".

    // ── Public entry-points ────────────────────────────────────────────────

    public function run(): void
    {
        $fullPath = base_path($this->filePath);

        if (!file_exists($fullPath)) {
            $this->log('error', "CSV file not found at: {$this->filePath}\nPlease place the CSV at database/data/");
            return;
        }

        $this->log('info', 'Loading CSV file...');

        $rows = $this->parseCsv($fullPath);
        $this->log('info', count($rows) . ' data row(s) found in the CSV (excluding header).');

        $sublists = $this->splitIntoSublists($rows);
        $this->log('info', count($sublists) . ' sublist(s) detected.');

        ['inserted' => $inserted, 'updated' => $updated, 'skipped' => $skipped] =
            $this->seedSublists($sublists);

        $this->log(
            'info',
            "\nDone — inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}."
        );
    }

    // ── Unseed ─────────────────────────────────────────────────────────────

    public function unseed(): void
    {
        $category = WordListCategory::where('name', self::CATEGORY_NAME)->first();

        if (!$category) {
            $this->log('warn', '"' . self::CATEGORY_NAME . '" category not found — nothing to remove.');
            return;
        }

        DB::transaction(function () use ($category) {
            $wordLists = WordList::where('word_list_category_id', $category->id)->get();

            foreach ($wordLists as $wordList) {
                // Use the Word model so the deleting boot hook fires (image cleanup etc.)
                Word::where('wordlist_id', $wordList->id)->each(fn($w) => $w->delete());
                $wordList->delete();
            }

            $category->delete();
        });

        $this->log('info', 'Unseeded "' . self::CATEGORY_NAME . '" — category, word lists, and words removed.');
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * Parse the CSV and return all rows as indexed arrays (header stripped).
     *
     * @return array<int, array<int, string|null>>
     */
    private function parseCsv(string $path): array
    {
        $handle = fopen($path, 'r');

        if ($handle === false) {
            $this->log('error', "Cannot open CSV file: {$path}");
            return [];
        }

        // Read and discard the header row (fgetcsv handles UTF-8 BOM automatically)
        fgetcsv($handle);

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Split all CSV rows into named sublists.
     *
     * Separator rows have an empty word column (col 0) and carry the sublist
     * label (e.g. "Sublist 2") in the collocations column (col 8).
     * Rows before the first separator are assigned to "Sublist 1".
     *
     * Returns: [ 'Sublist 1' => [rows…], 'Sublist 2' => [rows…], … ]
     *
     * @return array<string, array<int, array<int, string|null>>>
     */
    private function splitIntoSublists(array $rows): array
    {
        $sublists = [];
        $currentName = 'Sublist 1';

        foreach ($rows as $row) {
            $word = $this->clean($row[0] ?? null);
            $col8 = $this->clean($row[8] ?? null);

            // Separator row: empty word column, sublist label in col 8
            if ($word === null && $col8 !== null && str_starts_with($col8, 'Sublist')) {
                $currentName = $col8;
                continue;
            }

            // Skip entirely blank rows
            if ($word === null) {
                continue;
            }

            $sublists[$currentName][] = $row;
        }

        return $sublists;
    }

    /**
     * Seed all sublists inside a single transaction.
     *
     * Returns ['inserted' => int, 'updated' => int, 'skipped' => int].
     */
    private function seedSublists(array $sublists): array
    {
        return DB::transaction(function () use ($sublists): array {

            // WordListCategory ─────────────────────────────────────────────
            $categoryExists = WordListCategory::where('name', self::CATEGORY_NAME)->exists();
            $category = WordListCategory::firstOrCreate(
                ['name' => self::CATEGORY_NAME],
                [
                    'description' => 'High-frequency words commonly found in academic texts.',
                    'status' => true,
                ]
            );

            $this->log(
                'info',
                $categoryExists
                ? "  WordListCategory already exists (ID: {$category->id}) — skipping creation."
                : "  WordListCategory created (ID: {$category->id})."
            );

            $totalInserted = 0;
            $totalUpdated = 0;
            $totalSkipped = 0;

            $sublistIndex = 0;
            foreach ($sublists as $sublistName => $rows) {
                $this->log('info', "\n  ── {$sublistName} (" . count($rows) . " rows) ──");

                ['inserted' => $ins, 'updated' => $upd, 'skipped' => $skp] =
                    $this->seedWordList($category->id, $sublistName, $rows, $sublistIndex);

                $sublistIndex++;

                $totalInserted += $ins;
                $totalUpdated += $upd;
                $totalSkipped += $skp;
            }

            return ['inserted' => $totalInserted, 'updated' => $totalUpdated, 'skipped' => $totalSkipped];
        });
    }

    /**
     * Create/update one WordList and upsert its words.
     *
     * Returns ['inserted' => int, 'updated' => int, 'skipped' => int].
     */
    private function seedWordList(int $categoryId, string $title, array $rows, int $index = 0): array
    {
        // First 3 sublists (index 0, 1, 2) are unlocked; the rest are locked.
        $isLocked = $index >= 3;

        $listExists = WordList::where('word_list_category_id', $categoryId)
            ->where('title', $title)
            ->exists();

        $wordList = WordList::firstOrCreate(
            [
                'word_list_category_id' => $categoryId,
                'title' => $title,
            ],
            [
                'price' => 0,
                'difficulty' => 'intermediate',
                'status' => true,
                'is_locked' => $isLocked,
            ]
        );

        $this->log(
            'info',
            $listExists
            ? "    WordList already exists (ID: {$wordList->id}) — skipping creation."
            : "    WordList created (ID: {$wordList->id})."
        );

        // Pre-fetch existing word keys to distinguish insert vs update
        $existingKeys = DB::table('words')
            ->where('wordlist_id', $wordList->id)
            ->select('word', 'wordlist_id')
            ->get()
            ->mapWithKeys(fn($r) => [$r->word . '|' . $r->wordlist_id => true])
            ->toArray();

        $inserted = 0;
        $updated = 0;
        $skipped = 0;
        $batchSize = 100;
        $batch = [];
        $now = now()->toDateTimeString();

        $flush = function () use (&$batch, &$inserted, &$updated, &$existingKeys): void {
            if (empty($batch)) {
                return;
            }

            // Requires a unique index on (word, wordlist_id).
            DB::table('words')->upsert(
                $batch,
                ['word', 'wordlist_id'],
                self::UPSERT_UPDATE_COLUMNS
            );

            foreach ($batch as $row) {
                $key = $row['word'] . '|' . $row['wordlist_id'];
                if (isset($existingKeys[$key])) {
                    $updated++;
                } else {
                    $inserted++;
                    $existingKeys[$key] = true; // guard against duplicate rows in the CSV
                }
            }

            $batch = [];
        };

        foreach ($rows as $row) {
            $word = $this->clean($row[0] ?? null);

            if ($word === null || $word === '') {
                $skipped++;
                continue;
            }

            // Merge all three example-sentence columns separated by a space.
            // Each sentence already ends with '.', so consumers can split on '. '.
            $exampleSentences = implode(' ', array_filter([
                $this->clean($row[9] ?? null),   // Example Sentence 1
                $this->clean($row[10] ?? null),   // Example Sentence 2
                $this->clean($row[15] ?? null),   // More sentences examples
            ]));

            $batch[] = [
                'wordlist_id' => $wordList->id,
                'word' => $word,
                'parts_of_speech_variations' => $this->clean($row[1] ?? null) ?? '',  // Type
                'ipa' => $this->clean($row[2] ?? null),
                'pronunciation' => $this->clean($row[3] ?? null),
                'bangla_pronunciation' => $this->clean($row[4] ?? null),
                'definition' => $this->clean($row[6] ?? null) ?? '',
                'bangla_meaning' => $this->clean($row[7] ?? null),
                'collocations' => $this->clean($row[8] ?? null),
                'example_sentences' => $exampleSentences ?: '',
                'synonym' => $this->clean($row[11] ?? null),
                'antonym' => $this->clean($row[12] ?? null),
                'image_related_sentence' => $this->clean($row[13] ?? null),
                'ai_prompt' => $this->clean($row[14] ?? null),
                'bangla_synonym' => $this->clean($row[16] ?? null),
                'bangla_antonym' => $this->clean($row[17] ?? null),
                'hyphenation' => null,
                'image_url' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($batch) >= $batchSize) {
                $flush();
                $this->log('info', "      -> " . ($inserted + $updated) . " words processed so far...");
            }
        }

        $flush();

        $this->log('info', "    Done — inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}.");

        return ['inserted' => $inserted, 'updated' => $updated, 'skipped' => $skipped];
    }

    /**
     * Trim and return null for empty / whitespace-only strings.
     */
    private function clean(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    /**
     * Null-safe logger.
     *
     * Via Artisan  → $this->command is a ConsoleCommand, use info/warn/error.
     * Via route    → $this->command is null, fall back to Laravel's logger.
     */
    private function log(string $level, string $message): void
    {
        if ($this->command) {
            match ($level) {
                'error' => $this->command->error($message),
                'warn' => $this->command->warn($message),
                default => $this->command->info($message),
            };
        } else {
            match ($level) {
                'error' => logger()->error('[AcademicWordListSeeder] ' . $message),
                'warn' => logger()->warning('[AcademicWordListSeeder] ' . $message),
                default => logger()->info('[AcademicWordListSeeder] ' . $message),
            };
        }
    }
}