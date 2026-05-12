<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WordListCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'thumbnail_url' => $this->thumbnail_url_full,
            'price' => $this->price,
            'is_locked' => (bool) $this->is_locked,
            'has_access' => (bool) ($this->has_access ?? true),
            'show_example_sentences' => (bool) ($this->show_example_sentences ?? true),
            'wordlists_count' => (int) ($this->wordlists_count ?? 0),
            'words_count' => (int) ($this->words_count ?? 0),
        ];
    }
}
