<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseCurriculum extends Model
{
    protected $table = 'course_curriculum';

    protected $fillable = ['course_id', 'week_label', 'title', 'topics', 'sort_order'];

    protected $casts = ['topics' => 'array'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
