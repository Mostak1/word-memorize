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

class GREWordListSeeder extends Seeder
{
    /**
     * Path to the CSV file (relative to Laravel project root).
     */
    protected string $filePath = 'database/data/GRE_Words.csv';
    protected $price = 399;

    /**
     * Path to the word images folder (relative to Laravel project root).
     *
     * Place images here named exactly as the word, e.g.:
     *   database/data/gre_word_images/abase.jpg
     *
     * Matching is case-insensitive.
     */
    protected string $imagesPath = 'database/data/gre_word_images';

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
    private const STORAGE_DIR = 'words/gre';

    /**
     * Category names for the two GRE buckets.
     */
    private const GRE_332_CATEGORY_NAME = 'Advanced Essential Words';
    private const GRE_EXTENDED_CATEGORY_NAME = 'IBA / GRE / GMAT / SAT Master Vocabulary';

    /**
     * How many words per WordList inside each category.
     */
    private const GRE_332_CHUNK_SIZE =40;
    private const GRE_EXTENDED_CHUNK_SIZE = 60;

    /**
     * CSV list-column values that belong to the GRE 332 bucket.
     * Everything else goes to GRE Extended.
     */
    private const GRE_332_LIST_VALUES = ['333'];

    /**
     * Admin email to use as creator.
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
        $this->log(
            'info',
            'Rows bucketed — GRE 332: ' . count($sublists['gre332']) .
            ', GRE Extended: ' . count($sublists['extended']) . '.'
        );

        // Build a case-insensitive index of available images once.
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
        $categoryNames = [self::GRE_332_CATEGORY_NAME, self::GRE_EXTENDED_CATEGORY_NAME];

        $categories = WordListCategory::whereIn('name', $categoryNames)->get();

        if ($categories->isEmpty()) {
            $this->log('warn', 'No GRE categories found — nothing to remove.');
            return;
        }

        DB::transaction(function () use ($categories) {
            foreach ($categories as $category) {
                $wordLists = WordList::where('word_list_category_id', $category->id)->get();

                foreach ($wordLists as $wordList) {
                    // Use the Word model so the deleting boot hook fires (image cleanup etc.)
                    Word::where('wordlist_id', $wordList->id)->each(fn($w) => $w->delete());
                    $wordList->delete();
                }

                $category->delete();
                $this->log('info', 'Unseeded "' . $category->name . '" — category, word lists, and words removed.');
            }
        });
    }

    // ── Image index ────────────────────────────────────────────────────────

    /**
     * Scan the images folder and build a lookup map:
     *   lowercase-word => absolute-file-path
     *
     * @return array<string, string>  e.g. ['abase' => '/full/path/abase.jpg']
     */
    private function buildImageIndex(): array
    {
        $dir = base_path($this->imagesPath);

        if (!is_dir($dir)) {
            $this->log('warn', "Images folder not found: {$this->imagesPath} — skipping image seeding.");
            return [];
        }

        $index = [];

        foreach (scandir($dir) as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            if (!in_array($ext, self::IMAGE_EXTENSIONS, true)) {
                continue;
            }

            $key = strtolower(pathinfo($file, PATHINFO_FILENAME));

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

        fgetcsv($handle, 0, ',', '"', ''); // Skip header row

        $rows = [];
        while (($row = fgetcsv($handle, 0, ',', '"', '')) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Split all rows into two buckets:
     *   'gre332'   — rows whose list column matches GRE_332_LIST_VALUES
     *   'extended' — everything else
     *
     * Rows with a missing/empty word (col 0) are silently dropped.
     *
     * @return array{gre332: array, extended: array}
     */
    private function splitIntoSublists(array $rows): array
    {
        $buckets = ['gre332' => [], 'extended' => []];

        foreach ($rows as $row) {
            $word = $this->clean($row[0] ?? null);

            if ($word === null || $word === '') {
                continue;
            }

            // Index 5 is 'list' in the current CSV
            $listRaw = $this->clean($row[5] ?? null);

            if (in_array($listRaw, self::GRE_332_LIST_VALUES, true)) {
                $buckets['gre332'][] = $row;
            } else {
                $buckets['extended'][] = $row;
            }
        }

        return $buckets;
    }

    private function seedSublists(array $sublists, int $creatorId, array $imageIndex): array
    {
        return DB::transaction(function () use ($sublists, $creatorId, $imageIndex): array {

            $totalInserted = 0;
            $totalUpdated = 0;
            $totalSkipped = 0;
            $totalDeleted = 0;
            $totalImagesAdded = 0;
            $totalImagesSkip = 0;
            $allNoImageWords = [];

            // ── GRE 332 category (20 words per WordList) ──────────────────────
            $gre332Category = WordListCategory::updateOrCreate(
                ['name' => self::GRE_332_CATEGORY_NAME],
                [
                    'description' => '332 high-frequency words essential for the GRE exam.',
                    'thumbnail' => $this->copyCategoryThumbnail('Advanced_essential.webp'),
                    // 'status' => true,
                    'created_by' => $creatorId,
                    'show_example_sentences' => true,
                    'price' => $this->price,
                ]
            );

            $this->log('info', "WordListCategory: {$gre332Category->name} (ID: {$gre332Category->id})");

            $gre332Chunks = array_chunk($sublists['gre332'], self::GRE_332_CHUNK_SIZE);
            foreach ($gre332Chunks as $chunkIndex => $chunk) {
                $listNumber = $chunkIndex + 1;
                $title = self::GRE_332_CATEGORY_NAME . ' — Sub-List ' . $listNumber;

                $this->log('info', "\n  ── {$title} (" . count($chunk) . " rows) ──");

                [
                    'inserted' => $ins,
                    'updated' => $upd,
                    'skipped' => $skp,
                    'deleted' => $del,
                    'images_added' => $imgAdded,
                    'images_skipped' => $imgSkip,
                    'no_image_words' => $noImgWords,
                ] = $this->seedWordList($gre332Category->id, $title, $chunk, $chunkIndex, $creatorId, $imageIndex);

                $totalInserted += $ins;
                $totalUpdated += $upd;
                $totalSkipped += $skp;
                $totalDeleted += $del;
                $totalImagesAdded += $imgAdded;
                $totalImagesSkip += $imgSkip;
                $allNoImageWords = array_merge($allNoImageWords, $noImgWords);
            }

            // ── GRE Extended category (60 words per WordList) ─────────────────
            $extendedCategory = WordListCategory::updateOrCreate(
                ['name' => self::GRE_EXTENDED_CATEGORY_NAME],
                [
                    'description' => 'Extended GRE vocabulary beyond the core 332 words.',
                    'thumbnail' => $this->copyCategoryThumbnail('IBA.webp'),
                    // 'status' => true,
                    'created_by' => $creatorId,
                    'show_example_sentences' => true,
                    'price' => $this->price,
                ]
            );

            $this->log('info', "\nWordListCategory: {$extendedCategory->name} (ID: {$extendedCategory->id})");

            $extendedChunks = array_chunk($sublists['extended'], self::GRE_EXTENDED_CHUNK_SIZE);
            foreach ($extendedChunks as $chunkIndex => $chunk) {
                $listNumber = $chunkIndex + 1;
                $title = self::GRE_EXTENDED_CATEGORY_NAME . ' — Sub-List ' . $listNumber;

                $this->log('info', "\n  ── {$title} (" . count($chunk) . " rows) ──");

                [
                    'inserted' => $ins,
                    'updated' => $upd,
                    'skipped' => $skp,
                    'deleted' => $del,
                    'images_added' => $imgAdded,
                    'images_skipped' => $imgSkip,
                    'no_image_words' => $noImgWords,
                ] = $this->seedWordList($extendedCategory->id, $title, $chunk, $chunkIndex, $creatorId, $imageIndex);

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
        // First sublist (GRE 333) is free; the rest are locked
        $isLocked = $index >= 1;

        $wordList = WordList::updateOrCreate(
            [
                'word_list_category_id' => $categoryId,
                
            ],
            [
                'title' => $title,
                'difficulty' => 'advanced',
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
            // CSV column mapping:
            // 0  word
            // 1  sentence                   → image_related_sentence
            // 2  sentence bangla            → image_related_sentence_bangla
            // 3  phrase                     → image_related_sentence (fallback)
            // 4  definition
            // 5  list                       (used for grouping, not stored per-word)
            // 6  type                       → parts_of_speech_variations
            // 7  ipa
            // 8  pronunciation
            // 9  bangla_pronunciation
            // 10 synonyms                   → synonym
            // 11 antonyms                   → antonym
            // 12 bangla_meaning
            // 13 collocations
            // 14 collocations bangla        → bangla_collocations

            $word = $this->clean($row[0] ?? null);

            // Skip blank rows AND any garbage rows produced by CSV mis-parsing
            // (e.g. JSON fragment keys like 'phrase"": ""term""' or ']"')
            if (
                $word === null ||
                $word === '' ||
                str_contains($word, '"') ||
                str_contains($word, '{') ||
                str_contains($word, '[') ||
                str_contains($word, ']')
            ) {
                $skipped++;
                continue;
            }

            $csvWords[] = $word;

            $wordModel = Word::updateOrCreate(
                [
                    'word' => $word,
                    'wordlist_id' => $wordList->id,
                ],
                [
                    'parts_of_speech_variations' => $this->clean($row[6] ?? null) ?? '',
                    'ipa' => $this->clean($row[7] ?? null),
                    'pronunciation' => $this->clean($row[8] ?? null),
                    'bangla_pronunciation' => $this->clean($row[9] ?? null),
                    'definition' => $this->clean($row[4] ?? null) ?? '',
                    'bangla_meaning' => $this->clean($row[12] ?? null),
                    'collocations' => $this->clean($row[13] ?? null),
                    'bangla_collocations' => $this->clean($row[14] ?? null),
                    'example_sentences' => null, // We favor the bilingual image_related_sentence fields
                    'synonym' => $this->clean($row[10] ?? null),
                    'antonym' => $this->clean($row[11] ?? null),
                    'image_related_sentence' => $this->clean($row[1] ?? null),
                    'image_related_sentence_bangla' => $this->clean($row[2] ?? null),
                    'ai_prompt' => null,
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
            $wordStr = $this->clean($row[0] ?? null);

            if ($wordStr === null || $wordStr === '') {
                continue;
            }

            $wordId = $wordMap[$wordStr] ?? null;

            if ($wordId === null) {
                $skipped++;
                continue;
            }

            $sourcePath = $this->findImageForWord($wordStr, $imageIndex);

            if ($sourcePath === null) {
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
     * storage-relative path (e.g. "words/abase.jpg"), or null on failure.
     */
    private function copyImageToStorage(string $sourcePath, string $word): ?string
    {
        $ext = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));
        $destFilename = strtolower($word) . '.' . $ext;
        $destPath = self::STORAGE_DIR . '/' . $destFilename; // e.g. "words/gre/pan.jpg"

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
            logger()->info('[GREWordListSeeder] ' . $message);
        }
    }
}