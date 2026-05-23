<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Services\Admin\AdminInterviewReviewService;
use App\Services\Admin\InterviewAnalysisService;
use Illuminate\Http\JsonResponse;

class AdminInterviewController extends Controller
{
    public function __construct(
        private readonly AdminInterviewReviewService $reviews,
        private readonly InterviewAnalysisService $analysis,
    ) {}

    public function show(Interview $interview): JsonResponse
    {
        return response()->json($this->reviews->serialize($interview));
    }

    public function generateSummary(Interview $interview): JsonResponse
    {
        return response()->json($this->analysis->generate($interview));
    }
}
