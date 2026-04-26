<?php

namespace App\Http\Controllers;

use App\Models\SchoolLevel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolLevelController extends Controller
{
    /** Public: active levels for enrollment form */
    public function publicIndex(): JsonResponse
    {
        return response()->json(
            SchoolLevel::where('status', 'active')->orderBy('name')->get(['id', 'name'])
        );
    }

    public function index(Request $request): JsonResponse
    {
        $query = SchoolLevel::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) ($request->get('per_page', 15)), 500);

        return response()->json($query->orderBy('name')->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150|unique:school_levels,name',
            'description' => 'nullable|string|max:1000',
            'status'      => 'in:active,archived',
        ]);

        $data['status'] ??= 'active';

        return response()->json(['level' => SchoolLevel::create($data)], 201);
    }

    public function update(Request $request, SchoolLevel $schoolLevel): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150|unique:school_levels,name,' . $schoolLevel->id,
            'description' => 'nullable|string|max:1000',
            'status'      => 'required|in:active,archived',
        ]);

        $schoolLevel->update($data);

        return response()->json(['level' => $schoolLevel]);
    }

    public function destroy(SchoolLevel $schoolLevel): JsonResponse
    {
        $schoolLevel->delete();

        return response()->json(['message' => 'School level deleted successfully.']);
    }
}
