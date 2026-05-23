<?php

namespace Tests\Unit\Services\Interview;

use App\Services\Interview\SentimentResolver;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SentimentResolverTest extends TestCase
{
    #[Test]
    public function random_returns_catalog_sentiment_ids(): void
    {
        $resolver = new SentimentResolver;
        $valid = [
            'atenta', 'smile', 'think', 'nod', 'sorprendida',
            'complice', 'risa', 'seria', 'enSerio', 'sarcasmo',
        ];

        for ($i = 0; $i < 30; $i++) {
            $this->assertContains($resolver->random(), $valid);
        }
    }
}
