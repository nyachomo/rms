<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseModuleController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $modules = $course->modules()
            ->withCount('lessons')
            ->with(['lessons' => fn($q) => $q->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return response()->json($modules);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:500',
            'status'      => 'required|in:active,draft',
        ]);

        $data['course_id']   = $course->id;
        $data['sort_order']  = ($course->modules()->max('sort_order') ?? 0) + 1;

        $module = CourseModule::create($data);
        $module->loadCount('lessons');

        return response()->json(['module' => $module], 201);
    }

    public function update(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        abort_if($module->course_id !== $course->id, 404);

        $data = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:500',
            'status'      => 'required|in:active,draft',
        ]);

        $module->update($data);
        $module->loadCount('lessons');

        return response()->json(['module' => $module->fresh()]);
    }

    public function destroy(Course $course, CourseModule $module): JsonResponse
    {
        abort_if($module->course_id !== $course->id, 404);
        $module->delete();
        return response()->json(['message' => 'Module deleted.']);
    }

    public function reorder(Request $request, Course $course): JsonResponse
    {
        $request->validate(['order' => 'required|array', 'order.*' => 'integer']);
        foreach ($request->order as $position => $moduleId) {
            CourseModule::where('id', $moduleId)->where('course_id', $course->id)
                ->update(['sort_order' => $position + 1]);
        }
        return response()->json(['message' => 'Module order saved.']);
    }
}
