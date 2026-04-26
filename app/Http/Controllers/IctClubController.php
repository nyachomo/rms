<?php

namespace App\Http\Controllers;

use App\Models\IctClubRegistration;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class IctClubController extends Controller
{
    /** Public: submit ICT club registration */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'required|string|max:150',
            'email'  => 'required|email|max:200|unique:ict_club_registrations,email',
            'phone'  => 'nullable|string|max:30',
            'school' => 'nullable|string|max:200',
            'track'  => 'required|string|max:100',
            'why'    => 'nullable|string|max:1000',
        ]);

        // Prevent duplicate user accounts
        if (User::where('email', $data['email'])->exists()) {
            return response()->json([
                'message' => 'An account with this email already exists. Please contact us or log in.',
                'errors'  => ['email' => ['This email is already registered in our system.']],
            ], 422);
        }

        // Find the 'student' role (case-insensitive)
        $role = Role::whereRaw('LOWER(name) = ?', ['student'])->first();

        // Create user account with default password
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make('12345678'),
            'role_id'  => $role?->id,
            'status'   => 'active',
        ]);

        // Create registration record
        $registration = IctClubRegistration::create([
            ...$data,
            'user_id' => $user->id,
            'status'  => 'pending',
        ]);

        return response()->json([
            'success'      => true,
            'message'      => 'Registration submitted successfully! Check your credentials to access the system.',
            'registration' => $registration,
            'login_email'  => $user->email,
        ], 201);
    }

    /** Admin: list all registrations */
    public function index(Request $request): JsonResponse
    {
        $query = IctClubRegistration::with('user:id,name,email');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name',   'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('school','like', "%{$s}%");
            });
        }

        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('track'))  $query->where('track',  $request->track);

        $perPage = min((int) $request->get('per_page', 15), 500);
        return response()->json($query->orderByDesc('created_at')->paginate($perPage));
    }

    /** Admin: update status */
    public function updateStatus(Request $request, IctClubRegistration $ictClubRegistration): JsonResponse
    {
        $request->validate(['status' => 'required|in:pending,approved,rejected']);
        $ictClubRegistration->update(['status' => $request->status]);
        return response()->json(['registration' => $ictClubRegistration->fresh()]);
    }

    /** Admin: delete */
    public function destroy(IctClubRegistration $ictClubRegistration): JsonResponse
    {
        $ictClubRegistration->delete();
        return response()->json(['message' => 'Registration deleted.']);
    }
}
