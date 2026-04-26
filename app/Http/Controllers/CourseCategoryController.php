<?php

namespace App\Http\Controllers;

use App\Models\CourseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseCategoryController extends Controller
{
    public function publicIndex(): JsonResponse
    {
        $categories = CourseCategory::where('status', 'active')
            ->withCount('courses')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'icon', 'color', 'sort_order']);

        return response()->json($categories);
    }

    public function index(Request $request): JsonResponse
    {
        $q = CourseCategory::withCount('courses');

        if ($request->filled('search')) {
            $s = $request->search;
            $q->where(fn($x) => $x->where('name', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%"));
        }

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        $perPage = min((int) $request->get('per_page', 50), 500);
        return response()->json($q->orderBy('sort_order')->orderBy('name')->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150|unique:course_categories,name',
            'description' => 'nullable|string|max:1000',
            'icon'        => 'nullable|string|max:100',
            'color'       => 'nullable|string|max:50',
            'sort_order'  => 'nullable|integer|min:0',
            'status'      => 'in:active,inactive',
        ]);

        $data['slug']       = Str::slug($data['name']);
        $data['status']   ??= 'active';
        $data['sort_order'] = $data['sort_order'] ?? 0;

        // Ensure slug is unique
        $base = $data['slug'];
        $n    = 1;
        while (CourseCategory::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $base . '-' . $n++;
        }

        return response()->json(['category' => CourseCategory::create($data)], 201);
    }

    public function update(Request $request, CourseCategory $courseCategory): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150|unique:course_categories,name,' . $courseCategory->id,
            'description' => 'nullable|string|max:1000',
            'icon'        => 'nullable|string|max:100',
            'color'       => 'nullable|string|max:50',
            'sort_order'  => 'nullable|integer|min:0',
            'status'      => 'required|in:active,inactive',
        ]);

        // Re-slug only if name changed
        if ($data['name'] !== $courseCategory->name) {
            $base = Str::slug($data['name']);
            $slug = $base;
            $n    = 1;
            while (CourseCategory::where('slug', $slug)->where('id', '!=', $courseCategory->id)->exists()) {
                $slug = $base . '-' . $n++;
            }
            $data['slug'] = $slug;
        }

        $courseCategory->update($data);
        return response()->json(['category' => $courseCategory->fresh()]);
    }

    public function destroy(CourseCategory $courseCategory): JsonResponse
    {
        // Detach courses before delete (set category_id to null via nullOnDelete, but do it explicitly)
        $courseCategory->courses()->update(['category_id' => null]);
        $courseCategory->delete();
        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
