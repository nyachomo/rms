<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\RolePermissionController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|max:200|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $this->userResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Log in an existing user.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $this->userResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Return the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->userResource($request->user()),
        ]);
    }

    /**
     * Update the authenticated user's profile (name & email).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'required|string|max:100',
            'email' => 'required|email|max:200|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'user'    => $this->userResource($user->fresh()),
            'message' => 'Profile updated successfully.',
        ]);
    }

    /**
     * Change the authenticated user's password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(8)],
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Revoke all tokens so other sessions are invalidated
        $user->tokens()->delete();

        // Issue a fresh token for the current session
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token'   => $token,
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * Revoke the current token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    private function userResource(User $user): array
    {
        $user->loadMissing('role.permissions');

        // Build permissions map { module: { action: bool } }
        $moduleActions = RolePermissionController::MODULE_ACTIONS;
        $permissions   = null; // null means super-admin (no role = full access)

        if ($user->role_id) {
            foreach ($moduleActions as $module => $actions) {
                foreach ($actions as $action) {
                    $permissions[$module][$action] = false;
                }
            }
            foreach ($user->role->permissions as $perm) {
                if (isset($permissions[$perm->module][$perm->action])) {
                    $permissions[$perm->module][$perm->action] = true;
                }
            }
        }

        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role_id'     => $user->role_id,
            'role'        => $user->role ? ['id' => $user->role->id, 'name' => $user->role->name] : null,
            'status'      => $user->status,
            'permissions' => $permissions,
        ];
    }
}
