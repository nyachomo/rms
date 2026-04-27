<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseLesson;
use App\Models\Enrollment;
use App\Models\LessonExamAttempt;
use App\Models\LessonExamQuestion;
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
                ->select('id', 'module_id', 'course_id', 'title', 'type', 'duration_minutes', 'sort_order', 'status', 'video_url', 'content', 'pass_mark')])
            ->get(['id', 'course_id', 'title', 'description', 'sort_order']);

        $allLessonIds = $modules->flatMap(fn($m) => $m->lessons->pluck('id'));

        // Completed lessons
        $completedIds = StudentProgress::where('user_id', $userId)
            ->whereIn('lesson_id', $allLessonIds)
            ->whereNotNull('completed_at')
            ->pluck('lesson_id')
            ->toArray();

        // Exam question counts per lesson
        $examQuestionCounts = LessonExamQuestion::whereIn('lesson_id', $allLessonIds)
            ->selectRaw('lesson_id, count(*) as cnt')
            ->groupBy('lesson_id')
            ->pluck('cnt', 'lesson_id');

        // Lessons where this student has a passing attempt
        $passedLessonIds = LessonExamAttempt::where('user_id', $userId)
            ->whereIn('lesson_id', $allLessonIds)
            ->where('passed', true)
            ->pluck('lesson_id')
            ->unique()
            ->toArray();

        $modules = $modules->map(fn($m) => [
            'id'          => $m->id,
            'title'       => $m->title,
            'description' => $m->description,
            'sort_order'  => $m->sort_order,
            'lessons'     => $m->lessons->map(fn($l) => array_merge($l->toArray(), [
                'completed'   => in_array($l->id, $completedIds),
                // has_exam = pass_mark is set AND at least one question exists
                'has_exam'    => !is_null($l->pass_mark) && ($examQuestionCounts[$l->id] ?? 0) > 0,
                'exam_passed' => in_array($l->id, $passedLessonIds),
            ])),
        ]);

        return response()->json([
            'course'  => $course->only(['id', 'title', 'slug', 'image_url', 'icon', 'icon_class', 'category', 'duration']),
            'modules' => $modules,
        ]);
    }

    /** Mark a lesson complete (manual, only allowed when no exam or exam is passed) */
    public function markComplete(CourseLesson $lesson): JsonResponse
    {
        $userId = Auth::id();

        // Block manual completion if lesson has an exam the student hasn't passed yet
        if (!is_null($lesson->pass_mark)) {
            $passed = LessonExamAttempt::where('user_id', $userId)
                ->where('lesson_id', $lesson->id)
                ->where('passed', true)
                ->exists();

            if (!$passed) {
                return response()->json(['message' => 'You must pass the lesson exam before marking it complete.'], 403);
            }
        }

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
