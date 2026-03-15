<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\ExerciseGroup;
use App\Models\Subcategory;

class FluentoWordsSeeder extends Seeder
{
  /**
   * Path to the Excel file (relative to Laravel project root).
   */
  protected string $filePath = 'database/data/fluento_words.xlsx';

  /**
   * Column indices (0-based) — identical across every sheet:
   *
   *   0 => Word
   *   1 => Type                (parts_of_speech_variations)
   *   2 => IPA                 (pronunciation)
   *   3 => Bangla Pron.        (bangla_pronunciation)
   *   4 => Definition          (definition)
   *   5 => Meaning (Bangla)    (bangla_meaning)
   *   6 => sub_tag             (subcategory name)
   *   7 => Example Sentence    (example_sentences)
   *   8 => AI Image Prompt     (ai_prompt)
   *
   * The sheet name itself is used as the ExerciseGroup title — no Tag column.
   * Adding new sheets to the workbook requires no code changes.
   */
  public function run(): void
  {
    if (!file_exists(base_path($this->filePath))) {
      $this->command->error(
        "Excel file not found at: {$this->filePath}\n" .
        "Please place fluento_words.xlsx at database/data/"
      );
      return;
    }

    $this->command->info('Loading Excel file...');
    $spreadsheet = IOFactory::load(base_path($this->filePath));
    $sheets = $spreadsheet->getAllSheets();

    $this->command->info(count($sheets) . ' sheet(s) found: ' .
      implode(', ', array_map(fn($s) => '"' . $s->getTitle() . '"', $sheets)));

    $totalInserted = 0;
    $totalSkipped = 0;

    foreach ($sheets as $sheet) {
      [$inserted, $skipped] = $this->seedSheet($sheet);
      $totalInserted += $inserted;
      $totalSkipped += $skipped;
    }

    $this->command->info("All sheets done. Total inserted: {$totalInserted}. Total skipped: {$totalSkipped}.");
  }

  // ── Unseed ─────────────────────────────────────────────────────────────

  public function unseed(): void
  {
    if (!file_exists(base_path($this->filePath))) {
      $this->command->warn("Excel file not found — cannot determine which groups to unseed.");
      return;
    }

    $spreadsheet = IOFactory::load(base_path($this->filePath));
    $sheetTitles = array_map(fn($s) => $s->getTitle(), $spreadsheet->getAllSheets());

    foreach ($sheetTitles as $title) {
      $group = ExerciseGroup::where('title', $title)->first();

      if (!$group) {
        $this->command->warn("  Exercise group \"{$title}\" not found — skipping.");
        continue;
      }

      $subcategories = Subcategory::where('exercise_group_id', $group->id)->get();

      foreach ($subcategories as $subcategory) {
        DB::table('words')->where('subcategory_id', $subcategory->id)->delete();
        $subcategory->delete();
      }

      $group->delete();
      $this->command->info("  Unseeded \"{$title}\" — group, subcategories, and words removed.");
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────

  /**
   * Seed a single worksheet.
   * Returns [inserted, skipped] counts.
   */
  private function seedSheet(Worksheet $sheet): array
  {
    $groupTitle = $sheet->getTitle();
    $rows = $sheet->toArray(null, true, true, false);
    array_shift($rows); // remove header row

    $this->command->info("\n── Sheet: \"{$groupTitle}\" ({$this->countNonEmpty($rows)} data rows) ──");

    // 1. ExerciseGroup ─────────────────────────────────────────────────
    $group = ExerciseGroup::firstOrCreate(
      ['title' => $groupTitle],
      [
        'price' => 0,
        'difficulty' => 'beginner',
        'status' => true,
      ]
    );

    $this->command->info("  Exercise group ready (ID: {$group->id}).");

    // 2. Subcategories (col 6) ─────────────────────────────────────────
    $uniqueSubTags = $this->getSubTagList($rows);
    $subcategoryMap = [];

    foreach ($uniqueSubTags as $subTag) {
      $subcategory = Subcategory::firstOrCreate([
        'exercise_group_id' => $group->id,
        'name' => $subTag,
      ]);

      $subcategoryMap[$subTag] = $subcategory->id;
    }

    $this->command->info("  " . count($uniqueSubTags) . " subcategories ready.");

    // 3. Words ─────────────────────────────────────────────────────────
    $inserted = 0;
    $skipped = 0;
    $batchSize = 100;
    $batch = [];
    $now = now()->toDateTimeString();

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
        'exercise_group_id' => $group->id,
        'subcategory_id' => $subcategoryMap[$subTag],
        'word' => $word,
        'parts_of_speech_variations' => $this->clean($row[1] ?? null) ?? '',
        'pronunciation' => $this->clean($row[2] ?? null),
        'bangla_pronunciation' => $this->clean($row[3] ?? null),
        'definition' => $this->clean($row[4] ?? null) ?? '',
        'bangla_meaning' => $this->clean($row[5] ?? null),
        'hyphenation' => null,
        'collocations' => null,
        'example_sentences' => $this->clean($row[7] ?? null) ?? '',
        'ai_prompt' => $this->clean($row[8] ?? null),
        'synonym' => null,
        'antonym' => null,
        'created_at' => $now,
        'updated_at' => $now,
      ];

      if (count($batch) >= $batchSize) {
        DB::table('words')->insert($batch);
        $inserted += count($batch);
        $batch = [];
        $this->command->info("    -> {$inserted} words inserted so far...");
      }
    }

    if (!empty($batch)) {
      DB::table('words')->insert($batch);
      $inserted += count($batch);
    }

    $this->command->info("  Done. Inserted: {$inserted}. Skipped: {$skipped}.");

    return [$inserted, $skipped];
  }

  /**
   * Extract unique, sorted sub_tag values (col 6) from the pre-loaded rows.
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
}