<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Models\ExerciseGroup;
use App\Models\Word;

class OxfordWordsSeeder extends Seeder
{
    /**
     * Path to the Oxford 3000 Excel file (relative to Laravel project root).
     */
    protected string $filePath = 'database/data/Oxford_3000_tagged.xlsx';

    /**
     * Column indices (0-based) in the spreadsheet:
     *   0 => Word/Phrase   (e.g. "abandon (v.)")
     *   1 => Pronunciation
     *   2 => Definition
     *   3 => Bangla meaning
     *   4 => Example Sentence
     *   5 => ai prompt
     *   6 => Collocations
     *   7 => tags
     */
    public function run(): void
    {
        if (!file_exists(base_path($this->filePath))) {
            $this->command->error(
                "Excel file not found at: {$this->filePath}\n" .
                "Please place Oxford_3000_tagged.xlsx at database/data/"
            );
            return;
        }

        $this->command->info('Loading Excel file…');
        $rows = $this->loadRows();

        // ── 1. Collect unique, normalized tags ────────────────────────────
        $uniqueTags = $this->getTagList();
        $this->command->info(count($uniqueTags) . ' exercise groups (tags) found.');

        // ── 2. Create or fetch ExerciseGroups ─────────────────────────────
        /** @var array<string, int> $groupMap  tag => exercise_group_id */
        $groupMap = [];

        foreach ($uniqueTags as $tag) {
            $group = ExerciseGroup::firstOrCreate(
                ['title' => $tag],
                [
                    'price'      => null,
                    'difficulty' => 'beginner',
                    'status'     => true,
                ]
            );

            $groupMap[$tag] = $group->id;
        }

        // ── 3. Insert Words ───────────────────────────────────────────────
        $inserted  = 0;
        $skipped   = 0;
        $batchSize = 200;
        $batch     = [];
        $now       = now()->toDateTimeString();

        foreach ($rows as $row) {
            $tag = $this->clean($row[7] ?? null);

            // Skip words with no tag
            if ($tag === null) {
                $skipped++;
                continue;
            }

            $tag = $this->normalizeTag($tag);

            if (!isset($groupMap[$tag])) {
                $skipped++;
                continue;
            }

            [$word, $partsOfSpeechVariations] = $this->parseWordPhrase(
                $this->clean($row[0] ?? null) ?? ''
            );

            // Skip rows with no word
            if ($word === '') {
                $skipped++;
                continue;
            }

            $batch[] = [
                'exercise_group_id'          => $groupMap[$tag],
                'word'                       => $word,
                'pronunciation'              => $this->clean($row[1] ?? null),
                'hyphenation'                => null,
                'parts_of_speech_variations' => $partsOfSpeechVariations ?? '',
                'definition'                 => $this->clean($row[2] ?? null) ?? '',
                'bangla_meaning'             => $this->clean($row[3] ?? null) ?? '',
                'example_sentences'          => $this->clean($row[4] ?? null) ?? '',
                'ai_prompt'                  => $this->clean($row[5] ?? null),
                'collocations'               => $this->clean($row[6] ?? null),
                'synonym'                    => null,
                'antonym'                    => null,
                'image_url'                  => null,
                'image_related_sentence'     => null,
                'created_at'                 => $now,
                'updated_at'                 => $now,
            ];

            if (count($batch) >= $batchSize) {
                DB::table('words')->insert($batch);
                $inserted += count($batch);
                $batch = [];
                $this->command->info("  → {$inserted} words inserted so far…");
            }
        }

        // Insert remaining batch
        if (!empty($batch)) {
            DB::table('words')->insert($batch);
            $inserted += count($batch);
        }

        $this->command->info("✔ Done. Inserted: {$inserted} words. Skipped (no tag): {$skipped}.");
    }

    // ── Unseed ────────────────────────────────────────────────────────────

    public function unseed(): void
    {
        ExerciseGroup::whereIn('title', $this->getTagList())
            ->get()
            ->each(function ($group) {
                $group->words()->delete();
                $group->delete();
            });
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /**
     * Load all rows from the Excel file (header stripped).
     */
    private function loadRows(): array
    {
        $spreadsheet = IOFactory::load(base_path($this->filePath));
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);
        array_shift($rows); // remove header
        return $rows;
    }

    /**
     * Read the Excel file, normalize tags, and return unique canonical tag list.
     */
    private function getTagList(): array
    {
        if (!file_exists(base_path($this->filePath))) {
            return [];
        }

        $tags = [];
        foreach ($this->loadRows() as $row) {
            $tag = $this->clean($row[7] ?? null);
            if ($tag === null) {
                continue;
            }
            $normalized = $this->normalizeTag($tag);
            if (!in_array($normalized, $tags, true)) {
                $tags[] = $normalized;
            }
        }

        sort($tags);
        return $tags;
    }

    /**
     * Normalize tag variants to a single canonical group title.
     * e.g. "Action & Movement (Verbs of motion...)" → "Action & Movement"
     */
    private function normalizeTag(string $tag): string
    {
        $map = [
            'Action & Movement (Verbs of motion, manufacturing, handling)' => 'Action & Movement',
            'Descriptive Qualities (Time, Size, Shape, Texture)'           => 'Descriptive Qualities',
            'Mind & Emotion (Feelings, Thoughts, Personality)'             => 'Mind & Emotion',
            'The Natural World (Environment, Weather, Animals)'            => 'The Natural World',
        ];

        return $map[$tag] ?? $tag;
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
     * Split "abandon (v.)" into ["abandon", "(v.)"]
     * or "account (n.), (v.)" into ["account", "(n.), (v.)"]
     *
     * Strategy: everything before the first '(' is the word;
     * everything from the first '(' onward is the POS variations.
     */
    private function parseWordPhrase(string $raw): array
    {
        $parenPos = strpos($raw, '(');

        if ($parenPos === false) {
            return [trim($raw), null];
        }

        $word = trim(substr($raw, 0, $parenPos));
        $pos  = trim(substr($raw, $parenPos));

        return [$word ?: trim($raw), $pos ?: null];
    }
}