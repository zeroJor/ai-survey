<?php

namespace App\Http\Controllers;

use App\Enums\InterviewStatus;
use App\Enums\Register;
use App\Services\Interview\InterviewCompletionService;
use App\Services\Interview\TalkBootstrapBuilder;
use App\Support\InterviewRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TalkController extends Controller
{
    public function __construct(
        private readonly TalkBootstrapBuilder $bootstrap,
        private readonly InterviewCompletionService $completion,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $interview = InterviewRequest::interview($request);

        return response()->json($this->bootstrap->build($interview));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'register' => ['required', 'string', 'in:tu,usted'],
        ]);

        $interview = InterviewRequest::interview($request);
        $register = Register::from($validated['register']);

        $updates = ['register' => $register];

        if ($interview->status === InterviewStatus::NotStarted) {
            $updates['status'] = InterviewStatus::InProgress;
            $updates['started_at'] = now();
        }

        $interview->update($updates);
        $interview->refresh();

        return response()->json($this->bootstrap->build($interview));
    }

    public function complete(Request $request): JsonResponse
    {
        $interview = InterviewRequest::interview($request);

        return response()->json($this->completion->complete($interview));
    }
}
