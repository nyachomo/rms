<?php

namespace App\Http\Controllers;

use App\Models\CourseLesson;
use App\Models\LessonExamOption;
use App\Models\LessonExamQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonExamController extends Controller
{
    /** GET /api/admin/lessons/{lesson}/exam */
    public function show(CourseLesson $lesson): JsonResponse
    {
        $questions = LessonExamQuestion::where('lesson_id', $lesson->id)
            ->with('options')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'pass_mark' => $lesson->pass_mark,
            'questions' => $questions,
        ]);
    }

    /** PUT /api/admin/lessons/{lesson}/exam/settings */
    public function updateSettings(Request $request, CourseLesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'pass_mark' => 'nullable|integer|min:1|max:100',
        ]);

        $lesson->update(['pass_mark' => $validated['pass_mark']]);

        return response()->json(['pass_mark' => $lesson->fresh()->pass_mark]);
    }

    /** POST /api/admin/lessons/{lesson}/exam/questions */
    public function storeQuestion(Request $request, CourseLesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'question'             => 'required|string|max:1000',
            'sort_order'           => 'integer|min:0',
            'options'              => 'required|array|min:2|max:6',
            'options.*.option_text'=> 'required|string|max:500',
            'options.*.is_correct' => 'boolean',
        ]);

        $this->ensureOneCorrect($validated['options']);

        $question = LessonExamQuestion::create([
            'lesson_id'  => $lesson->id,
            'question'   => $validated['question'],
            'sort_order' => $validated['sort_order'] ?? LessonExamQuestion::where('lesson_id', $lesson->id)->count(),
        ]);

        foreach ($validated['options'] as $i => $opt) {
            LessonExamOption::create([
                'question_id' => $question->id,
                'option_text' => $opt['option_text'],
                'is_correct'  => $opt['is_correct'] ?? false,
                'sort_order'  => $i,
            ]);
        }

        return response()->json(['question' => $question->load('options')], 201);
    }

    /** PUT /api/admin/lessons/{lesson}/exam/questions/{question} */
    public function updateQuestion(Request $request, CourseLesson $lesson, LessonExamQuestion $question): JsonResponse
    {
        $validated = $request->validate([
            'question'             => 'required|string|max:1000',
            'sort_order'           => 'integer|min:0',
            'options'              => 'required|array|min:2|max:6',
            'options.*.option_text'=> 'required|string|max:500',
            'options.*.is_correct' => 'boolean',
        ]);

        $this->ensureOneCorrect($validated['options']);

        $question->update([
            'question'   => $validated['question'],
            'sort_order' => $validated['sort_order'] ?? $question->sort_order,
        ]);

        $question->options()->delete();
        foreach ($validated['options'] as $i => $opt) {
            LessonExamOption::create([
                'question_id' => $question->id,
                'option_text' => $opt['option_text'],
                'is_correct'  => $opt['is_correct'] ?? false,
                'sort_order'  => $i,
            ]);
        }

        return response()->json(['question' => $question->fresh()->load('options')]);
    }

    /** DELETE /api/admin/lessons/{lesson}/exam/questions/{question} */
    public function destroyQuestion(CourseLesson $lesson, LessonExamQuestion $question): JsonResponse
    {
        $question->delete();
        return response()->json(['message' => 'Question deleted.']);
    }

    private function ensureOneCorrect(array $options): void
    {
        $correct = collect($options)->filter(fn($o) => $o['is_correct'] ?? false)->count();
        if ($correct !== 1) {
            abort(422, 'Exactly one option must be marked as correct.');
        }
    }
}
