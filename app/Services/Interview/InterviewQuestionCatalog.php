<?php

namespace App\Services\Interview;

use App\Models\Interview;
use App\Models\InterviewTemplate;

class InterviewQuestionCatalog
{
    /**
     * @return list<string>
     */
    public function orderedCodes(InterviewTemplate $template): array
    {
        $template->loadMissing('phases.questions');

        return $template->phases
            ->flatMap(fn ($phase) => $phase->questions)
            ->sortBy('sort_order')
            ->values()
            ->pluck('code')
            ->all();
    }

    public function indexForCode(InterviewTemplate $template, string $questionCode): ?int
    {
        $codes = $this->orderedCodes($template);
        $index = array_search($questionCode, $codes, true);

        return $index === false ? null : $index;
    }

    public function nextCodeAfter(InterviewTemplate $template, string $questionCode): ?string
    {
        $codes = $this->orderedCodes($template);
        $index = array_search($questionCode, $codes, true);

        if ($index === false) {
            return null;
        }

        return $codes[$index + 1] ?? null;
    }

    public function allAnswered(Interview $interview, InterviewTemplate $template): bool
    {
        $interview->loadMissing('answers');
        $codes = $this->orderedCodes($template);

        foreach ($codes as $code) {
            $answer = $interview->answers->firstWhere('question_code', $code);

            if ($answer === null) {
                return false;
            }

            if (! $answer->skipped && trim((string) $answer->body) === '') {
                return false;
            }
        }

        return true;
    }
}
