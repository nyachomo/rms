<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseLesson;
use App\Models\CourseModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseLessonController extends Controller
{
    public function index(Course $course, CourseModule $module): JsonResponse
    {
        abort_if($module->course_id !== $course->id, 404);
        $lessons = $module->lessons()->withCount('progress')->orderBy('sort_order')->get();
        return response()->json($lessons);
    }

    public function store(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        abort_if($module->course_id !== $course->id, 404);

        $data = $request->validate([
            'title'            => 'required|string|max:200',
            'content'          => 'nullable|string',
            'video_url'        => 'nullable|url|max:500',
            'type'             => 'required|in:text,video,mixed',
            'duration_minutes' => 'nullable|integer|min:0',
            'sort_order'       => 'nullable|integer|min:0',
            'status'           => 'required|in:published,draft',
        ]);

        $data['course_id']   = $course->id;
        $data['module_id']   = $module->id;
        $data['sort_order'] ??= ($module->lessons()->max('sort_order') ?? 0) + 1;

        $lesson = CourseLesson::create($data);
        return response()->json(['lesson' => $lesson], 201);
    }

    public function update(Request $request, Course $course, CourseModule $module, CourseLesson $lesson): JsonResponse
    {
        abort_if($module->course_id !== $course->id, 404);
        abort_if($lesson->module_id !== $module->id, 404);

        $data = $request->validate([
            'title'            => 'required|string|max:200',
            'content'          => 'nullable|string',
            'video_url'        => 'nullable|url|max:500',
            'type'             => 'required|in:text,video,mixed',
            'duration_minutes' => 'nullable|integer|min:0',
            'sort_order'       => 'nullable|integer|min:0',
            'status'           => 'required|in:published,draft',
        ]);

        $lesson->update($data);
        return response()->json(['lesson' => $lesson->fresh()]);
    }

    public function destroy(Course $course, CourseModule $module, CourseLesson $lesson): JsonResponse
    {
        abort_if($module->course_id !== $course->id, 404);
        abort_if($lesson->module_id !== $module->id, 404);
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted.']);
    }

    public function reorder(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        abort_if($module->course_id !== $course->id, 404);
        $request->validate(['order' => 'required|array', 'order.*' => 'integer']);
        foreach ($request->order as $position => $lessonId) {
            CourseLesson::where('id', $lessonId)->where('module_id', $module->id)
                ->update(['sort_order' => $position + 1]);
        }
        return response()->json(['message' => 'Lesson order saved.']);
    }
}
