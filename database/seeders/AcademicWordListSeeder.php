<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;
use App\Models\User;

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
     * Admin email to use as creator
     */
    private const ADMIN_EMAIL = 'admin@gmail.com';

    /**
     * Columns updated when a word already exists (upsert).
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
        'image_related_sentence',
        'ai_prompt',
        'updated_at',
    ];

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

        $creatorId = $this->getCreatorId();

        ['inserted' => $inserted, 'updated' => $updated, 'skipped' => $skipped] =
            $this->seedSublists($sublists, $creatorId);

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

    // ── Helper: Get Creator ID ─────────────────────────────────────────────

    /**
     * Find user by admin@gmail.com, fallback to user ID 1
     */
    private function getCreatorId(): int
    {
        $user = User::where('email', self::ADMIN_EMAIL)->first();

        if ($user) {
            $this->log('info', "Using creator: {$user->email} (ID: {$user->id})");
            return $user->id;
        }

        $this->log('warn', "User with email " . self::ADMIN_EMAIL . " not found. Falling back to user ID 1.");
        return 1;
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function parseCsv(string $path): array
    {
        $handle = fopen($path, 'r');

        if ($handle === false) {
            $this->log('error', "Cannot open CSV file: {$path}");
            return [];
        }

        fgetcsv($handle); // Skip header

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    private function splitIntoSublists(array $rows): array
    {
        $sublists = [];
        $currentName = 'Sublist 1';

        foreach ($rows as $row) {
            $word = $this->clean($row[0] ?? null);
            $col8 = $this->clean($row[8] ?? null);

            if ($word === null && $col8 !== null && str_starts_with($col8, 'Sublist')) {
                $currentName = $col8;
                continue;
            }

            if ($word === null) {
                continue;
            }

            $sublists[$currentName][] = $row;
        }

        return $sublists;
    }

    private function seedSublists(array $sublists, int $creatorId): array
    {
        return DB::transaction(function () use ($sublists, $creatorId): array {

            $category = WordListCategory::firstOrCreate(
                ['name' => self::CATEGORY_NAME],
                [
                    'description' => 'High-frequency words commonly found in academic texts.',
                    'status' => true,
                    'created_by' => $creatorId,
                ]
            );

            $this->log('info', "WordListCategory: " . $category->name . " (ID: {$category->id})");

            $totalInserted = 0;
            $totalUpdated = 0;
            $totalSkipped = 0;

            $sublistIndex = 0;
            foreach ($sublists as $sublistName => $rows) {
                $this->log('info', "\n  ── {$sublistName} (" . count($rows) . " rows) ──");

                ['inserted' => $ins, 'updated' => $upd, 'skipped' => $skp] =
                    $this->seedWordList($category->id, $sublistName, $rows, $sublistIndex, $creatorId);

                $sublistIndex++;

                $totalInserted += $ins;
                $totalUpdated += $upd;
                $totalSkipped += $skp;
            }

            return ['inserted' => $totalInserted, 'updated' => $totalUpdated, 'skipped' => $totalSkipped];
        });
    }

    private function seedWordList(int $categoryId, string $title, array $rows, int $index, int $creatorId): array
    {
        $isLocked = $index >= 3;

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
                'created_by' => $creatorId,
                'is_public' => true,           // ← NEW
            ]
        );

        $this->log('info', "    WordList: {$title} (ID: {$wordList->id})");

        // Pre-fetch existing words
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

        $flush = function () use (&$batch, &$inserted, &$updated, &$existingKeys, $wordList): void {
            if (empty($batch))
                return;

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
                    $existingKeys[$key] = true;
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

            $exampleSentences = implode(' ', array_filter([
                $this->clean($row[9] ?? null),
                $this->clean($row[10] ?? null),
                $this->clean($row[15] ?? null),
            ]));

            $batch[] = [
                'wordlist_id' => $wordList->id,
                'word' => $word,
                'parts_of_speech_variations' => $this->clean($row[1] ?? null) ?? '',
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
                'hyphenation' => null,
                'image_url' => null,
                'created_by' => $creatorId,      // ← NEW
                'is_public' => true,            // ← NEW
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($batch) >= $batchSize) {
                $flush();
            }
        }

        $flush();

        $this->log('info', "    Done — inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}.");

        return ['inserted' => $inserted, 'updated' => $updated, 'skipped' => $skipped];
    }

    private function clean(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = trim((string) $value);
        return $value === '' ? null : $value;
    }

    private function log(string $level, string $message): void
    {
        if ($this->command) {
            match ($level) {
                'error' => $this->command->error($message),
                'warn' => $this->command->warn($message),
                default => $this->command->info($message),
            };
        } else {
            logger()->info('[AcademicWordListSeeder] ' . $message);
        }
    }
}