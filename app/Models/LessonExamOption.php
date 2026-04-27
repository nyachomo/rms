<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonExamOption extends Model
{
    protected $fillable = ['question_id', 'option_text', 'is_correct', 'sort_order'];

    protected $casts = ['is_correct' => 'boolean'];

    public function question(): BelongsTo
    {
        return $this->belongsTo(LessonExamQuestion::class, 'question_id');
    }
}
