<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Word;
use App\Models\WordImage;
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
     * Path to the word images folder (relative to Laravel project root).
     *
     * Place images here named exactly as the word, e.g.:
     *   database/data/word-images/Task.jpg
     *   database/data/word-images/abandon.jpg
     *
     * Matching is case-insensitive, so "task.jpg", "Task.jpg", and "TASK.jpg"
     * all match the word "task".
     */
    protected string $imagesPath = 'database/data/academic_word_images';

    /**
     * Supported image extensions (checked in this order).
     */
    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    /**
     * Storage disk for word images (maps to storage/app/public).
     */
    private const STORAGE_DISK = 'public';

    /**
     * Directory inside the public disk where images are stored.
     * Results in: storage/app/public/words/filename.jpg
     * Public URL:  /storage/words/filename.jpg
     */
    private const STORAGE_DIR = 'words';

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

        // Build a case-insensitive index of available images once,
        // so we don't hit the filesystem for every single word.
        $imageIndex = $this->buildImageIndex();
        $this->log('info', count($imageIndex) . ' image(s) found in database/data/academic-images/.');

        $creatorId = $this->getCreatorId();

        [
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped' => $skipped,
            'images_added' => $imagesAdded,
            'images_skipped' => $imagesSkipped
        ] =
            $this->seedSublists($sublists, $creatorId, $imageIndex);

        $this->log(
            'info',
            "\nDone — words inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}." .
            "\n       images added: {$imagesAdded}, already existed / no file: {$imagesSkipped}."
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

    // ── Image index ────────────────────────────────────────────────────────

    /**
     * Scan the images folder and build a lookup map:
     *   lowercase-word => absolute-file-path
     *
     * This lets us do O(1) case-insensitive lookups per word without
     * touching the filesystem again.
     *
     * @return array<string, string>  e.g. ['task' => '/full/path/Task.jpg']
     */
    private function buildImageIndex(): array
    {
        $dir = base_path($this->imagesPath);

        if (!is_dir($dir)) {
            $this->log('warn', "Images folder not found: database/data/academic-images/ — skipping image seeding.");
            return [];
        }

        $index = [];
        $extensions = self::IMAGE_EXTENSIONS;

        foreach (scandir($dir) as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            if (!in_array($ext, $extensions, true)) {
                continue;
            }

            // Strip extension → lowercase word key
            $key = strtolower(pathinfo($file, PATHINFO_FILENAME));

            // First match wins (avoids jpg vs jpeg collisions)
            if (!isset($index[$key])) {
                $index[$key] = $dir . DIRECTORY_SEPARATOR . $file;
            }
        }

        return $index;
    }

    /**
     * Given a word string, return the source image path or null.
     */
    private function findImageForWord(string $word, array $imageIndex): ?string
    {
        return $imageIndex[strtolower($word)] ?? null;
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

        fgetcsv($handle); // Skip header row

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Group rows by their Sublist column (col 0).
     * Rows with a missing/empty word (col 1) are silently dropped.
     * The sublist name is normalised to "Sublist N" so the output keys
     * are consistent regardless of how the CSV stores the number.
     */
    private function splitIntoSublists(array $rows): array
    {
        $sublists = [];

        foreach ($rows as $row) {
            $sublistRaw = $this->clean($row[0] ?? null);
            $word = $this->clean($row[1] ?? null);

            if ($word === null || $word === '') {
                continue;
            }

            // Normalise to "Sublist N" (handles plain integers or existing labels)
            if ($sublistRaw !== null && ctype_digit($sublistRaw)) {
                $sublistName = 'Sublist ' . $sublistRaw;
            } elseif ($sublistRaw !== null) {
                $sublistName = $sublistRaw;
            } else {
                $sublistName = 'Sublist 1';
            }

            $sublists[$sublistName][] = $row;
        }

        return $sublists;
    }

    private function seedSublists(array $sublists, int $creatorId, array $imageIndex): array
    {
        return DB::transaction(function () use ($sublists, $creatorId, $imageIndex): array {

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
            $totalImagesAdded = 0;
            $totalImagesSkip = 0;

            $sublistIndex = 0;
            foreach ($sublists as $sublistName => $rows) {
                $this->log('info', "\n  ── {$sublistName} (" . count($rows) . " rows) ──");

                [
                    'inserted' => $ins,
                    'updated' => $upd,
                    'skipped' => $skp,
                    'images_added' => $imgAdded,
                    'images_skipped' => $imgSkip,
                ] = $this->seedWordList($category->id, $sublistName, $rows, $sublistIndex, $creatorId, $imageIndex);

                $sublistIndex++;

                $totalInserted += $ins;
                $totalUpdated += $upd;
                $totalSkipped += $skp;
                $totalImagesAdded += $imgAdded;
                $totalImagesSkip += $imgSkip;
            }

            return [
                'inserted' => $totalInserted,
                'updated' => $totalUpdated,
                'skipped' => $totalSkipped,
                'images_added' => $totalImagesAdded,
                'images_skipped' => $totalImagesSkip,
            ];
        });
    }

    private function seedWordList(
        int $categoryId,
        string $title,
        array $rows,
        int $index,
        int $creatorId,
        array $imageIndex
    ): array {
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
                'is_public' => true,
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
            $word = $this->clean($row[1] ?? null);

            if ($word === null || $word === '') {
                $skipped++;
                continue;
            }

            $exampleSentences = implode(' ', array_filter([
                $this->clean($row[10] ?? null),
                $this->clean($row[11] ?? null),
                $this->clean($row[16] ?? null),
            ]));

            $batch[] = [
                'wordlist_id' => $wordList->id,
                'word' => $word,
                'parts_of_speech_variations' => $this->clean($row[2] ?? null) ?? '',
                'ipa' => $this->clean($row[3] ?? null),
                'pronunciation' => $this->clean($row[4] ?? null),
                'bangla_pronunciation' => $this->clean($row[5] ?? null),
                'definition' => $this->clean($row[7] ?? null) ?? '',
                'bangla_meaning' => $this->clean($row[8] ?? null),
                'collocations' => $this->clean($row[9] ?? null),
                'example_sentences' => $exampleSentences ?: '',
                'synonym' => $this->clean($row[12] ?? null),
                'antonym' => $this->clean($row[13] ?? null),
                'image_related_sentence' => $this->clean($row[14] ?? null),
                'ai_prompt' => $this->clean($row[15] ?? null),
                'hyphenation' => null,
                'image_url' => null,
                'created_by' => $creatorId,
                'is_public' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($batch) >= $batchSize) {
                $flush();
            }
        }

        $flush();

        // ── Image seeding ──────────────────────────────────────────────────
        // Run after all words are upserted so word IDs are guaranteed to exist.
        ['added' => $imagesAdded, 'skipped' => $imagesSkipped] =
            $this->seedImagesForWordList($wordList->id, $rows, $imageIndex);

        $this->log(
            'info',
            "    Done — words inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}." .
            " Images added: {$imagesAdded}, skipped: {$imagesSkipped}."
        );

        return [
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped' => $skipped,
            'images_added' => $imagesAdded,
            'images_skipped' => $imagesSkipped,
        ];
    }

    /**
     * For every word in this word list that has a matching image file,
     * copy the file to the public storage disk and create a WordImage record.
     *
     * Skips words that already have at least one WordImage row (idempotent).
     *
     * @return array{added: int, skipped: int}
     */
    private function seedImagesForWordList(int $wordListId, array $rows, array $imageIndex): array
    {
        if (empty($imageIndex)) {
            return ['added' => 0, 'skipped' => 0];
        }

        // Load all words for this list: word => id
        $wordMap = DB::table('words')
            ->where('wordlist_id', $wordListId)
            ->pluck('id', 'word')   // ['Task' => 5, 'abandon' => 6, ...]
            ->toArray();

        // Load word_ids that already have at least one image (to skip them)
        $alreadyHasImage = WordImage::whereIn('word_id', array_values($wordMap))
            ->pluck('word_id')
            ->flip()               // flip to a set for O(1) lookup
            ->toArray();

        $added = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            $wordStr = $this->clean($row[1] ?? null);

            if ($wordStr === null || $wordStr === '') {
                continue;
            }

            $wordId = $wordMap[$wordStr] ?? null;

            if ($wordId === null) {
                // Word was not found in DB — skipped during upsert
                $skipped++;
                continue;
            }

            // Already has an image — don't add a duplicate
            if (isset($alreadyHasImage[$wordId])) {
                $skipped++;
                continue;
            }

            $sourcePath = $this->findImageForWord($wordStr, $imageIndex);

            if ($sourcePath === null) {
                // No image file exists for this word
                $skipped++;
                continue;
            }

            $storedPath = $this->copyImageToStorage($sourcePath, $wordStr);

            if ($storedPath === null) {
                $skipped++;
                continue;
            }

            // Create the WordImage record
            // image_url stored as "/words/filename.jpg" (matches WordImage accessor)
            WordImage::create([
                'word_id' => $wordId,
                'image_url' => '/' . ltrim($storedPath, '/'),
                'caption' => null,
                'sort_order' => 0,
            ]);

            $alreadyHasImage[$wordId] = true; // prevent duplicate in same run
            $added++;
        }

        return ['added' => $added, 'skipped' => $skipped];
    }

    /**
     * Copy a source image into storage/app/public/words/ and return the
     * storage-relative path (e.g. "words/task.jpg"), or null on failure.
     *
     * The destination filename is lowercased so URLs are consistent.
     */
    private function copyImageToStorage(string $sourcePath, string $word): ?string
    {
        $ext = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));
        $destFilename = strtolower($word) . '.' . $ext;   // e.g. "task.jpg"
        $destPath = self::STORAGE_DIR . '/' . $destFilename; // e.g. "words/task.jpg"

        // Already copied in a previous run — don't overwrite
        if (Storage::disk(self::STORAGE_DISK)->exists($destPath)) {
            return $destPath;
        }

        $contents = @file_get_contents($sourcePath);

        if ($contents === false) {
            $this->log('warn', "    Could not read image file: {$sourcePath}");
            return null;
        }

        Storage::disk(self::STORAGE_DISK)->put($destPath, $contents);

        return $destPath;
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