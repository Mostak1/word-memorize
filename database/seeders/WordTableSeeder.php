<?php

namespace Database\Seeders;

use App\Models\Word;
use App\Models\ExerciseGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class WordTableSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a default Exercise Group for these words
        $group = ExerciseGroup::firstOrCreate(
            ['title' => 'Oxford 3000'],
            ['price' => 0, 'difficulty' => 'advanced', 'status' => 1]
        );

        $filePath = database_path('data/Oxford 3000 - FINAL.csv');
        
        if (!File::exists($filePath)) {
            $this->command->error("File not found at: $filePath");
            return;
        }

        $file = fopen($filePath, 'r');
        $header = fgetcsv($file); // Skip the header row

        $this->command->info('Importing data...');

        while (($row = fgetcsv($file)) !== false) {
            // $row[0] = Word/Phrase (e.g., "abandon (v.)")
            // $row[1] = Pronunciation
            // $row[2] = Definition
            // $row[3] = Bangla meaning
            // $row[4] = Example Sentence
            // $row[5] = ai prompt
            // $row[6] = Collocations

            // Logic to separate word and part of speech if format is "word (pos)"
            $rawWord = $row[0];
            $pos = '';
            if (preg_match('/^(.*)\s\((.*)\)$/', $rawWord, $matches)) {
                $wordText = trim($matches[1]);
                $pos = $matches[2];
            } else {
                $wordText = trim($rawWord);
            }

            Word::create([
                'exercise_group_id' => $group->id,
                'word' => $wordText,
                'pronunciation' => $row[1] ?? null,
                'parts_of_speech_variations' => $pos ?: 'n/a',
                'definition' => $row[2] ?? '',
                'bangla_meaning' => $row[3] ?? '',
                'example_sentences' => $row[4] ?? '',
                'ai_prompt' => $row[5] ?? null,
                'collocations' => $row[6] ?? null,
                // These are nullable in your migration/model
                'hyphenation' => null,
                'synonym' => null,
                'antonym' => null,
            ]);
        }

        fclose($file);
        $this->command->info('Import finished!');
    }
}