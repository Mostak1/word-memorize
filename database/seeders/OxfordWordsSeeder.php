<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;
use App\Models\User;

class OxfordWordsSeeder extends Seeder
{
    /**
     * Path to the CSV file (relative to Laravel project root).
     */
    protected string $filePath = 'database/data/Oxford_3000_processed.csv';

    /**
     * The single WordListCategory that owns all Oxford 3000 word lists.
     */
    private const CATEGORY_NAME = 'Oxford 3000 Essential Words';

    /**
     * Admin email to use as creator
     */
    private const ADMIN_EMAIL = 'admin@gmail.com';

    /**
     * Columns updated when a word already exists (upsert).
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

        $grouped = $this->groupBySubCategory($rows);

        $this->log('info', count($grouped) . ' word list(s) detected from Sub-Category column.');

        $creatorId = $this->getCreatorId();

        $counts = $this->seedAll($grouped, $creatorId);

        $this->log(
            'info',
            "\nDone — inserted: {$counts['inserted']}, updated: {$counts['updated']}, skipped: {$counts['skipped']}."
        );
    }

    // ── Unseed ─────────────────────────────────────────────────────────────

    public function unseed(): void
    {
        $category = WordListCategory::where('name', self::CATEGORY_NAME)->first();

        if (!$category) {
            $this->log('warn', '"' . self::CATEGORY_NAME . '" not found — nothing to unseed.');
            return;
        }

        DB::transaction(function () use ($category) {
            $wordLists = WordList::where('word_list_category_id', $category->id)->get();

            foreach ($wordLists as $wordList) {
                Word::where('wordlist_id', $wordList->id)->each(fn($w) => $w->delete());
                $wordList->delete();
            }

            $category->delete();
        });

        $this->log('info', '"' . self::CATEGORY_NAME . '" unseeded — category, word lists, and words removed.');
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

    private function groupBySubCategory(array $rows): array
    {
        $grouped = [];

        foreach ($rows as $row) {
            $word = $this->clean($row[0] ?? null);
            $subCat = $this->clean($row[3] ?? null);

            if ($word === null || $subCat === null) {
                continue;
            }

            $grouped[$subCat][] = $row;
        }

        return $grouped;
    }

    private function seedAll(array $grouped, int $creatorId): array
    {
        return DB::transaction(function () use ($grouped, $creatorId): array {

            $category = WordListCategory::firstOrCreate(
                ['name' => self::CATEGORY_NAME],
                [
                    'description' => null,
                    'status' => true,
                    'created_by' => $creatorId,
                ]
            );

            $this->log('info', "WordListCategory: \"" . self::CATEGORY_NAME . "\" (ID: {$category->id})");

            $totalInserted = 0;
            $totalUpdated = 0;
            $totalSkipped = 0;
            $listIndex = 0;

            foreach ($grouped as $subCatName => $rows) {
                $isLocked = $listIndex >= 3;

                $this->log(
                    'info',
                    "\n── WordList [{$listIndex}]: \"{$subCatName}\" ("
                    . count($rows) . ' words, locked: ' . ($isLocked ? 'yes' : 'no') . ') ──'
                );

                ['inserted' => $ins, 'updated' => $upd, 'skipped' => $skp] =
                    $this->seedWordList($category->id, $subCatName, $rows, $isLocked, $creatorId);

                $totalInserted += $ins;
                $totalUpdated += $upd;
                $totalSkipped += $skp;
                $listIndex++;
            }

            return ['inserted' => $totalInserted, 'updated' => $totalUpdated, 'skipped' => $totalSkipped];
        });
    }

    private function seedWordList(int $categoryId, string $title, array $rows, bool $isLocked, int $creatorId): array
    {
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
                'created_by' => $creatorId,     // ← NEW
                'is_public' => true,           // ← NEW
            ]
        );

        $this->log(
            'info',
            $wordList->wasRecentlyCreated
            ? "  WordList created (ID: {$wordList->id})."
            : "  WordList already exists (ID: {$wordList->id}) — skipping creation."
        );

        // Pre-fetch existing word keys
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
                'ipa' => null,
                'bangla_pronunciation' => null,
                'hyphenation' => null,
                'image_url' => null,
                'image_related_sentence' => null,
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

        $this->log('info', "  Done — inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}.");

        return ['inserted' => $inserted, 'updated' => $updated, 'skipped' => $skipped];
    }

    private function countNonEmpty(array $rows): int
    {
        return count(array_filter($rows, fn($r) => $this->clean($r[0] ?? null) !== null));
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
            logger()->info('[OxfordWordsSeeder] ' . $message);
        }
    }
}