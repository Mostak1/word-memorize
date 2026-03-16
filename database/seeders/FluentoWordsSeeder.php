<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\WordList;
use App\Models\Subcategory;
use App\Models\Word;

class FluentoWordsSeeder extends Seeder
{
    /**
     * Path to the Excel file (relative to Laravel project root).
     */
    protected string $filePath = 'database/data/fluento_words.xlsx';

    /**
     * Columns updated when a word already exists (upsert).
     * 'word', 'subcategory_id', 'wordlist_id', and 'created_at'
     * are intentionally excluded — they form the identity of a row.
     */
    private const UPSERT_UPDATE_COLUMNS = [
        'parts_of_speech_variations',
        'pronunciation',
        'bangla_pronunciation',
        'definition',
        'bangla_meaning',
        'example_sentences',
        'ai_prompt',
        'updated_at',
    ];

    // ── Public entry-points ────────────────────────────────────────────────

    public function run(): void
    {
        if (!file_exists(base_path($this->filePath))) {
            $this->log('error', "Excel file not found at: {$this->filePath}\nPlease place fluento_words.xlsx at database/data/");
            return;
        }

        $this->log('info', 'Loading Excel file...');
        $spreadsheet = IOFactory::load(base_path($this->filePath));
        $sheets      = $spreadsheet->getAllSheets();

        $this->log(
            'info',
            count($sheets) . ' sheet(s) found: ' .
            implode(', ', array_map(fn($s) => '"' . $s->getTitle() . '"', $sheets))
        );

        $totals = ['inserted' => 0, 'updated' => 0, 'skipped' => 0];

        foreach ($sheets as $sheet) {
            $counts = $this->seedSheet($sheet);
            $totals['inserted'] += $counts['inserted'];
            $totals['updated']  += $counts['updated'];
            $totals['skipped']  += $counts['skipped'];
        }

        $this->log(
            'info',
            "\nAll sheets done — " .
            "inserted: {$totals['inserted']}, " .
            "updated: {$totals['updated']}, " .
            "skipped: {$totals['skipped']}."
        );
    }

    // ── Unseed ─────────────────────────────────────────────────────────────

    public function unseed(): void
    {
        if (!file_exists(base_path($this->filePath))) {
            $this->log('warn', "Excel file not found — cannot determine which word lists to unseed.");
            return;
        }

        $spreadsheet = IOFactory::load(base_path($this->filePath));
        $sheetTitles = array_map(fn($s) => $s->getTitle(), $spreadsheet->getAllSheets());

        foreach ($sheetTitles as $title) {
            $wordList = WordList::where('title', $title)->first();

            if (!$wordList) {
                $this->log('warn', "  WordList \"{$title}\" not found — skipping.");
                continue;
            }

            DB::transaction(function () use ($wordList) {
                $subcategories = Subcategory::where('wordlist_id', $wordList->id)->get();

                foreach ($subcategories as $subcategory) {
                    // Use the Word model so the deleting boot hook fires (image cleanup, etc.)
                    Word::where('subcategory_id', $subcategory->id)->each(fn($w) => $w->delete());
                    $subcategory->delete();
                }

                $wordList->delete();
            });

            $this->log('info', "  Unseeded \"{$title}\" — word list, subcategories, and words removed.");
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * Seed a single worksheet inside a transaction.
     * Returns ['inserted' => int, 'updated' => int, 'skipped' => int].
     */
    private function seedSheet(Worksheet $sheet): array
    {
        $listTitle = $sheet->getTitle();
        $rows      = $sheet->toArray(null, true, true, false);
        array_shift($rows); // remove header row

        $dataRowCount = $this->countNonEmpty($rows);
        $this->log('info', "\n── Sheet: \"{$listTitle}\" ({$dataRowCount} data rows) ──");

        return DB::transaction(function () use ($listTitle, $rows): array {

            // 1. WordList ─────────────────────────────────────────────────
            $listExists = WordList::where('title', $listTitle)->exists();
            $wordList   = WordList::firstOrCreate(
                ['title' => $listTitle],
                [
                    'price'      => 0,
                    'difficulty' => 'beginner',
                    'status'     => true,
                ]
            );

            $this->log(
                'info',
                $listExists
                    ? "  WordList already exists (ID: {$wordList->id}) — skipping creation."
                    : "  WordList created (ID: {$wordList->id})."
            );

            // 2. Subcategories (col 6) ─────────────────────────────────────
            $uniqueSubTags  = $this->getSubTagList($rows);
            $subcategoryMap = [];
            $newSubcategories = 0;

            foreach ($uniqueSubTags as $subTag) {
                $subExists = Subcategory::where('wordlist_id', $wordList->id)
                    ->where('name', $subTag)
                    ->exists();

                $subcategory = Subcategory::firstOrCreate([
                    'wordlist_id' => $wordList->id,
                    'name'        => $subTag,
                ]);

                $subcategoryMap[$subTag] = $subcategory->id;

                if (!$subExists) {
                    $newSubcategories++;
                }
            }

            $existingSubs = count($uniqueSubTags) - $newSubcategories;
            $this->log(
                'info',
                "  Subcategories: {$existingSubs} existing, {$newSubcategories} new " .
                "(total: " . count($uniqueSubTags) . ")."
            );

            // 3. Pre-fetch existing word keys for this word list ───────────
            // Key "{word}|{subcategory_id}" — used to distinguish insert vs update.
            $existingKeys = DB::table('words')
                ->where('wordlist_id', $wordList->id)
                ->select('word', 'subcategory_id')
                ->get()
                ->mapWithKeys(fn($r) => [$r->word . '|' . $r->subcategory_id => true])
                ->toArray();

            // 4. Words ─────────────────────────────────────────────────────
            $inserted  = 0;
            $updated   = 0;
            $skipped   = 0;
            $batchSize = 100;
            $batch     = [];
            $now       = now()->toDateTimeString();

            $flush = function () use (&$batch, &$inserted, &$updated, &$existingKeys): void {
                if (empty($batch)) {
                    return;
                }

                // Requires unique index on (word, subcategory_id).
                DB::table('words')->upsert(
                    $batch,
                    ['word', 'subcategory_id'],
                    self::UPSERT_UPDATE_COLUMNS
                );

                foreach ($batch as $row) {
                    $key = $row['word'] . '|' . $row['subcategory_id'];
                    if (isset($existingKeys[$key])) {
                        $updated++;
                    } else {
                        $inserted++;
                        $existingKeys[$key] = true; // guard against duplicate rows in the xlsx
                    }
                }

                $batch = [];
            };

            foreach ($rows as $row) {
                $subTag = $this->clean($row[6] ?? null);

                if ($subTag === null || !isset($subcategoryMap[$subTag])) {
                    $skipped++;
                    continue;
                }

                $word = $this->clean($row[0] ?? null);

                if ($word === null || $word === '') {
                    $skipped++;
                    continue;
                }

                $batch[] = [
                    'wordlist_id'                => $wordList->id,   // ← renamed
                    'subcategory_id'             => $subcategoryMap[$subTag],
                    'word'                       => $word,
                    'parts_of_speech_variations' => $this->clean($row[1] ?? null) ?? '',
                    'pronunciation'              => $this->clean($row[2] ?? null),
                    'bangla_pronunciation'       => $this->clean($row[3] ?? null),
                    'definition'                 => $this->clean($row[4] ?? null) ?? '',
                    'bangla_meaning'             => $this->clean($row[5] ?? null),
                    'hyphenation'                => null,
                    'collocations'               => null,
                    'example_sentences'          => $this->clean($row[7] ?? null) ?? '',
                    'ai_prompt'                  => $this->clean($row[8] ?? null),
                    'synonym'                    => null,
                    'antonym'                    => null,
                    'created_at'                 => $now,
                    'updated_at'                 => $now,
                ];

                if (count($batch) >= $batchSize) {
                    $flush();
                    $this->log('info', "    -> " . ($inserted + $updated) . " words processed so far...");
                }
            }

            $flush();

            $this->log('info', "  Done — inserted: {$inserted}, updated: {$updated}, skipped: {$skipped}.");

            return ['inserted' => $inserted, 'updated' => $updated, 'skipped' => $skipped];
        });
    }

    /**
     * Extract unique, sorted sub_tag values (col 6) from pre-loaded rows.
     */
    private function getSubTagList(array $rows): array
    {
        $tags = [];

        foreach ($rows as $row) {
            $tag = $this->clean($row[6] ?? null);
            if ($tag !== null && !in_array($tag, $tags, true)) {
                $tags[] = $tag;
            }
        }

        sort($tags);

        return $tags;
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
                'error'  => $this->command->error($message),
                'warn'   => $this->command->warn($message),
                default  => $this->command->info($message),
            };
        } else {
            match ($level) {
                'error'  => logger()->error('[FluentoWordsSeeder] ' . $message),
                'warn'   => logger()->warning('[FluentoWordsSeeder] ' . $message),
                default  => logger()->info('[FluentoWordsSeeder] ' . $message),
            };
        }
    }
}