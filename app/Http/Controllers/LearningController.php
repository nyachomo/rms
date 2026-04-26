<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseLesson;
use App\Models\Enrollment;
use App\Models\StudentProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LearningController extends Controller
{
    /** Student's enrolled + approved courses with progress stats */
    public function myCourses(): JsonResponse
    {
        $userId = Auth::id();

        $enrollments = Enrollment::where('user_id', $userId)
            ->where('status', 'approved')
            ->with(['course:id,title,slug,image_url,icon,icon_class,category,duration,level'])
            ->get();

        $result = $enrollments->map(function ($enrollment) use ($userId) {
            $course = $enrollment->course;
            if (!$course) return null;

            $totalLessons     = $course->lessons()->where('status', 'published')->count();
            $completedLessons = StudentProgress::whereHas('lesson', fn($q) => $q->where('course_id', $course->id))
                ->where('user_id', $userId)
                ->whereNotNull('completed_at')
                ->count();

            return [
                'enrollment_id'    => $enrollment->id,
                'course'           => $course,
                'total_lessons'    => $totalLessons,
                'completed_lessons'=> $completedLessons,
                'progress_percent' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
                'enrolled_at'      => $enrollment->created_at,
            ];
        })->filter()->values();

        return response()->json($result);
    }

    /** Modules + lessons for a specific course (must be approved-enrolled) */
    public function courseLessons(string $slug): JsonResponse
    {
        $userId = Auth::id();
        $course = Course::where('slug', $slug)->firstOrFail();

        $isEnrolled = Enrollment::where('user_id', $userId)
            ->where('course_id', $course->id)
            ->where('status', 'approved')
            ->exists();

        $user = Auth::user();
        $hasAdminAccess = $user->permissions === null || ($user->permissions['learning']['manage'] ?? false);

        if (!$isEnrolled && !$hasAdminAccess) {
            return response()->json(['message' => 'You are not enrolled in this course.'], 403);
        }

        $modules = $course->modules()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->with(['lessons' => fn($q) => $q->where('status', 'published')->orderBy('sort_order')
                ->select('id', 'module_id', 'course_id', 'title', 'type', 'duration_minutes', 'sort_order', 'status', 'video_url', 'content')])
            ->get(['id', 'course_id', 'title', 'description', 'sort_order']);

        // Collect all lesson IDs to fetch completed ones in one query
        $allLessonIds = $modules->flatMap(fn($m) => $m->lessons->pluck('id'));

        $completedIds = StudentProgress::where('user_id', $userId)
            ->whereIn('lesson_id', $allLessonIds)
            ->whereNotNull('completed_at')
            ->pluck('lesson_id')
            ->toArray();

        $modules = $modules->map(fn($m) => [
            'id'          => $m->id,
            'title'       => $m->title,
            'description' => $m->description,
            'sort_order'  => $m->sort_order,
            'lessons'     => $m->lessons->map(fn($l) => array_merge($l->toArray(), ['completed' => in_array($l->id, $completedIds)])),
        ]);

        return response()->json([
            'course'  => $course->only(['id', 'title', 'slug', 'image_url', 'icon', 'icon_class', 'category', 'duration']),
            'modules' => $modules,
        ]);
    }

    /** Mark a lesson complete */
    public function markComplete(CourseLesson $lesson): JsonResponse
    {
        $userId = Auth::id();

        StudentProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lesson->id],
            ['completed_at' => now()]
        );

        return response()->json(['message' => 'Lesson marked as complete.', 'lesson_id' => $lesson->id]);
    }

    /** Unmark a lesson */
    public function unmarkComplete(CourseLesson $lesson): JsonResponse
    {
        StudentProgress::where('user_id', Auth::id())
            ->where('lesson_id', $lesson->id)
            ->delete();

        return response()->json(['message' => 'Lesson unmarked.', 'lesson_id' => $lesson->id]);
    }
}
