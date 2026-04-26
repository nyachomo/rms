<?php

namespace App\Http\Controllers;

use App\Models\Intake;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntakeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Intake::query();

        if ($request->filled('search')) {
            $query->where('intake_name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('intake_status', $request->status);
        }

        $perPage  = min((int) $request->get('per_page', 15), 500);
        $intakes  = $query->orderBy('intake_start_date', 'desc')->paginate($perPage);

        return response()->json($intakes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'intake_name'       => 'required|string|max:200|unique:intakes,intake_name',
            'intake_start_date' => 'required|date',
            'intake_end_date'   => 'required|date|after_or_equal:intake_start_date',
            'intake_status'     => 'in:active,archived,ended',
        ]);

        $data['intake_status'] ??= 'active';

        return response()->json(['intake' => Intake::create($data)], 201);
    }

    public function update(Request $request, Intake $intake): JsonResponse
    {
        $data = $request->validate([
            'intake_name'       => 'required|string|max:200|unique:intakes,intake_name,' . $intake->id,
            'intake_start_date' => 'required|date',
            'intake_end_date'   => 'required|date|after_or_equal:intake_start_date',
            'intake_status'     => 'required|in:active,archived,ended',
        ]);

        $intake->update($data);

        return response()->json(['intake' => $intake->fresh()]);
    }

    public function destroy(Intake $intake): JsonResponse
    {
        $intake->delete();

        return response()->json(['message' => 'Intake deleted successfully.']);
    }
}
