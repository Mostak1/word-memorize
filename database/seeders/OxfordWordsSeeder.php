<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;

class OxfordWordsSeeder extends Seeder
{
    /**
     * Path to the CSV file (relative to Laravel project root).
     */
    protected string $filePath = 'database/data/Oxford_3000_processed.csv';

    /**
     * Columns updated when a word already exists (upsert).
     * 'word', 'wordlist_id', and 'created_at' are intentionally excluded —
     * they form the identity of a row.
     */
    private const UPSERT_UPDATE_COLUMNS = [
        'parts_of_speech_variations',
        'pronunciation',
        'definition',
        'bangla_meaning',
        'example_sentences',
        'collocations',
        'ai_prompt',
        'synonym',
        'antonym',
        'updated_at',
    ];

    // ── Column index map (0-based) ─────────────────────────────────────────
    //  0  Word/Phrase
    //  1  Type                   (→ parts_of_speech_variations)
    //  2  Category               (→ WordListCategory name)
    //  3  Sub-Category           (→ WordList title)
    //  4  Pronunciation
    //  5  Definition
    //  6  Bangla meaning         (→ bangla_meaning)
    //  7  Example Sentence       (→ example_sentences)
    //  8  ai prompt              (→ ai_prompt)
    //  9  Collocations
    // 10  Synonym
    // 11  Antonym
    //
    // is_locked rule: the first 3 WordLists (by order of appearance) under
    // each WordListCategory are unlocked; all subsequent ones are locked.

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
        $dataRowCount = $this->countNonEmpty($rows);

        $this->log('info', "{$dataRowCount} data row(s) found in the CSV.");

        // Group rows by Category → Sub-Category
        $grouped = $this->groupRows($rows);

        $this->log('info', count($grouped) . ' category/categories detected.');

        $counts = $this->seedGrouped($grouped);

        $this->log(
            'info',
            "\nDone — inserted: {$counts['inserted']}, updated: {$counts['updated']}, skipped: {$counts['skipped']}."
        );
    }

    // ── Unseed ─────────────────────────────────────────────────────────────

    public function unseed(): void
    {
        $fullPath = base_path($this->filePath);

        if (!file_exists($fullPath)) {
            $this->log('warn', "CSV file not found — cannot determine which categories to unseed.");
            return;
        }

        $rows = $this->parseCsv($fullPath);
        $grouped = $this->groupRows($rows);

        foreach (array_keys($grouped) as $categoryName) {
            $category = WordListCategory::where('name', $categoryName)->first();

            if (!$category) {
                $this->log('warn', "  \"{$categoryName}\" not found — skipping.");
                continue;
            }

            DB::transaction(function () use ($category) {
                $wordLists = WordList::where('word_list_category_id', $category->id)->get();

                foreach ($wordLists as $wordList) {
                    // Use the Word model so the deleting boot hook fires (image cleanup, etc.)
                    Word::where('wordlist_id', $wordList->id)->each(fn($w) => $w->delete());
                    $wordList->delete();
                }

                $category->delete();
            });

            $this->log('info', "  Unseeded \"{$categoryName}\" — category, word lists, and words removed.");
        }
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

        // Read and discard the header row (fgetcsv handles UTF-8 BOM transparently)
        fgetcsv($handle);

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Group all rows by Category (col 2) → Sub-Category (col 3),
     * preserving order of first appearance within each level.
     *
     * Returns:
     * [
     *   'Category Name' => [
     *     'Sub-Category Name' => [ [row], [row], … ],
     *     …
     *   ],
     *   …
     * ]
     *
     * @return array<string, array<string, array<int, array<int, string|null>>>>
     */
    private function groupRows(array $rows): array
    {
        $grouped = [];

        foreach ($rows as $row) {
            $word = $this->clean($row[0] ?? null);
            $cat = $this->clean($row[2] ?? null);
            $subCat = $this->clean($row[3] ?? null);

            if ($word === null || $cat === null || $subCat === null) {
                continue;
            }

            $grouped[$cat][$subCat][] = $row;
        }

        return $grouped;
    }

    /**
     * Seed all categories and their word lists inside one transaction.
     *
     * Returns ['inserted' => int, 'updated' => int, 'skipped' => int].
     */
    private function seedGrouped(array $grouped): array
    {
        return DB::transaction(function () use ($grouped): array {
            $totalInserted = 0;
            $totalUpdated = 0;
            $totalSkipped = 0;

            foreach ($grouped as $categoryName => $subCategories) {
                $this->log('info', "\n── Category: \"{$categoryName}\" (" . count($subCategories) . " word lists) ──");

                // 1. WordListCategory ──────────────────────────────────────
                $categoryExists = WordListCategory::where('name', $categoryName)->exists();
                $category = WordListCategory::firstOrCreate(
                    ['name' => $categoryName],
                    [
                        'description' => null,
                        'status' => true,
                    ]
                );

                $this->log(
                    'info',
                    $categoryExists
                    ? "  WordListCategory already exists (ID: {$category->id}) — skipping creation."
                    : "  WordListCategory created (ID: {$category->id})."
                );

                // 2. WordLists — first 3 are unlocked, rest are locked ─────
                $subCatIndex = 0;

                foreach ($subCategories as $subCatName => $rows) {
                    $isLocked = $subCatIndex >= 3;

                    $this->log('info', "\n  ── \"{$subCatName}\" (" . count($rows) . " words, locked: " . ($isLocked ? 'yes' : 'no') . ") ──");

                    ['inserted' => $ins, 'updated' => $upd, 'skipped' => $skp] =
                        $this->seedWordList($category->id, $subCatName, $rows, $isLocked);

                    $totalInserted += $ins;
                    $totalUpdated += $upd;
                    $totalSkipped += $skp;
                    $subCatIndex++;
                }
            }

            return ['inserted' => $totalInserted, 'updated' => $totalUpdated, 'skipped' => $totalSkipped];
        });
    }

    /**
     * Create/update one WordList and upsert its words.
     *
     * Returns ['inserted' => int, 'updated' => int, 'skipped' => int].
     */
    private function seedWordList(int $categoryId, string $title, array $rows, bool $isLocked): array
    {
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
                'difficulty' => 'beginner',
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
                    $existingKeys[$key] = true; // guard against duplicates in the CSV
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

            $batch[] = [
                'wordlist_id' => $wordList->id,
                'word' => $word,
                'parts_of_speech_variations' => $this->clean($row[1] ?? null) ?? '',
                'pronunciation' => $this->clean($row[4] ?? null),
                'definition' => $this->clean($row[5] ?? null) ?? '',
                'bangla_meaning' => $this->clean($row[6] ?? null),
                'example_sentences' => $this->clean($row[7] ?? null) ?? '',
                'ai_prompt' => $this->clean($row[8] ?? null),
                'collocations' => $this->clean($row[9] ?? null),
                'synonym' => $this->clean($row[10] ?? null),
                'antonym' => $this->clean($row[11] ?? null),
                // Not present in this CSV — set to null
                'ipa' => null,
                'bangla_pronunciation' => null,
                'hyphenation' => null,
                'image_url' => null,
                'image_related_sentence' => null,
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
     * Count rows that have at least a non-empty word column.
     */
    private function countNonEmpty(array $rows): int
    {
        return count(array_filter($rows, fn($r) => $this->clean($r[0] ?? null) !== null));
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
                'error' => logger()->error('[OxfordWordsSeeder] ' . $message),
                'warn' => logger()->warning('[OxfordWordsSeeder] ' . $message),
                default => logger()->info('[OxfordWordsSeeder] ' . $message),
            };
        }
    }
}