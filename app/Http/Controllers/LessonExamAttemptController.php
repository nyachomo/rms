<?php

namespace App\Http\Controllers;

use App\Models\CourseLesson;
use App\Models\LessonExamAnswer;
use App\Models\LessonExamAttempt;
use App\Models\LessonExamQuestion;
use App\Models\StudentProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LessonExamAttemptController extends Controller
{
    /** GET /api/learning/lessons/{lesson}/exam — questions without correct-answer flags */
    public function show(CourseLesson $lesson): JsonResponse
    {
        if (is_null($lesson->pass_mark)) {
            return response()->json(['message' => 'This lesson has no exam.'], 404);
        }

        $questions = LessonExamQuestion::where('lesson_id', $lesson->id)
            ->with(['options' => fn($q) => $q->select('id', 'question_id', 'option_text', 'sort_order')])
            ->orderBy('sort_order')
            ->get(['id', 'lesson_id', 'question', 'sort_order']);

        $userId     = Auth::id();
        $bestAttempt = LessonExamAttempt::where('user_id', $userId)
            ->where('lesson_id', $lesson->id)
            ->orderByDesc('score')
            ->first();

        $attemptsCount = LessonExamAttempt::where('user_id', $userId)
            ->where('lesson_id', $lesson->id)
            ->count();

        return response()->json([
            'pass_mark'      => $lesson->pass_mark,
            'questions'      => $questions,
            'best_attempt'   => $bestAttempt ? [
                'score'          => (float) $bestAttempt->score,
                'passed'         => $bestAttempt->passed,
                'attempts_count' => $attemptsCount,
            ] : null,
        ]);
    }

    /** POST /api/learning/lessons/{lesson}/exam/submit */
    public function submit(Request $request, CourseLesson $lesson): JsonResponse
    {
        if (is_null($lesson->pass_mark)) {
            return response()->json(['message' => 'This lesson has no exam.'], 422);
        }

        $validated = $request->validate([
            'answers'   => 'required|array',
            'answers.*' => 'nullable|integer',
        ]);

        $questions = LessonExamQuestion::where('lesson_id', $lesson->id)
            ->with('options')
            ->orderBy('sort_order')
            ->get();

        if ($questions->isEmpty()) {
            return response()->json(['message' => 'No questions found for this exam.'], 422);
        }

        $userId       = Auth::id();
        $correctCount = 0;
        $results      = [];

        foreach ($questions as $q) {
            $selectedOptionId = isset($validated['answers'][$q->id])
                ? (int) $validated['answers'][$q->id]
                : null;

            $selectedOption = $selectedOptionId
                ? $q->options->firstWhere('id', $selectedOptionId)
                : null;

            $isCorrect = (bool) ($selectedOption?->is_correct ?? false);
            if ($isCorrect) $correctCount++;

            $correctOption = $q->options->firstWhere('is_correct', true);

            $results[] = [
                'question_id'         => $q->id,
                'question'            => $q->question,
                'selected_option_id'  => $selectedOptionId,
                'is_correct'          => $isCorrect,
                'correct_option_id'   => $correctOption?->id,
                'correct_option_text' => $correctOption?->option_text,
                'options'             => $q->options->map(fn($o) => [
                    'id'          => $o->id,
                    'option_text' => $o->option_text,
                ]),
            ];
        }

        $score  = round(($correctCount / $questions->count()) * 100, 2);
        $passed = $score >= $lesson->pass_mark;

        $attempt = LessonExamAttempt::create([
            'user_id'   => $userId,
            'lesson_id' => $lesson->id,
            'score'     => $score,
            'passed'    => $passed,
        ]);

        foreach ($questions as $q) {
            $r = collect($results)->firstWhere('question_id', $q->id);
            LessonExamAnswer::create([
                'attempt_id'         => $attempt->id,
                'question_id'        => $q->id,
                'selected_option_id' => $r['selected_option_id'],
                'is_correct'         => $r['is_correct'],
            ]);
        }

        // Auto-mark the lesson complete when the student passes
        if ($passed) {
            StudentProgress::updateOrCreate(
                ['user_id' => $userId, 'lesson_id' => $lesson->id],
                ['completed_at' => now()]
            );
        }

        $attemptsCount = LessonExamAttempt::where('user_id', $userId)
            ->where('lesson_id', $lesson->id)
            ->count();

        return response()->json([
            'score'          => $score,
            'passed'         => $passed,
            'pass_mark'      => $lesson->pass_mark,
            'correct'        => $correctCount,
            'total'          => $questions->count(),
            'attempts_count' => $attemptsCount,
            'results'        => $results,
        ]);
    }
}
