<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseLesson extends Model
{
    protected $fillable = [
        'course_id', 'module_id', 'title', 'content', 'video_url',
        'type', 'duration_minutes', 'sort_order', 'status',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function module()
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function progress()
    {
        return $this->hasMany(StudentProgress::class, 'lesson_id');
    }
}
