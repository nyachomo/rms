<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SchoolClass::withCount('students')->with('schoolCategory:id,name', 'schoolLevel:id,name');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('teacher', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) ($request->get('per_page', 15)), 500);

        return response()->json($query->orderBy('name')->paginate($perPage));
    }

    /** Return all active classes (for dropdowns) */
    public function all(): JsonResponse
    {
        return response()->json(
            SchoolClass::where('status', 'active')->orderBy('name')->get(['id', 'name'])
        );
    }

    /** Public: active classes filtered by school level */
    public function publicByLevel(Request $request): JsonResponse
    {
        $query = SchoolClass::where('status', 'active');
        if ($request->filled('level_id')) {
            $query->where('school_level_id', $request->level_id);
        }
        return response()->json($query->orderBy('name')->get(['id', 'name']));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'               => 'required|string|max:150|unique:school_classes,name',
            'description'        => 'nullable|string|max:1000',
            'capacity'           => 'nullable|integer|min:1|max:9999',
            'teacher'            => 'nullable|string|max:200',
            'status'             => 'in:active,archived',
            'school_category_id' => 'nullable|exists:school_categories,id',
            'school_level_id'    => 'nullable|exists:school_levels,id',
        ]);

        $data['status'] ??= 'active';

        $class = SchoolClass::create($data);
        $class->loadCount('students');
        $class->load('schoolCategory:id,name', 'schoolLevel:id,name');

        return response()->json(['class' => $class], 201);
    }

    public function update(Request $request, SchoolClass $schoolClass): JsonResponse
    {
        $data = $request->validate([
            'name'               => 'required|string|max:150|unique:school_classes,name,' . $schoolClass->id,
            'description'        => 'nullable|string|max:1000',
            'capacity'           => 'nullable|integer|min:1|max:9999',
            'teacher'            => 'nullable|string|max:200',
            'status'             => 'required|in:active,archived',
            'school_category_id' => 'nullable|exists:school_categories,id',
            'school_level_id'    => 'nullable|exists:school_levels,id',
        ]);

        $schoolClass->update($data);
        $schoolClass->loadCount('students');
        $schoolClass->load('schoolCategory:id,name', 'schoolLevel:id,name');

        return response()->json(['class' => $schoolClass]);
    }

    public function destroy(SchoolClass $schoolClass): JsonResponse
    {
        $schoolClass->delete();

        return response()->json(['message' => 'Class deleted successfully.']);
    }
}
