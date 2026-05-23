<?php

namespace App\Services\Interview;

class SentimentResolver
{
    /** @var list<string> */
    private const VALID_IDS = [
        'atenta',
        'smile',
        'think',
        'nod',
        'sorprendida',
        'complice',
        'risa',
        'seria',
        'enSerio',
        'sarcasmo',
    ];

    public function resolve(bool $skipped, string $answerBody): string
    {
        if ($skipped || trim($answerBody) === '') {
            return 'atenta';
        }

        $text = mb_strtolower($answerBody);

        if (preg_match('/\b(jaja|jeje|lol)\b/u', $text)) {
            return 'risa';
        }

        if (preg_match('/\b(en serio|de verdad|no mames)\b/u', $text)) {
            return 'enSerio';
        }

        if (preg_match('/\b(claro que sí|qué maravilla|ya basta)\b/u', $text)) {
            return 'sarcasmo';
        }

        if (preg_match('/\b(obvio|la neta|ándale)\b/u', $text)) {
            return 'complice';
        }

        if (preg_match('/\b(no sé|tal vez|quizá|quizás)\b/u', $text)) {
            return 'think';
        }

        if (preg_match('/\b(sí|ok|de acuerdo)\b/u', $text) && mb_strlen($text) < 40) {
            return 'nod';
        }

        if (preg_match('/\b\d{2,}\b/u', $text) || preg_match('/\b(increíble|wow|años)\b/u', $text)) {
            return 'sorprendida';
        }

        if (preg_match('/\b(gracias|encanta|orgullo|feliz|amor)\b/u', $text)) {
            return 'smile';
        }

        if (mb_strlen($text) > 280) {
            return 'think';
        }

        return 'seria';
    }

    public function normalize(?string $sentimentId): string
    {
        if ($sentimentId !== null && in_array($sentimentId, self::VALID_IDS, true)) {
            return $sentimentId;
        }

        return 'atenta';
    }

    /** Random portrait for template micro-replies (prototype-style variety). */
    public function random(): string
    {
        return self::VALID_IDS[random_int(0, count(self::VALID_IDS) - 1)];
    }
}
