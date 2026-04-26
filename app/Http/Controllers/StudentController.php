<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    /** Generate a unique 4-digit admission number */
    private function generateAdmissionNumber(): string
    {
        do {
            $adm = str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (Student::where('admission_number', $adm)->exists());

        return $adm;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Student::with('school', 'schoolClass', 'user.role', 'programEvent');

        // If the authenticated user is a teacher, restrict to their school only
        $teacher = Teacher::where('user_id', Auth::id())->first();
        if ($teacher) {
            $query->where('school_id', $teacher->school_id);
        } elseif ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('admission_number', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
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
            'class_id'      => 'nullable|exists:school_classes,id',
            'gender'        => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'phone'         => 'nullable|string|max:30',
            'parent_phone'  => 'nullable|string|max:30',
            'address'       => 'nullable|string|max:1000',
            'status'           => 'nullable|in:active,inactive',
            'role_id'          => 'nullable|exists:roles,id',
            'program_event_id' => 'nullable|exists:program_events,id',
            'password'         => 'nullable|string|min:8',
        ]);

        $data['status'] ??= 'active';

        // Auto-generate admission number and derive email
        $admNo = $this->generateAdmissionNumber();
        $email = $admNo . '@tti.co.ke';

        // Always create a user account (default password: 12345678)
        $userRecord = User::create([
            'name'     => $data['name'],
            'email'    => $email,
            'password' => Hash::make($data['password'] ?? '12345678'),
            'role_id'  => $data['role_id'] ?? null,
            'status'   => 'active',
        ]);

        $student = Student::create([
            'user_id'          => $userRecord->id,
            'school_id'        => $data['school_id'] ?? null,
            'program_event_id' => $data['program_event_id'] ?? null,
            'name'             => $data['name'],
            'admission_number' => $admNo,
            'class_id'         => $data['class_id'] ?? null,
            'gender'           => $data['gender'] ?? null,
            'date_of_birth'    => $data['date_of_birth'] ?? null,
            'phone'            => $data['phone'] ?? null,
            'parent_phone'     => $data['parent_phone'] ?? null,
            'email'            => $email,
            'address'          => $data['address'] ?? null,
            'status'           => $data['status'],
        ]);

        $student->load('school', 'schoolClass', 'user.role', 'programEvent');

        return response()->json(['student' => $student], 201);
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:200',
            'school_id'     => 'nullable|exists:schools,id',
            'class_id'      => 'nullable|exists:school_classes,id',
            'gender'        => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'phone'         => 'nullable|string|max:30',
            'parent_phone'  => 'nullable|string|max:30',
            'address'       => 'nullable|string|max:1000',
            'status'           => 'required|in:active,inactive',
            'role_id'          => 'nullable|exists:roles,id',
            'program_event_id' => 'nullable|exists:program_events,id',
        ]);

        $student->update([
            'name'             => $data['name'],
            'school_id'        => $data['school_id'] ?? null,
            'program_event_id' => $data['program_event_id'] ?? null,
            'class_id'         => $data['class_id'] ?? null,
            'gender'           => $data['gender'] ?? null,
            'date_of_birth'    => $data['date_of_birth'] ?? null,
            'phone'            => $data['phone'] ?? null,
            'parent_phone'     => $data['parent_phone'] ?? null,
            'address'          => $data['address'] ?? null,
            'status'           => $data['status'],
        ]);

        if ($student->user_id && $student->user) {
            $student->user->update([
                'name'    => $data['name'],
                'role_id' => $data['role_id'] ?? $student->user->role_id,
            ]);
        }

        $student->load('school', 'schoolClass', 'user.role', 'programEvent');

        return response()->json(['student' => $student]);
    }

    public function resetPassword(Student $student): JsonResponse
    {
        if ($student->user_id && $student->user) {
            $student->user->update(['password' => Hash::make('12345678')]);
        }

        return response()->json(['message' => 'Password reset to default successfully.']);
    }

    public function destroy(Student $student): JsonResponse
    {
        if ($student->user_id) {
            User::destroy($student->user_id);
        }

        $student->delete();

        return response()->json(['message' => 'Student deleted successfully.']);
    }
}
