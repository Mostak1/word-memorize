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

class PhrasesAndIdiomsSeeder extends Seeder
{
    /**
     * Path to the CSV file (relative to Laravel project root).
     */
    protected string $filePath = 'database/data/phrases_idioms.csv';
    protected int $price = 250;

    /**
     * Path to the word images folder (relative to Laravel project root).
     *
     * Place images here named exactly as the phrase (spaces replaced with
     * underscores), e.g.:
     *   database/data/phrases_images/bring_up.jpg
     *   database/data/phrases_images/figure_out.jpg
     *
     * Matching is case-insensitive.
     */
    protected string $imagesPath = 'database/data/phrases_idioms';

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
     * Results in: storage/app/public/words/phrases/filename.jpg
     * Public URL:  /storage/words/phrases/filename.jpg
     */
    private const STORAGE_DIR = 'words/phrases';

    /**
     * Category name used throughout seeding / unseeding.
     */
    private const CATEGORY_NAME = 'Spoken English Phrases & Idioms';

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
        $this->log('info', count($sublists) . ' sublist(s) detected.');

        // Build a case-insensitive index of available images once,
        // so we don't hit the filesystem for every single phrase.
        $imageIndex = $this->buildImageIndex();
        $this->log('info', count($imageIndex) . ' image(s) found in ' . $this->imagesPath . '/.');

        $creatorId = $this->getCreatorId();

        [
            'inserted'      => $inserted,
            'updated'       => $updated,
            'skipped'       => $skipped,
            'deleted'       => $deleted,
            'images_added'  => $imagesAdded,
            'images_skipped' => $imagesSkipped,
            'no_image_words' => $noImageWords,
        ] = $this->seedSublists($sublists, $creatorId, $imageIndex);

        $this->log(
            'info',
            "\nDone — phrases inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}, deleted: {$deleted}." .
            "\n       images added: {$imagesAdded}, already existed / no file: {$imagesSkipped}."
        );

        $this->log('info', 'phrases_without_images: ' . json_encode(array_values(array_unique($noImageWords))));
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
     *   normalised-phrase-key => absolute-file-path
     *
     * The key is the phrase lowercased with spaces replaced by underscores,
     * e.g. "bring up" → "bring_up".
     *
     * @return array<string, string>
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

            // Strip extension → lowercase key (underscores for spaces)
            $key = strtolower(pathinfo($file, PATHINFO_FILENAME));

            // First match wins (avoids jpg vs jpeg collisions)
            if (!isset($index[$key])) {
                $index[$key] = $dir . DIRECTORY_SEPARATOR . $file;
            }
        }

        return $index;
    }

    /**
     * Given a phrase string, return the source image path or null.
     * Spaces in the phrase are converted to underscores for the lookup key.
     */
    private function findImageForPhrase(string $phrase, array $imageIndex): ?string
    {
        $key = strtolower(str_replace(' ', '_', $phrase));
        return $imageIndex[$key] ?? null;
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

        // Read and discard the BOM + header row
        $firstLine = fread($handle, 3);
        if ($firstLine !== "\xEF\xBB\xBF") {
            // No BOM — rewind and skip header normally
            rewind($handle);
        }
        fgetcsv($handle); // Skip header

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Group rows by their Learner_Sublist column (col 12).
     * Rows with a missing/empty phrase (col 1) are silently dropped.
     */
    private function splitIntoSublists(array $rows): array
    {
        $sublists = [];

        foreach ($rows as $row) {
            $phrase = $this->clean($row[1] ?? null);

            if ($phrase === null || $phrase === '') {
                continue;
            }

            // col 12 = Learner_Sublist, e.g. "01 - Communication & Discussion"
            $sublistName = $this->clean($row[12] ?? null) ?? 'General';

            $sublists[$sublistName][] = $row;
        }

        return $sublists;
    }

    private function seedSublists(array $sublists, int $creatorId, array $imageIndex): array
    {
        return DB::transaction(function () use ($sublists, $creatorId, $imageIndex): array {

            $thumbnailPath = $this->copyCategoryThumbnail('phrase_idioms.webp');

            $categoryData = [
                'description'            => 'Common phrasal verbs and idioms for everyday English fluency.',
                'created_by'             => $creatorId,
                'show_example_sentences' => true,
                'price'                  => $this->price,
            ];

            if ($thumbnailPath) {
                $categoryData['thumbnail'] = $thumbnailPath;
            }

            $category = WordListCategory::updateOrCreate(
                ['name' => self::CATEGORY_NAME],
                $categoryData
            );

            $this->log('info', "WordListCategory: " . $category->name . " (ID: {$category->id})");

            $totalInserted    = 0;
            $totalUpdated     = 0;
            $totalSkipped     = 0;
            $totalDeleted     = 0;
            $totalImagesAdded = 0;
            $totalImagesSkip  = 0;
            $allNoImageWords  = [];

            $sublistIndex = 0;
            foreach ($sublists as $sublistName => $rows) {
                $this->log('info', "\n  ── {$sublistName} (" . count($rows) . " rows) ──");

                [
                    'inserted'       => $ins,
                    'updated'        => $upd,
                    'skipped'        => $skp,
                    'deleted'        => $del,
                    'images_added'   => $imgAdded,
                    'images_skipped' => $imgSkip,
                    'no_image_words' => $noImgWords,
                ] = $this->seedWordList($category->id, $sublistName, $rows, $sublistIndex, $creatorId, $imageIndex);

                $sublistIndex++;

                $totalInserted    += $ins;
                $totalUpdated     += $upd;
                $totalSkipped     += $skp;
                $totalDeleted     += $del;
                $totalImagesAdded += $imgAdded;
                $totalImagesSkip  += $imgSkip;
                $allNoImageWords   = array_merge($allNoImageWords, $noImgWords);
            }

            return [
                'inserted'       => $totalInserted,
                'updated'        => $totalUpdated,
                'skipped'        => $totalSkipped,
                'deleted'        => $totalDeleted,
                'images_added'   => $totalImagesAdded,
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
        // First sublist is unlocked; all subsequent ones are locked
        $isLocked = $index >= 1;

        $wordList = WordList::where('word_list_category_id', $categoryId)
            ->where('title', $title)
            ->first();

        if (!$wordList) {
            $wordList = WordList::create([
                'word_list_category_id' => $categoryId,
                'title'                 => $title,
                'difficulty'            => 'intermediate',
                'status'                => true,
                'is_locked'             => $isLocked,
                'created_by'            => $creatorId,
                'is_public'             => true,
            ]);
        } else {
            // Update existing WordList but do NOT change 'is_locked'
            $wordList->update([
                'difficulty' => 'intermediate',
                'status'     => true,
                'created_by' => $creatorId,
                'is_public'  => true,
            ]);
        }

        $this->log('info', "    WordList: {$title} (ID: {$wordList->id})");

        $inserted   = 0;
        $updated    = 0;
        $skipped    = 0;
        $deleted    = 0;
        $csvPhrases = [];

        foreach ($rows as $row) {
            // col 1 = Phrase (the "word" equivalent)
            $phrase = $this->clean($row[1] ?? null);

            if ($phrase === null || $phrase === '') {
                $skipped++;
                continue;
            }

            $csvPhrases[] = $phrase;

            // col 13 = example sentence
            // col 14 = Bangla example sentence
            // col 16 = array of 3 example sentences
            $exampleSentences = implode('. ', array_filter([
                $this->clean($row[13] ?? null),
                $this->clean($row[14] ?? null),
            ]));

            $wordModel = Word::updateOrCreate(
                [
                    'word'        => $phrase,           // phrase stored in the `word` column
                    'wordlist_id' => $wordList->id,
                ],
                [
                    // col 0  = Type (Phrasal Verb / Idiom) → parts_of_speech_variations
                    'parts_of_speech_variations'   => $this->clean($row[0] ?? null) ?? '',
                    // col 2  = Pronunciation
                    'ipa'                          => $this->clean($row[2] ?? null),
                    // col 3  = Sounds_Like
                    'pronunciation'                => $this->clean($row[3] ?? null),
                    // col 4  = Bangla_Pronunciation
                    'bangla_pronunciation'         => $this->clean($row[4] ?? null),
                    // col 5  = Meaning (English definition)
                    'definition'                   => $this->clean($row[5] ?? null) ?? '',
                    // col 6  = Bangla_Meaning
                    'bangla_meaning'               => $this->clean($row[6] ?? null),
                    // col 7  = Collocations (JSON string from CSV)
                    'collocations'                 => $this->clean($row[7] ?? null),
                    // col 8  = Bangla Collocation
                    'bangla_collocations'          => $this->clean($row[8] ?? null),
                    // col 9  = Synonyms
                    'synonym'                      => $this->clean($row[9] ?? null),
                    // col 10 = Antonyms
                    'antonym'                      => $this->clean($row[10] ?? null),
                    // col 13 + 14 joined as example sentences
                    'example_sentences'            => $exampleSentences ?: '',
                    // col 15 = image prompt (stored in image_related_sentence)
                    'image_related_sentence'       => $this->clean($row[15] ?? null),
                    // col 16 = array of 3 example sentences (stored as ai_prompt / extra data)
                    'ai_prompt'                    => $this->clean($row[16] ?? null),
                    'image_related_sentence_bangla' => null,
                    'hyphenation'                  => null,
                    'image_url'                    => null,
                    'created_by'                   => $creatorId,
                    'is_public'                    => true,
                ]
            );

            if ($wordModel->wasRecentlyCreated) {
                $inserted++;
            } else {
                $updated++;
            }
        }

        // ── Remove phrases no longer present in the CSV ────────────────────
        Word::where('wordlist_id', $wordList->id)
            ->whereNotIn('word', $csvPhrases)
            ->each(function (Word $w) use (&$deleted) {
                $w->delete();
                $deleted++;
            });

        // ── Image seeding ──────────────────────────────────────────────────
        ['added' => $imagesAdded, 'skipped' => $imagesSkipped, 'no_image_words' => $noImageWords] =
            $this->seedImagesForWordList($wordList->id, $rows, $imageIndex);

        $this->log(
            'info',
            "    Done — phrases inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}, deleted: {$deleted}." .
            " Images added: {$imagesAdded}, skipped: {$imagesSkipped}."
        );

        return [
            'inserted'       => $inserted,
            'updated'        => $updated,
            'skipped'        => $skipped,
            'deleted'        => $deleted,
            'images_added'   => $imagesAdded,
            'images_skipped' => $imagesSkipped,
            'no_image_words' => $noImageWords,
        ];
    }

    /**
     * For every phrase in this word list that has a matching image file,
     * copy the file to the public storage disk and create a WordImage record.
     *
     * Skips phrases that already have at least one WordImage row (idempotent).
     *
     * @return array{added: int, skipped: int, no_image_words: array}
     */
    private function seedImagesForWordList(int $wordListId, array $rows, array $imageIndex): array
    {
        if (empty($imageIndex)) {
            return ['added' => 0, 'skipped' => 0, 'no_image_words' => []];
        }

        // Load all words/phrases for this list: word => id
        $wordMap = Word::where('wordlist_id', $wordListId)
            ->pluck('id', 'word')
            ->toArray();

        $added        = 0;
        $skipped      = 0;
        $noImageWords = [];

        foreach ($rows as $row) {
            $phrase = $this->clean($row[1] ?? null);

            if ($phrase === null || $phrase === '') {
                continue;
            }

            $wordId = $wordMap[$phrase] ?? null;

            if ($wordId === null) {
                $skipped++;
                continue;
            }

            $sourcePath = $this->findImageForPhrase($phrase, $imageIndex);

            if ($sourcePath === null) {
                $noImageWords[] = $phrase;
                $skipped++;
                continue;
            }

            $storedPath = $this->copyImageToStorage($sourcePath, $phrase);

            if ($storedPath === null) {
                $skipped++;
                continue;
            }

            WordImage::updateOrCreate(
                ['word_id' => $wordId],
                [
                    'image_url'  => '/' . ltrim($storedPath, '/'),
                    'caption'    => null,
                    'sort_order' => 0,
                ]
            );

            $added++;
        }

        return ['added' => $added, 'skipped' => $skipped, 'no_image_words' => $noImageWords];
    }

    /**
     * Copy a source image into storage/app/public/words/phrases/ and return
     * the storage-relative path (e.g. "words/phrases/bring_up.jpg"), or null
     * on failure.
     *
     * The destination filename is the phrase lowercased with spaces replaced
     * by underscores, e.g. "bring up" → "bring_up.jpg".
     */
    private function copyImageToStorage(string $sourcePath, string $phrase): ?string
    {
        $ext          = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));
        $slug         = strtolower(str_replace(' ', '_', $phrase)); // e.g. "bring_up"
        $destFilename = $slug . '.' . $ext;                          // e.g. "bring_up.jpg"
        $destPath     = self::STORAGE_DIR . '/' . $destFilename;     // e.g. "words/phrases/bring_up.jpg"

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

        $destDir  = 'word_categories';
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
                'error'  => $this->command->error($message),
                'warn'   => $this->command->warn($message),
                default  => $this->command->info($message),
            };
        } else {
            logger()->info('[PhrasesAndIdiomsSeeder] ' . $message);
        }
    }
}