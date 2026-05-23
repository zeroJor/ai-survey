<?php

namespace App\Services\Interview;

use App\Enums\Register;
use App\Models\InterviewTemplate;
use App\Models\Question;

class QuestionLabelResolver
{
    public function labelForCode(
        InterviewTemplate $template,
        string $questionCode,
        Register $register,
    ): string {
        $template->loadMissing('phases.questions.texts');

        $question = $template->phases
            ->flatMap(fn ($phase) => $phase->questions)
            ->firstWhere('code', $questionCode);

        if (! $question instanceof Question) {
            return $questionCode;
        }

        foreach ([$register, Register::Neutral, Register::Tu, Register::Usted] as $candidate) {
            $text = $question->texts
                ->first(fn ($row) => $row->field === 'label' && $row->register === $candidate);

            if ($text !== null && $text->body !== '') {
                return $text->body;
            }
        }

        return $questionCode;
    }
}
