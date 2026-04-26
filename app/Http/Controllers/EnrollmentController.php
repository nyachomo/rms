<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Intake;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EnrollmentController extends Controller
{
    /** Public: active intakes for the enrollment form dropdown */
    public function activeIntakes(): JsonResponse
    {
        $intakes = Intake::where('intake_status', 'active')
            ->orderBy('intake_start_date', 'desc')
            ->get(['id', 'intake_name', 'intake_start_date', 'intake_end_date']);

        return response()->json($intakes);
    }

    /** Public: submit enrollment */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'course_id'       => 'required|exists:courses,id',
            'intake_id'       => 'required|exists:intakes,id',
            'school_level_id' => 'required|exists:school_levels,id',
            'class_id'        => 'required|exists:school_classes,id',
            'name'            => 'required|string|max:150',
            'email'           => 'required|email|max:200|unique:enrollments,email',
            'phone'           => 'nullable|string|max:30',
            'sponsorship'     => 'required|in:self,guardian',
            'sponsor_name'    => 'required_if:sponsorship,guardian|nullable|string|max:150',
            'sponsor_email'   => 'required_if:sponsorship,guardian|nullable|email|max:200',
            'sponsor_phone'   => 'nullable|string|max:30',
        ]);

        // Prevent duplicate user accounts
        if (User::where('email', $data['email'])->exists()) {
            return response()->json([
                'message' => 'An account with this email already exists. Please contact us or log in.',
                'errors'  => ['email' => ['This email is already registered in our system.']],
            ], 422);
        }

        // Find the 'student' role (if any), else leave null
        $studentRole = Role::whereRaw('LOWER(name) = ?', ['student'])->first();

        // Create user account with default password
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make('12345678'),
            'role_id'  => $studentRole?->id,
            'status'   => 'active',
        ]);

        // Create enrollment record
        $enrollment = Enrollment::create([
            ...$data,
            'user_id' => $user->id,
            'status'  => 'pending',
        ]);

        return response()->json([
            'success'    => true,
            'message'    => 'Enrollment submitted successfully! Check your email for login credentials.',
            'enrollment' => $enrollment->load('course:id,title', 'intake:id,intake_name'),
            'login_email'=> $user->email,
        ], 201);
    }

    /** Admin: list all enrollments */
    public function index(Request $request): JsonResponse
    {
        $query = Enrollment::with(['course:id,title,slug', 'intake:id,intake_name', 'user:id,name,email']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status'))   $query->where('status',       $request->status);
        if ($request->filled('course_id')) $query->where('course_id',   $request->course_id);
        if ($request->filled('intake_id')) $query->where('intake_id',   $request->intake_id);

        $perPage     = min((int) $request->get('per_page', 15), 500);
        $enrollments = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($enrollments);
    }

    /** Admin: update status */
    public function updateStatus(Request $request, Enrollment $enrollment): JsonResponse
    {
        $request->validate(['status' => 'required|in:pending,approved,rejected']);
        $enrollment->update(['status' => $request->status]);
        return response()->json(['enrollment' => $enrollment->fresh()]);
    }

    /** Admin: delete */
    public function destroy(Enrollment $enrollment): JsonResponse
    {
        $enrollment->delete();
        return response()->json(['message' => 'Enrollment deleted.']);
    }
}
