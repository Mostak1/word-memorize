<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wordlist_id' => $this->wordlist_id,
            'word' => $this->word,
            'pronunciation' => $this->pronunciation,
            'ipa' => $this->ipa,
            'bangla_pronunciation' => $this->bangla_pronunciation,
            'hyphenation' => $this->hyphenation,
            'parts_of_speech_variations' => $this->parts_of_speech_variations,
            'definition' => $this->definition,
            'bangla_meaning' => $this->bangla_meaning,
            'collocations' => $this->collocations,
            'bangla_collocations' => $this->bangla_collocations,
            'example_sentences' => $this->example_sentences,
            'synonym' => $this->synonym,
            'antonym' => $this->antonym,
            'image_url' => $this->image_url_full,
            'image_related_sentence' => $this->image_related_sentence,
            'image_related_sentence_bangla' => $this->image_related_sentence_bangla,
            'images' => $this->whenLoaded('images', fn() => $this->images->map(fn($image) => [
                'id' => $image->id,
                'url' => $image->image_url_full,
                'caption' => $image->caption,
                'sort_order' => $image->sort_order,
            ])->values()),
            'wordlist' => $this->whenLoaded('wordList', fn() => [
                'id' => $this->wordList?->id,
                'title' => $this->wordList?->title,
                'difficulty' => $this->wordList?->difficulty,
                'category_id' => $this->wordList?->word_list_category_id,
            ]),
            'is_bookmarked' => (bool) ($this->is_bookmarked ?? false),
            'is_locked' => (bool) ($this->is_locked ?? false),
            'has_access' => (bool) ($this->has_access ?? true),
            'show_example_sentences' => (bool) ($this->show_example_sentences ?? true),
            'srs' => [
                'box' => $this->srs_box ?? null,
                'label' => $this->srs_label ?? null,
                'color' => $this->srs_color ?? null,
                'next_review_at' => $this->srs_next_review_at ?? null,
                'correct_count' => $this->srs_correct ?? null,
                'incorrect_count' => $this->srs_incorrect ?? null,
            ],
        ];
    }
}
