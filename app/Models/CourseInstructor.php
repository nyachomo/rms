<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseInstructor extends Model
{
    protected $fillable = ['course_id', 'name', 'role', 'bio', 'image_url', 'sort_order'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
