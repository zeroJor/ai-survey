<?php

namespace App\Services\Admin;

use App\Enums\InterviewStatus;
use App\Enums\Register;
use App\Exceptions\InterviewFlowException;
use App\Models\Interview;
use App\Models\InterviewArtifact;
use App\Models\Question;
use App\Models\Settings;
use App\Services\Interview\InterviewQuestionCatalog;
use App\Services\Llm\LlmGateway;
use App\Services\Llm\StudioPrepRequest;

class InterviewAnalysisService
{
    public function __construct(
        private readonly LlmGateway $llm,
        private readonly InterviewQuestionCatalog $catalog,
    ) {}

    /**
     * @return array{artifact: array<string, mixed>}
     */
    public function generate(Interview $interview): array
    {
        $interview->loadMissing('invite', 'answers');

        if ($interview->status !== InterviewStatus::Completed) {
            throw InterviewFlowException::unprocessable(
                'La entrevista debe estar completada antes de generar el análisis.',
            );
        }

        $settings = Settings::current();

        if (! ($settings?->llm_enabled ?? false)) {
            throw InterviewFlowException::forbidden(
                'El LLM está deshabilitado. Actívalo en Ajustes para generar análisis.',
            );
        }

        $apiKey = config('llm.drivers.gemini.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw InterviewFlowException::unprocessable(
                'GEMINI_API_KEY no está configurada en el servidor.',
            );
        }

        if ($interview->register === null) {
            throw InterviewFlowException::unprocessable('Register is missing on this interview.');
        }

        $invite = $interview->invite;
        $template = $invite->interviewTemplate;
        $template->loadMissing('phases.questions.texts');

        $codes = $this->catalog->orderedCodes($template);
        $questionsByCode = $template->phases
            ->flatMap(fn ($phase) => $phase->questions)
            ->keyBy('code');
        $answersByCode = $interview->answers->keyBy('question_code');

        $questions = [];

        foreach ($codes as $code) {
            /** @var Question|null $question */
            $question = $questionsByCode->get($code);
            $answer = $answersByCode->get($code);

            $questions[] = [
                'code' => $code,
                'label' => $this->labelForQuestion($question),
                'answer' => $answer?->skipped ? null : $answer?->body,
                'skipped' => (bool) ($answer?->skipped ?? false),
            ];
        }

        $payload = $this->llm->studioPrepSummary(new StudioPrepRequest(
            register: $interview->register,
            questions: $questions,
            contactName: $invite->contact_name,
            businessName: $invite->business_name,
            businessAbout: $invite->business_about,
            studioProcess: (string) ($settings->studio_process ?? ''),
        ));

        $artifact = InterviewArtifact::query()->updateOrCreate(
            ['interview_id' => $interview->id],
            [
                'analysis_json' => $payload->toArray(),
                'schema_version' => '1',
                'generated_at' => now(),
            ],
        );

        return [
            'artifact' => [
                'schemaVersion' => $artifact->schema_version,
                'generatedAt' => $artifact->generated_at?->toIso8601String(),
                'analysis' => $artifact->analysis_json,
            ],
        ];
    }

    private function labelForQuestion(?Question $question): string
    {
        if ($question === null) {
            return '';
        }

        foreach ([Register::Neutral, Register::Tu, Register::Usted] as $register) {
            $text = $question->texts
                ->first(fn ($row) => $row->field === 'label' && $row->register === $register);

            if ($text !== null && $text->body !== '') {
                return $text->body;
            }
        }

        return $question->code;
    }
}
