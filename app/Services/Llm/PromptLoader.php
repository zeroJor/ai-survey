<?php

namespace App\Services\Llm;

class PromptLoader
{
    public function load(string $relativePath): string
    {
        $path = base_path('content/prompts/'.$relativePath);

        if (! is_file($path)) {
            return '';
        }

        return trim((string) file_get_contents($path));
    }

    public function sentimentIdList(): string
    {
        $path = base_path('content/assistant/sentiments.json');

        if (! is_file($path)) {
            return 'atenta, smile, think, nod, sorprendida, complice, risa, seria, enSerio, sarcasmo';
        }

        $items = json_decode((string) file_get_contents($path), true);

        if (! is_array($items)) {
            return 'atenta';
        }

        $ids = array_map(
            fn (array $row) => $row['id'] ?? '',
            array_filter($items, 'is_array'),
        );

        return implode(', ', array_filter($ids));
    }
}
