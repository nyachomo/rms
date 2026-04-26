<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name',  'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $perPage = min((int) ($request->get('per_page', 15)), 500);

        return response()->json($query->orderBy('name')->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|max:200|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
            'role_id'  => 'nullable|exists:roles,id',
            'status'   => 'in:active,inactive',
        ]);

        $data['status']   ??= 'active';
        $data['password']   = Hash::make($data['password']);

        $user = User::create($data);
        $user->load('role');

        return response()->json(['user' => $this->resource($user)], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|max:200|unique:users,email,' . $user->id,
            'role_id'  => 'nullable|exists:roles,id',
            'status'   => 'required|in:active,inactive',
            'password' => ['nullable', 'confirmed', Password::min(8)],
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        $user->load('role');

        return response()->json(['user' => $this->resource($user->fresh())]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    private function resource(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role_id'    => $user->role_id,
            'role'       => $user->role,
            'status'     => $user->status,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }
}
