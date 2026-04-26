<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    private function generateEmployeeNumber(): string
    {
        do {
            $num = 'TCH' . str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (Teacher::where('employee_number', $num)->exists());

        return $num;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Teacher::with('school', 'user.role');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('employee_number', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
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
            'name'          => 'required|string|max:200',
            'school_id'     => 'nullable|exists:schools,id',
            'gender'        => 'nullable|in:male,female,other',
            'phone'         => 'nullable|string|max:30',
            'address'       => 'nullable|string|max:1000',
            'status'        => 'nullable|in:active,inactive',
            'role_id'       => 'nullable|exists:roles,id',
        ]);

        $data['status'] ??= 'active';

        $empNo = $this->generateEmployeeNumber();
        $email = strtolower($empNo) . '@tti.co.ke';

        $userRecord = User::create([
            'name'     => $data['name'],
            'email'    => $email,
            'password' => Hash::make('12345678'),
            'role_id'  => $data['role_id'] ?? null,
            'status'   => 'active',
        ]);

        $teacher = Teacher::create([
            'user_id'         => $userRecord->id,
            'school_id'       => $data['school_id'] ?? null,
            'name'            => $data['name'],
            'employee_number' => $empNo,
            'email'           => $email,
            'phone'           => $data['phone'] ?? null,
            'gender'          => $data['gender'] ?? null,
            'address'         => $data['address'] ?? null,
            'status'          => $data['status'],
        ]);

        $teacher->load('school', 'user.role');

        return response()->json(['teacher' => $teacher], 201);
    }

    public function update(Request $request, Teacher $teacher): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:200',
            'school_id'     => 'nullable|exists:schools,id',
            'gender'        => 'nullable|in:male,female,other',
            'phone'         => 'nullable|string|max:30',
            'address'       => 'nullable|string|max:1000',
            'status'        => 'required|in:active,inactive',
            'role_id'       => 'nullable|exists:roles,id',
        ]);

        $teacher->update([
            'name'          => $data['name'],
            'school_id'     => $data['school_id'] ?? null,
            'gender'        => $data['gender'] ?? null,
            'phone'         => $data['phone'] ?? null,
            'address'       => $data['address'] ?? null,
            'status'        => $data['status'],
        ]);

        if ($teacher->user_id && $teacher->user) {
            $teacher->user->update([
                'name'    => $data['name'],
                'role_id' => $data['role_id'] ?? $teacher->user->role_id,
            ]);
        }

        $teacher->load('school', 'user.role');

        return response()->json(['teacher' => $teacher]);
    }

    public function resetPassword(Teacher $teacher): JsonResponse
    {
        if ($teacher->user_id && $teacher->user) {
            $teacher->user->update(['password' => Hash::make('12345678')]);
        }

        return response()->json(['message' => 'Password reset to default successfully.']);
    }

    public function destroy(Teacher $teacher): JsonResponse
    {
        if ($teacher->user_id) {
            User::destroy($teacher->user_id);
        }

        $teacher->delete();

        return response()->json(['message' => 'Teacher deleted successfully.']);
    }
}
