<?php

namespace App\Http\Controllers;

use App\Imports\SchoolsImport;
use App\Models\School;
use App\Models\CompanySetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SchoolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = School::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('school_name', 'like', "%{$s}%")
                  ->orWhere('school_location', 'like', "%{$s}%")
                  ->orWhere('school_contact_person', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('school_status', $request->status);
        }

        if ($request->filled('location')) {
            $query->where('school_location', $request->location);
        }

        if ($request->filled('category_id')) {
            $query->where('school_category_id', $request->category_id);
        }

        if ($request->filled('level_id')) {
            $query->where('school_level_id', $request->level_id);
        }

        $schools = $query->with(['category', 'level'])->orderBy('school_name')->paginate(15);

        return response()->json($schools);
    }

    public function locations(): JsonResponse
    {
        $locations = School::select('school_location')
            ->distinct()
            ->orderBy('school_location')
            ->pluck('school_location');

        return response()->json($locations);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'school_name'           => 'required|string|max:150',
            'school_location'       => 'required|string|max:200',
            'school_contact_person' => 'required|string|max:100',
            'school_status'         => 'in:active,archived',
            'school_category_id'    => 'nullable|exists:school_categories,id',
            'school_level_id'       => 'nullable|exists:school_levels,id',
        ]);

        $data['school_status'] ??= 'active';

        $school = School::create($data);
        $school->load(['category', 'level']);

        return response()->json(['school' => $school], 201);
    }

    public function update(Request $request, School $school): JsonResponse
    {
        $data = $request->validate([
            'school_name'           => 'required|string|max:150',
            'school_location'       => 'required|string|max:200',
            'school_contact_person' => 'required|string|max:100',
            'school_status'         => 'required|in:active,archived',
            'school_category_id'    => 'nullable|exists:school_categories,id',
            'school_level_id'       => 'nullable|exists:school_levels,id',
        ]);

        $school->update($data);
        $school->load(['category', 'level']);

        return response()->json(['school' => $school]);
    }

    public function destroy(School $school): JsonResponse
    {
        $school->delete();

        return response()->json(['message' => 'School deleted successfully.']);
    }

    public function destroyAll(): JsonResponse
    {
        $count = School::count();

        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        School::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        return response()->json(['message' => "All {$count} school record(s) deleted successfully.", 'count' => $count]);
    }

    /**
     * Import schools from an uploaded CSV or Excel file.
     * Expected columns (header row): school_name, school_location, school_contact_person, school_status
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file'               => 'required|file|mimes:csv,xlsx,xls,txt|max:5120',
            'school_category_id' => 'nullable|exists:school_categories,id',
            'school_level_id'    => 'nullable|exists:school_levels,id',
        ]);

        $import = new SchoolsImport(
            categoryId: $request->input('school_category_id') ? (int) $request->input('school_category_id') : null,
            levelId:    $request->input('school_level_id')    ? (int) $request->input('school_level_id')    : null,
        );

        Excel::import($import, $request->file('file'));

        $failures = $import->failures();

        $errorMessages = [];
        foreach ($failures as $failure) {
            $errorMessages[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
        }

        $importedCount = School::count(); // rough total; track delta if needed

        return response()->json([
            'success'  => true,
            'imported' => $importedCount,
            'errors'   => $errorMessages,
            'message'  => count($errorMessages) === 0
                ? 'All rows imported successfully.'
                : count($errorMessages) . ' row(s) had errors and were skipped.',
        ]);
    }

    /**
     * Export all (optionally filtered) schools as a PDF with company letterhead.
     */
    public function exportPdf(Request $request)
    {
        // dompdf is memory-intensive; raise limit for this request only
        ini_set('memory_limit', '256M');

        $limit  = 500; // max rows per PDF to stay within memory bounds
        $query  = School::query();
        $search = $request->get('search', '');
        $status = $request->get('status', '');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('school_name',            'like', "%{$search}%")
                  ->orWhere('school_location',       'like', "%{$search}%")
                  ->orWhere('school_contact_person', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('school_status', $status);
        }

        $location   = $request->get('location', '');
        $categoryId = $request->get('category_id', '');
        $levelId    = $request->get('level_id', '');

        if ($location) {
            $query->where('school_location', $location);
        }

        if ($categoryId) {
            $query->where('school_category_id', $categoryId);
        }

        if ($levelId) {
            $query->where('school_level_id', $levelId);
        }

        $total    = $query->count();
        $schools  = $query->with(['category', 'level'])->orderBy('school_name')->limit($limit)->get();
        $settings = CompanySetting::instance();
        $capped   = $total > $limit;

        $pdf = Pdf::loadView('pdf.schools', compact('schools', 'settings', 'search', 'status', 'location', 'total', 'capped', 'limit'))
                  ->setPaper('a4', 'landscape');

        $filename = 'schools_' . now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Download a blank CSV template the user can fill in.
     */
    public function template(): StreamedResponse
    {
        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="schools_import_template.csv"',
        ];

        $rows = [
            ['school_name', 'school_location', 'school_contact_person', 'school_status'],
            ['Nairobi High School', 'Nairobi, Kenya', 'John Doe', 'active'],
            ['Mombasa Girls High', 'Mombasa, Kenya', 'Jane Smith', 'active'],
        ];

        return response()->stream(function () use ($rows) {
            $fp = fopen('php://output', 'w');
            foreach ($rows as $row) {
                fputcsv($fp, $row);
            }
            fclose($fp);
        }, 200, $headers);
    }
}
