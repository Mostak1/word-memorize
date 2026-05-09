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
    protected string $filePath = 'database/data/Academic_word_list.csv';
    protected $price = 250;

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
    private const STORAGE_DIR = 'words/academic';

    /**
     * Category name used throughout seeding / unseeding.
     */
    private const CATEGORY_NAME = 'IELTS & Academic Writing Vocabulary';

    /**
     * Admin email to use as creator
     */
    private const ADMIN_EMAIL = 'admin@gmail.com';

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
        $this->log('info', count($imageIndex) . ' image(s) found in ' . $this->imagesPath . '/.');

        $creatorId = $this->getCreatorId();

        [
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped' => $skipped,
            'deleted' => $deleted,
            'images_added' => $imagesAdded,
            'images_skipped' => $imagesSkipped,
            'no_image_words' => $noImageWords,
        ] = $this->seedSublists($sublists, $creatorId, $imageIndex);

        $this->log(
            'info',
            "\nDone — words inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}, deleted: {$deleted}." .
            "\n       images added: {$imagesAdded}, already existed / no file: {$imagesSkipped}."
        );

        $this->log('info', 'words_without_images: ' . json_encode(array_values(array_unique($noImageWords))));
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
     * @return array<string, string>  e.g. ['task' => '/full/path/Task.jpg']
     */
    private function buildImageIndex(): array
    {
        $dir = base_path($this->imagesPath);

        if (!is_dir($dir)) {
            $this->log('warn', "Images folder not found: {$this->imagesPath} — skipping image seeding.");
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
     *
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

            $thumbnailPath = $this->copyCategoryThumbnail('IELTS-&-Academic.webp');

            $category = WordListCategory::updateOrCreate(
                ['name' => self::CATEGORY_NAME],
                [
                    'description' => 'High-frequency words commonly found in academic texts.',
                    'thumbnail' => $thumbnailPath,
                    // 'status' => true,
                    'created_by' => $creatorId,
                    'show_example_sentences' => true,
                    'price' => $this->price,
                ]
            );

            $this->log('info', "WordListCategory: " . $category->name . " (ID: {$category->id})");

            $totalInserted = 0;
            $totalUpdated = 0;
            $totalSkipped = 0;
            $totalDeleted = 0;
            $totalImagesAdded = 0;
            $totalImagesSkip = 0;
            $allNoImageWords = [];

            $sublistIndex = 0;
            foreach ($sublists as $sublistName => $rows) {
                $this->log('info', "\n  ── {$sublistName} (" . count($rows) . " rows) ──");

                [
                    'inserted' => $ins,
                    'updated' => $upd,
                    'skipped' => $skp,
                    'deleted' => $del,
                    'images_added' => $imgAdded,
                    'images_skipped' => $imgSkip,
                    'no_image_words' => $noImgWords,
                ] = $this->seedWordList($category->id, $sublistName, $rows, $sublistIndex, $creatorId, $imageIndex);

                $sublistIndex++;

                $totalInserted += $ins;
                $totalUpdated += $upd;
                $totalSkipped += $skp;
                $totalDeleted += $del;
                $totalImagesAdded += $imgAdded;
                $totalImagesSkip += $imgSkip;
                $allNoImageWords = array_merge($allNoImageWords, $noImgWords);
            }

            return [
                'inserted' => $totalInserted,
                'updated' => $totalUpdated,
                'skipped' => $totalSkipped,
                'deleted' => $totalDeleted,
                'images_added' => $totalImagesAdded,
                'images_skipped' => $totalImagesSkip,
                'no_image_words' => $allNoImageWords,
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
                'difficulty' => 'intermediate',
                'status' => true,
                'is_locked' => $isLocked,
                'created_by' => $creatorId,
                'is_public' => true,
            ]
        );

        $this->log('info', "    WordList: {$title} (ID: {$wordList->id})");

        $inserted = 0;
        $updated = 0;
        $skipped = 0;
        $deleted = 0;
        $csvWords = [];

        foreach ($rows as $row) {
            $word = $this->clean($row[1] ?? null);

            if ($word === null || $word === '') {
                $skipped++;
                continue;
            }

            $csvWords[] = $word;

            $exampleSentences = implode('. ', array_filter([
                $this->clean($row[11] ?? null),
                $this->clean($row[12] ?? null),
                $this->clean($row[18] ?? null),
            ]));

            $wordModel = Word::updateOrCreate(
                [
                    'word' => $word,
                    'wordlist_id' => $wordList->id,
                ],
                [
                    'parts_of_speech_variations' => $this->clean($row[2] ?? null) ?? '',
                    'ipa' => $this->clean($row[3] ?? null),
                    'pronunciation' => $this->clean($row[4] ?? null),
                    'bangla_pronunciation' => $this->clean($row[5] ?? null),
                    'definition' => $this->clean($row[7] ?? null) ?? '',
                    'bangla_meaning' => $this->clean($row[8] ?? null),
                    'collocations' => $this->clean($row[9] ?? null),
                    'bangla_collocations' => $this->clean($row[10] ?? null),
                    'example_sentences' => $exampleSentences ?: '',
                    'synonym' => $this->clean($row[13] ?? null),
                    'antonym' => $this->clean($row[14] ?? null),
                    'image_related_sentence' => $this->clean($row[15] ?? null),
                    'image_related_sentence_bangla' => $this->clean($row[16] ?? null),
                    'ai_prompt' => $this->clean($row[17] ?? null),
                    'hyphenation' => null,
                    'image_url' => null,
                    'created_by' => $creatorId,
                    'is_public' => true,
                ]
            );

            if ($wordModel->wasRecentlyCreated) {
                $inserted++;
            } else {
                $updated++;
            }
        }

        // ── Remove words no longer present in the CSV ──────────────────────
        // Fires the Word::deleting boot hook per record so WordImage files
        // are cleaned up from storage automatically.
        Word::where('wordlist_id', $wordList->id)
            ->whereNotIn('word', $csvWords)
            ->each(function (Word $w) use (&$deleted) {
                $w->delete();
                $deleted++;
            });

        // ── Image seeding ──────────────────────────────────────────────────
        // Run after all words are upserted so word IDs are guaranteed to exist.
        ['added' => $imagesAdded, 'skipped' => $imagesSkipped, 'no_image_words' => $noImageWords] =
            $this->seedImagesForWordList($wordList->id, $rows, $imageIndex);

        $this->log(
            'info',
            "    Done — words inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}, deleted: {$deleted}." .
            " Images added: {$imagesAdded}, skipped: {$imagesSkipped}."
        );

        return [
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped' => $skipped,
            'deleted' => $deleted,
            'images_added' => $imagesAdded,
            'images_skipped' => $imagesSkipped,
            'no_image_words' => $noImageWords,
        ];
    }

    /**
     * For every word in this word list that has a matching image file,
     * copy the file to the public storage disk and create a WordImage record.
     *
     * Skips words that already have at least one WordImage row (idempotent).
     *
     * @return array{added: int, skipped: int, no_image_words: array}
     */
    private function seedImagesForWordList(int $wordListId, array $rows, array $imageIndex): array
    {
        if (empty($imageIndex)) {
            return ['added' => 0, 'skipped' => 0, 'no_image_words' => []];
        }

        // Load all words for this list via the Word model: word => id
        $wordMap = Word::where('wordlist_id', $wordListId)
            ->pluck('id', 'word')
            ->toArray();

        $added = 0;
        $skipped = 0;
        $noImageWords = [];

        foreach ($rows as $row) {
            $wordStr = $this->clean($row[1] ?? null);

            if ($wordStr === null || $wordStr === '') {
                continue;
            }

            $wordId = $wordMap[$wordStr] ?? null;

            if ($wordId === null) {
                // Word was not found in DB — skipped during updateOrCreate
                $skipped++;
                continue;
            }

            $sourcePath = $this->findImageForWord($wordStr, $imageIndex);

            if ($sourcePath === null) {
                // No image file exists for this word
                $noImageWords[] = $wordStr;
                $skipped++;
                continue;
            }

            $storedPath = $this->copyImageToStorage($sourcePath, $wordStr);

            if ($storedPath === null) {
                $skipped++;
                continue;
            }

            // Always update or create the WordImage record so re-runs refresh the image.
            // image_url stored as "/words/academic/filename.jpg" (matches WordImage accessor)
            WordImage::updateOrCreate(
                ['word_id' => $wordId],
                [
                    'image_url' => '/' . ltrim($storedPath, '/'),
                    'caption' => null,
                    'sort_order' => 0,
                ]
            );

            $added++;
        }

        return ['added' => $added, 'skipped' => $skipped, 'no_image_words' => $noImageWords];
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
        $destFilename = strtolower($word) . '.' . $ext;    // e.g. "task.jpg"
        $destPath = self::STORAGE_DIR . '/' . $destFilename; // e.g. "words/academic/task.jpg"

        $contents = @file_get_contents($sourcePath);

        if ($contents === false) {
            $this->log('warn', "    Could not read image file: {$sourcePath}");
            return null;
        }

        // Always overwrite so re-runs pick up updated image files.
        Storage::disk(self::STORAGE_DISK)->put($destPath, $contents);

        return $destPath;
    }

    /**
     * Copy a category thumbnail from database/data/ to storage/app/public/word_categories/
     */
    private function copyCategoryThumbnail(string $filename): ?string
    {
        $sourcePath = base_path('database/data/' . $filename);

        if (!file_exists($sourcePath)) {
            $this->log('warn', "Category thumbnail not found at: {$sourcePath}");
            return null;
        }

        $destDir = 'word_categories';
        $destPath = $destDir . '/' . $filename;

        $contents = @file_get_contents($sourcePath);
        if ($contents === false) {
            $this->log('warn', "Could not read category thumbnail: {$sourcePath}");
            return null;
        }

        Storage::disk(self::STORAGE_DISK)->put($destPath, $contents);

        return '/' . $destPath;
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