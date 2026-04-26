<?php

namespace App\Http\Controllers;

use App\Models\ProgramEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProgramEvent::withCount('students');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('program_event_name', 'like', "%{$s}%")
                  ->orWhere('program_event_location', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) ($request->get('per_page', 15)), 500);

        return response()->json($query->orderBy('program_event_date', 'desc')->paginate($perPage));
    }

    public function all(): JsonResponse
    {
        return response()->json(
            ProgramEvent::where('status', 'active')
                ->orderBy('program_event_name')
                ->get(['id', 'program_event_name', 'program_event_date', 'program_event_location'])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'program_event_name'     => 'required|string|max:255',
            'program_event_location' => 'nullable|string|max:500',
            'program_event_date'     => 'nullable|date',
            'status'                 => 'nullable|in:active,archived',
        ]);

        $data['status'] ??= 'active';

        $event = ProgramEvent::create($data);
        $event->loadCount('students');

        return response()->json(['program_event' => $event], 201);
    }

    public function update(Request $request, ProgramEvent $programEvent): JsonResponse
    {
        $data = $request->validate([
            'program_event_name'     => 'required|string|max:255',
            'program_event_location' => 'nullable|string|max:500',
            'program_event_date'     => 'nullable|date',
            'status'                 => 'required|in:active,archived',
        ]);

        $programEvent->update($data);
        $programEvent->loadCount('students');

        return response()->json(['program_event' => $programEvent]);
    }

    public function destroy(ProgramEvent $programEvent): JsonResponse
    {
        $programEvent->students()->update(['program_event_id' => null]);
        $programEvent->delete();

        return response()->json(['message' => 'Program event deleted successfully.']);
    }
}
