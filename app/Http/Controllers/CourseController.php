<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseOutcome;
use App\Models\CourseCurriculum;
use App\Models\CourseInstructor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /* ─── Public endpoints ─── */

    public function index(): JsonResponse
    {
        $courses = Course::where('status', 'active')
            ->orderBy('sort_order')
            ->get();
        return response()->json($courses);
    }

    public function show(string $slug): JsonResponse
    {
        $course = Course::where('slug', $slug)
            ->with(['outcomes', 'curriculum', 'instructors'])
            ->firstOrFail();
        return response()->json($course);
    }

    /* ─── Admin list ─── */

    public function adminIndex(Request $request): JsonResponse
    {
        $q = Course::query();

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $q->where(fn($x) => $x->where('title', 'like', $s)->orWhere('slug', 'like', $s)->orWhere('category', 'like', $s));
        }
        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $q->where('category', $request->category);
        }

        $perPage = (int) ($request->per_page ?? 15);
        $courses = $q->orderBy('sort_order')->paginate($perPage);

        return response()->json($courses);
    }

    /* ─── Admin CRUD ─── */

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateCourse($request);
        $course = Course::create($data);
        return response()->json(['course' => $course->load(['outcomes', 'curriculum', 'instructors'])], 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $data = $this->validateCourse($request, $course->id);
        $course->update($data);
        return response()->json(['course' => $course->fresh()->load(['outcomes', 'curriculum', 'instructors'])]);
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();
        return response()->json(['message' => 'Course deleted.']);
    }

    private function validateCourse(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'slug'           => 'required|string|max:100|unique:courses,slug' . ($ignoreId ? ",$ignoreId" : ''),
            'category'       => 'required|string|exists:course_categories,slug',
            'title'          => 'required|string|max:200',
            'subtitle'       => 'nullable|string|max:300',
            'description'    => 'nullable|string|max:1000',
            'icon'           => 'nullable|string|max:100',
            'icon_class'     => 'nullable|string|max:50',
            'level'          => 'nullable|string|max:50',
            'level_class'    => 'nullable|string|max:50',
            'duration'       => 'nullable|string|max:50',
            'students_count' => 'nullable|integer|min:0',
            'rating'         => 'nullable|numeric|min:0|max:5',
            'reviews_count'  => 'nullable|integer|min:0',
            'price'          => 'nullable|string|max:100',
            'tags'           => 'nullable|array',
            'tags.*'         => 'string|max:100',
            'image_url'      => 'nullable|string|max:500',
            'overview'       => 'nullable|string',
            'badge'          => 'nullable|string|max:50',
            'sort_order'     => 'nullable|integer',
            'status'         => 'nullable|string|in:active,archived',
        ]);
    }

    /* ─── Outcomes ─── */

    public function indexOutcomes(Course $course): JsonResponse
    {
        return response()->json($course->outcomes);
    }

    public function storeOutcome(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'outcome'    => 'required|string|max:500',
            'sort_order' => 'nullable|integer',
        ]);
        $outcome = $course->outcomes()->create($data);
        return response()->json(['outcome' => $outcome], 201);
    }

    public function updateOutcome(Request $request, Course $course, CourseOutcome $outcome): JsonResponse
    {
        $data = $request->validate([
            'outcome'    => 'required|string|max:500',
            'sort_order' => 'nullable|integer',
        ]);
        $outcome->update($data);
        return response()->json(['outcome' => $outcome]);
    }

    public function destroyOutcome(Course $course, CourseOutcome $outcome): JsonResponse
    {
        $outcome->delete();
        return response()->json(['message' => 'Outcome deleted.']);
    }

    /* ─── Curriculum ─── */

    public function indexCurriculum(Course $course): JsonResponse
    {
        return response()->json($course->curriculum);
    }

    public function storeCurriculum(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'week_label' => 'required|string|max:50',
            'title'      => 'required|string|max:200',
            'topics'     => 'nullable|array',
            'topics.*'   => 'string|max:300',
            'sort_order' => 'nullable|integer',
        ]);
        $item = $course->curriculum()->create($data);
        return response()->json(['item' => $item], 201);
    }

    public function updateCurriculum(Request $request, Course $course, CourseCurriculum $item): JsonResponse
    {
        $data = $request->validate([
            'week_label' => 'required|string|max:50',
            'title'      => 'required|string|max:200',
            'topics'     => 'nullable|array',
            'topics.*'   => 'string|max:300',
            'sort_order' => 'nullable|integer',
        ]);
        $item->update($data);
        return response()->json(['item' => $item]);
    }

    public function destroyCurriculum(Course $course, CourseCurriculum $item): JsonResponse
    {
        $item->delete();
        return response()->json(['message' => 'Curriculum item deleted.']);
    }

    /* ─── Instructors ─── */

    public function indexInstructors(Course $course): JsonResponse
    {
        return response()->json($course->instructors);
    }

    public function storeInstructor(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:200',
            'role'       => 'nullable|string|max:200',
            'bio'        => 'nullable|string|max:1000',
            'image_url'  => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
        ]);
        $instructor = $course->instructors()->create($data);
        return response()->json(['instructor' => $instructor], 201);
    }

    public function updateInstructor(Request $request, Course $course, CourseInstructor $instructor): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:200',
            'role'       => 'nullable|string|max:200',
            'bio'        => 'nullable|string|max:1000',
            'image_url'  => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
        ]);
        $instructor->update($data);
        return response()->json(['instructor' => $instructor]);
    }

    public function destroyInstructor(Course $course, CourseInstructor $instructor): JsonResponse
    {
        $instructor->delete();
        return response()->json(['message' => 'Instructor deleted.']);
    }
}
