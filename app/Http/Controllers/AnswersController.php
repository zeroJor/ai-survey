<?php

namespace App\Http\Controllers;

use App\Services\Interview\AnswerSubmissionService;
use App\Support\InterviewRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnswersController extends Controller
{
    public function __construct(
        private readonly AnswerSubmissionService $submissions,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'questionCode' => ['required', 'string', 'max:16'],
            'answer' => ['nullable', 'string'],
            'skipped' => ['required', 'boolean'],
        ]);

        $interview = InterviewRequest::interview($request);

        $result = $this->submissions->submit(
            $interview,
            $validated['questionCode'],
            $validated['answer'] ?? '',
            (bool) $validated['skipped'],
        );

        return response()->json($result);
    }
}
