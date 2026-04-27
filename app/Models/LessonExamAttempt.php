<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonExamAttempt extends Model
{
    protected $fillable = ['user_id', 'lesson_id', 'score', 'passed'];

    protected $casts = [
        'score'  => 'decimal:2',
        'passed' => 'boolean',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(CourseLesson::class, 'lesson_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(LessonExamAnswer::class, 'attempt_id');
    }
}
