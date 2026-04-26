<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Role::query();

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
            'name'        => 'required|string|max:150|unique:roles,name',
            'description' => 'nullable|string|max:1000',
            'status'      => 'in:active,archived',
        ]);

        $data['status'] ??= 'active';

        return response()->json(['role' => Role::create($data)], 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:1000',
            'status'      => 'required|in:active,archived',
        ]);

        $role->update($data);

        return response()->json(['role' => $role]);
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }
}
