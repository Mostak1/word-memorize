<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSideQuestUnlock extends Model
{
    protected $table = 'user_side_quest_unlocks';

    // Disable auto-incrementing primary key since it uses a composite key
    public $incrementing = false;
    protected $primaryKey = ['user_id', 'word_list_category_id'];

    protected $fillable = [
        'user_id',
        'word_list_category_id',
        'best_score',
        'best_lives_remaining',
        'best_time_taken',
        'attempts_count',
        'completed_at',
    ];

    protected $casts = [
        'best_score' => 'integer',
        'best_lives_remaining' => 'integer',
        'best_time_taken' => 'integer',
        'attempts_count' => 'integer',
        'completed_at' => 'datetime',
    ];

    // Helper for Eloquent composite key updates/saves in Laravel
    protected function setKeysForSaveQuery($query)
    {
        $keys = $this->getKeyName();
        if (!is_array($keys)) {
            return parent::setKeysForSaveQuery($query);
        }

        foreach ($keys as $keyName) {
            $query->where($keyName, '=', $this->getKeyForSaveQuery($keyName));
        }

        return $query;
    }

    protected function getKeyForSaveQuery($keyName = null)
    {
        if (is_null($keyName)) {
            $keyName = $this->getKeyName();
        }

        if (is_array($keyName)) {
            return $this->getAttribute($keyName[0]);
        }

        if (isset($this->original[$keyName])) {
            return $this->original[$keyName];
        }

        return $this->getAttribute($keyName);
    }

    protected function getKeyForSelectQuery()
    {
        return $this->getAttribute('user_id');
    }

    public function refresh()
    {
        if ($this->exists) {
            $fresh = self::where('user_id', $this->user_id)
                ->where('word_list_category_id', $this->word_list_category_id)
                ->first();
            if ($fresh) {
                $this->setRawAttributes($fresh->getAttributes(), true);
                $this->load(array_keys($this->relations));
            }
        }
        return $this;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wordListCategory()
    {
        return $this->belongsTo(WordListCategory::class);
    }
}
