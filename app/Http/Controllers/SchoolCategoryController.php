<?php

namespace App\Http\Controllers;

use App\Models\SchoolCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SchoolCategory::query();

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
        $categories = $query->orderBy('name')->paginate($perPage);

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150|unique:school_categories,name',
            'description' => 'nullable|string|max:1000',
            'status'      => 'in:active,archived',
        ]);

        $data['status'] ??= 'active';

        return response()->json(['category' => SchoolCategory::create($data)], 201);
    }

    public function update(Request $request, SchoolCategory $schoolCategory): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150|unique:school_categories,name,' . $schoolCategory->id,
            'description' => 'nullable|string|max:1000',
            'status'      => 'required|in:active,archived',
        ]);

        $schoolCategory->update($data);

        return response()->json(['category' => $schoolCategory]);
    }

    public function destroy(SchoolCategory $schoolCategory): JsonResponse
    {
        $schoolCategory->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
