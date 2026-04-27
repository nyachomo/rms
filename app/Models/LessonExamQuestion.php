<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonExamQuestion extends Model
{
    protected $fillable = ['lesson_id', 'question', 'sort_order'];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(CourseLesson::class, 'lesson_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(LessonExamOption::class, 'question_id')->orderBy('sort_order');
    }
}
