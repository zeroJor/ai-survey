<?php

namespace App\Services\Llm;

use App\Enums\Register;
use App\Models\InterviewTemplate;
use App\Models\TemplateCopy;

class TemplateCopyPools
{
    /**
     * @return list<string>
     */
    public function microReplyPool(
        InterviewTemplate $template,
        Register $register,
        bool $useLlmPool,
    ): array {
        $template->loadMissing('templateCopies');

        $key = $useLlmPool
            ? ($register === Register::Tu
                ? 'micro_reply_templates_tu'
                : 'micro_reply_templates_usted')
            : ($register === Register::Tu
                ? 'micro_reply_fallback_templates_tu'
                : 'micro_reply_fallback_templates_usted');

        $copy = $template->templateCopies
            ->first(fn (TemplateCopy $row) => $row->key === $key && $row->register === Register::Neutral);

        if ($copy === null || $copy->body === '') {
            return ['Gracias, seguimos.'];
        }

        $decoded = json_decode($copy->body, true);

        if (! is_array($decoded) || $decoded === []) {
            return ['Gracias, seguimos.'];
        }

        return array_values(array_map('strval', $decoded));
    }

    public function farewellBody(InterviewTemplate $template, Register $register): string
    {
        $template->loadMissing('templateCopies');

        $copy = $template->templateCopies
            ->first(fn (TemplateCopy $row) => $row->key === 'farewell' && $row->register === $register);

        return $copy?->body ?? 'Gracias por su tiempo.';
    }
}
