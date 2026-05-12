<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WordListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'difficulty' => $this->difficulty,
            'category_id' => $this->word_list_category_id,
            'is_locked' => (bool) $this->is_locked,
            'has_access' => (bool) ($this->has_access ?? true),
            'words_count' => (int) ($this->words_count ?? 0),
            'mastered_count' => (int) ($this->mastered_count ?? 0),
            'quiz_eligible' => (bool) ($this->quiz_eligible ?? false),
            'has_quiz' => (bool) ($this->has_quiz ?? false),
        ];
    }
}
