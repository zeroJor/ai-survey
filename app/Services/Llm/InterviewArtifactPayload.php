<?php

namespace App\Services\Llm;

readonly class InterviewArtifactPayload
{
    /**
     * @param  list<string>  $keyQuotes
     */
    public function __construct(
        public string $psychologicalProfile,
        public string $clientNeeds,
        public string $businessContext,
        public string $salesStrategies,
        public string $recommendedNextSteps,
        public string $risks,
        public array $keyQuotes,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'psychologicalProfile' => $this->psychologicalProfile,
            'clientNeeds' => $this->clientNeeds,
            'businessContext' => $this->businessContext,
            'salesStrategies' => $this->salesStrategies,
            'recommendedNextSteps' => $this->recommendedNextSteps,
            'risks' => $this->risks,
            'keyQuotes' => $this->keyQuotes,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        $quotes = $data['keyQuotes'] ?? [];
        if (is_string($quotes)) {
            $quotes = array_filter(array_map('trim', explode("\n", $quotes)));
        }
        if (! is_array($quotes)) {
            $quotes = [];
        }

        return new self(
            psychologicalProfile: (string) ($data['psychologicalProfile'] ?? ''),
            clientNeeds: (string) ($data['clientNeeds'] ?? ''),
            businessContext: (string) ($data['businessContext'] ?? ''),
            salesStrategies: (string) ($data['salesStrategies'] ?? ''),
            recommendedNextSteps: (string) ($data['recommendedNextSteps'] ?? ''),
            risks: (string) ($data['risks'] ?? ''),
            keyQuotes: array_values(array_map('strval', $quotes)),
        );
    }

    public static function disabledStub(): self
    {
        $message = 'LLM deshabilitado — revisar respuestas en bruto en el hilo de conversación.';

        return new self(
            psychologicalProfile: $message,
            clientNeeds: $message,
            businessContext: $message,
            salesStrategies: $message,
            recommendedNextSteps: $message,
            risks: $message,
            keyQuotes: [],
        );
    }
}
