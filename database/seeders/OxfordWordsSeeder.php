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

class OxfordWordsSeeder extends Seeder
{
    /**
     * Path to the CSV file (relative to Laravel project root).
     */
    protected string $filePath = 'database/data/Oxford_3000.csv';

    /**
     * Path to the word images folder (relative to Laravel project root).
     *
     * Images are named after the word, optionally with a POS suffix and/or a
     * trailing space before the extension, e.g.:
     *   database/data/oxford_images/able .jpg
     *   database/data/oxford_images/accept (v.).jpg
     *   database/data/oxford_images/abroad .jpg
     *
     * Matching handles all three quirks automatically (see buildImageIndex).
     */
    protected string $imagesPath = 'database/data/new_oxford_images';

    /**
     * Supported image extensions (checked in this priority order).
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
     * The single WordListCategory that owns all Oxford 3000 word lists.
     */
    private const CATEGORY_NAME = 'Oxford 3000 Essential Words';

    /**
     * Admin email to use as creator.
     */
    private const ADMIN_EMAIL = 'admin@gmail.com';

    /**
     * Columns updated when a word already exists (upsert).
     * Note: image_url is intentionally absent — images live in word_images table.
     */
    private const UPSERT_UPDATE_COLUMNS = [
        'parts_of_speech_variations',
        'ipa',
        'bangla_pronunciation',
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

        // Build a case-insensitive image index once — O(1) lookups per word.
        $imageIndex = $this->buildImageIndex();
        $this->log('info', count($imageIndex) . ' image key(s) indexed from ' . $this->imagesPath . '.');

        $creatorId = $this->getCreatorId();

        [
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped' => $skipped,
            'images_added' => $imagesAdded,
            'images_skipped' => $imagesSkipped,
            'no_image_words' => $noImageWords,
        ] = $this->seedAll($grouped, $creatorId, $imageIndex);

        $this->log(
            'info',
            "\nDone — words inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}." .
            "\n       images added: {$imagesAdded}, already existed / no file: {$imagesSkipped}."
        );

        $this->log('info', 'words_without_images: ' . json_encode(array_values(array_unique($noImageWords))));
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

    // ── Image index ────────────────────────────────────────────────────────

    /**
     * Scan the images folder and build a lookup map:
     *   normalised-word-key => absolute-file-path
     *
     * Oxford image filenames have two quirks compared to the Academic seeder:
     *
     *  1. Trailing space before the extension:
     *       "able .jpg"  →  pathinfo stem is "able " (with space)
     *       Fix: trim() the stem before using it as a map key.
     *
     *  2. Part-of-speech suffix in parentheses:
     *       "accept (v.).jpg"  →  stem "accept (v.)"
     *       The CSV word column is just "accept", so we also index a second
     *       key with the " (…)" suffix stripped — "accept".
     *       The full-stem key is written first; a file whose own stem IS just
     *       "accept.jpg" (no suffix) takes priority over the derived base key.
     *
     * @return array<string, string>  e.g. ['able' => '/abs/path/able .jpg']
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

            $absPath = $dir . DIRECTORY_SEPARATOR . $file;

            // Fix 1: trim() removes the trailing space in stems like "able ".
            $stem = trim(strtolower(pathinfo($file, PATHINFO_FILENAME)));

            // Index full trimmed stem first (first-write wins across all files).
            if (!isset($index[$stem])) {
                $index[$stem] = $absPath;
            }

            // Fix 2: also index the base word with the POS suffix stripped
            // so "accept (v.).jpg"  → key "accept"
            //    "furniture (n.)."  → key "furniture"  (note optional trailing dot)
            // $base = trim(preg_replace('/\s*\(.*?\)\.?\s*$/', '', $stem));
            $base = trim(preg_replace('/\s*\(.*?\)\.*\s*$/', '', $stem));

            if ($base !== '' && $base !== $stem && !isset($index[$base])) {
                $index[$base] = $absPath;
            }

            // Fix 3: strip trailing _word suffixes like "_cropped", "_edited", etc.
            // so "approve_cropped.jpg" is findable via key "approve".
            // Applied to both the full stem and the Fix-2 base so all combinations
            // work, e.g. "approve (v.)_cropped.jpg":
            //   stem → "approve (v.)_cropped"
            //   Fix-2 base → "approve_cropped"
            //   Fix-3 stripped → "approve"
            //
            // Also handles "furniture (n.)._cropped.jpg":
            //   stem → "furniture (n.)._cropped"
            //   Fix-3 stripped → "furniture (n.)."
            //   Fix-3 + Fix-2 (POS strip applied to stripped result) → "furniture"
            foreach ([$stem, $base] as $candidate) {
                $stripped = trim(preg_replace('/_[a-z0-9]+$/i', '', $candidate));
                if ($stripped !== '' && $stripped !== $candidate && !isset($index[$stripped])) {
                    $index[$stripped] = $absPath;
                }

                // Also strip POS suffix from the _suffix-stripped result so that
                // "furniture (n.)._cropped" ultimately resolves to "furniture".
                // $strippedBase = trim(preg_replace('/\s*\(.*?\)\.?\s*$/', '', $stripped));
                $strippedBase = trim(preg_replace('/\s*\(.*?\)\.*\s*$/', '', $stripped));
                if ($strippedBase !== '' && $strippedBase !== $stripped && !isset($index[$strippedBase])) {
                    $index[$strippedBase] = $absPath;
                }
            }
        }

        return $index;
    }

    /**
     * Find the absolute source image path for a word string, or null.
     *
     * Try order (first hit wins):
     *  1. Exact lowercase word          "accept"
     *  2. Underscore-spaced variant     "a_lot"     (multi-word CSV entries)
     *  3. Hyphen-spaced variant         "a-lot"
     *  4. First token before ", "       "chairman"  (e.g. "chairman, chairwoman")
     *
     * @param  array<string, string> $imageIndex
     */
    private function findImageForWord(string $word, array $imageIndex): ?string
    {
        $key = strtolower(trim($word));

        if (isset($imageIndex[$key]))
            return $imageIndex[$key];

        // ── NEW: strip trailing parenthetical from the word itself ──────
        // Handles: "April (abbr. Apr.)"  → "april"
        //          "television (also TV)" → "television"
        //          "can (modal)"          → "can"
        $baseWord = trim(preg_replace('/\s*\(.*?\)\.*\s*$/', '', $key));
        if ($baseWord !== '' && $baseWord !== $key) {
            if (isset($imageIndex[$baseWord]))
                return $imageIndex[$baseWord];

            $underscored = str_replace(' ', '_', $baseWord);
            if (isset($imageIndex[$underscored]))
                return $imageIndex[$underscored];

            $hyphenated = str_replace(' ', '-', $baseWord);
            if (isset($imageIndex[$hyphenated]))
                return $imageIndex[$hyphenated];
        }
        // ───────────────────────────────────────────────────────────────

        $underscored = str_replace(' ', '_', $key);
        if (isset($imageIndex[$underscored]))
            return $imageIndex[$underscored];

        $hyphenated = str_replace(' ', '-', $key);
        if (isset($imageIndex[$hyphenated]))
            return $imageIndex[$hyphenated];

        if (str_contains($key, ',')) {
            $firstToken = trim(explode(',', $key)[0]);
            if (isset($imageIndex[$firstToken]))
                return $imageIndex[$firstToken];
        }

        return null;
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

        fgetcsv($handle); // Skip header

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Parse the combined pronunciation column into its three parts.
     *
     * CSV format: "ˈtʃeəmən/ চেয়ারম্যান/ chair-man"
     *              ──────────  ────────────  ─────────
     *              IPA         Bangla        Romanized
     */
    private function parsePronunciation(?string $raw): array
    {
        $empty = ['ipa' => null, 'bangla_pronunciation' => null, 'pronunciation' => null];

        if ($raw === null || $raw === '') {
            return $empty;
        }

        $parts = array_map('trim', explode('/', $raw, 3));

        return [
            'ipa' => $this->clean($parts[0] ?? null),
            'bangla_pronunciation' => $this->clean($parts[1] ?? null),
            'pronunciation' => $this->clean($parts[2] ?? null),
        ];
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

    private function seedAll(array $grouped, int $creatorId, array $imageIndex): array
    {
        return DB::transaction(function () use ($grouped, $creatorId, $imageIndex): array {

            $category = WordListCategory::firstOrCreate(
                ['name' => self::CATEGORY_NAME],
                [
                    'description' => null,
                    'status' => true,
                    'created_by' => $creatorId,
                    'show_example_sentences' => false,
                ]
            );

            $this->log('info', "WordListCategory: \"" . self::CATEGORY_NAME . "\" (ID: {$category->id})");

            $totalInserted = 0;
            $totalUpdated = 0;
            $totalSkipped = 0;
            $totalImagesAdded = 0;
            $totalImagesSkipped = 0;
            $allNoImageWords = [];
            $listIndex = 0;

            foreach ($grouped as $subCatName => $rows) {
                $this->log(
                    'info',
                    "\n── WordList [{$listIndex}]: \"{$subCatName}\" (" . count($rows) . ' words) ──'
                );

                [
                    'inserted' => $ins,
                    'updated' => $upd,
                    'skipped' => $skp,
                    'images_added' => $imgAdded,
                    'images_skipped' => $imgSkip,
                    'no_image_words' => $noImgWords,
                ] = $this->seedWordList($category->id, $subCatName, $rows, $listIndex, $creatorId, $imageIndex);

                $totalInserted += $ins;
                $totalUpdated += $upd;
                $totalSkipped += $skp;
                $totalImagesAdded += $imgAdded;
                $totalImagesSkipped += $imgSkip;
                $allNoImageWords = array_merge($allNoImageWords, $noImgWords);
                $listIndex++;
            }

            return [
                'inserted' => $totalInserted,
                'updated' => $totalUpdated,
                'skipped' => $totalSkipped,
                'images_added' => $totalImagesAdded,
                'images_skipped' => $totalImagesSkipped,
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
                'price' => 0,
                'difficulty' => 'beginner',
                'status' => true,
                'is_locked' => $isLocked,
                'created_by' => $creatorId,
                'is_public' => true,
            ]
        );

        $this->log(
            'info',
            $wordList->wasRecentlyCreated
            ? "  WordList created (ID: {$wordList->id})."
            : "  WordList already exists (ID: {$wordList->id}) — skipping creation."
        );

        // ── Word upsert ────────────────────────────────────────────────────

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

            // Format: "IPA/ বাংলা উচ্চারণ/ romanized"
            $pron = $this->parsePronunciation($this->clean($row[4] ?? null));

            $batch[] = [
                'wordlist_id' => $wordList->id,
                'word' => $word,
                'parts_of_speech_variations' => $this->clean($row[1] ?? null) ?? '',
                'ipa' => $pron['ipa'],
                'bangla_pronunciation' => $pron['bangla_pronunciation'],
                'pronunciation' => $pron['pronunciation'],
                'definition' => $this->clean($row[5] ?? null) ?? '',
                'bangla_meaning' => $this->clean($row[6] ?? null),
                'example_sentences' => $this->clean($row[7] ?? null) ?? '',
                'ai_prompt' => $this->clean($row[8] ?? null),
                'collocations' => $this->parseCollocations($this->clean($row[9] ?? null)),
                'synonym' => $this->clean($row[10] ?? null),
                'antonym' => $this->clean($row[11] ?? null),
                'hyphenation' => null,
                'image_url' => null,
                'image_related_sentence' => null,
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
        ['added' => $imagesAdded, 'skipped' => $imagesSkipped, 'no_image_words' => $noImageWords] =
            $this->seedImagesForWordList($wordList->id, $rows, $imageIndex);

        $this->log(
            'info',
            "  Done — words inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}." .
            " Images added: {$imagesAdded}, skipped: {$imagesSkipped}."
        );

        return [
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped' => $skipped,
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
     * @param  array<string, string> $imageIndex
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
            ->pluck('id', 'word')   // ['able' => 12, 'accept' => 13, ...]
            ->toArray();

        // Build a set of word_ids that already have at least one image (skip them)
        $alreadyHasImage = WordImage::whereIn('word_id', array_values($wordMap))
            ->pluck('word_id')
            ->flip()
            ->toArray();

        $added = 0;
        $skipped = 0;
        $noImageWords = [];

        foreach ($rows as $row) {
            $wordStr = $this->clean($row[0] ?? null);   // col 0 = word

            if ($wordStr === null || $wordStr === '') {
                continue;
            }

            $wordId = $wordMap[$wordStr] ?? null;

            if ($wordId === null) {
                $skipped++;
                continue;
            }

            if (isset($alreadyHasImage[$wordId])) {
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

            WordImage::create([
                'word_id' => $wordId,
                'image_url' => '/' . ltrim($storedPath, '/'),
                'caption' => null,
                'sort_order' => 0,
            ]);

            $alreadyHasImage[$wordId] = true; // prevent duplicate in same run
            $added++;
        }

        return ['added' => $added, 'skipped' => $skipped, 'no_image_words' => $noImageWords];
    }

    /**
     * Copy a source image into storage/app/public/words/ and return the
     * storage-relative path (e.g. "words/able.jpg"), or null on failure.
     *
     * The destination filename is the clean lowercased word so URLs are
     * consistent regardless of the quirky original filename on disk.
     */
    private function copyImageToStorage(string $sourcePath, string $word): ?string
    {
        $ext = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));
        $destFilename = strtolower(trim($word)) . '.' . $ext;    // e.g. "able.jpg"
        $destPath = self::STORAGE_DIR . '/' . $destFilename; // e.g. "words/able.jpg"

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

    private function countNonEmpty(array $rows): int
    {
        return count(array_filter($rows, fn($r) => $this->clean($r[0] ?? null) !== null));
    }

    /**
     * Normalise the raw collocations value from the CSV into a clean JSON string.
     *
     * Expected CSV format (already JSON-encoded array of objects):
     *   [{"phrase":"board chairman","example_sentence":"The board chairman..."}]
     *
     * Desired stored format (text column):
     *   [
     *     {"phrase":"board chairman","example_sentence":"The board chairman..."},
     *     ...
     *   ]
     *
     * Rules:
     *  - If the value is null / empty → store null.
     *  - If it decodes to a valid array of objects with at least a "phrase" key
     *    → re-encode to compact JSON so the column is always consistent.
     *  - If decoding fails or the structure is unexpected → store null and log a
     *    warning so bad data is never silently persisted.
     *
     * Each item is normalised to guarantee both keys are present:
     *   { "phrase": string, "example_sentence": string }
     */
    private function parseCollocations(?string $raw): ?string
    {
        if ($raw === null || $raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true);

        if (!is_array($decoded) || empty($decoded)) {
            $this->log('warn', "    [collocations] Could not decode JSON — storing null. Raw: " . mb_substr($raw, 0, 120));
            return null;
        }

        $normalised = [];

        foreach ($decoded as $item) {
            if (!is_array($item) || !isset($item['phrase'])) {
                // Skip malformed entries silently (keeps the rest of the array intact)
                continue;
            }

            $normalised[] = [
                'phrase' => trim((string) $item['phrase']),
                'example_sentence' => trim((string) ($item['example_sentence'] ?? '')),
            ];
        }

        if (empty($normalised)) {
            return null;
        }

        return json_encode($normalised, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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