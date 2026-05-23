<?php

namespace Tests\Feature\Assistant;

use Tests\TestCase;

class SentimentAssetsTest extends TestCase
{
    public function test_sentiment_catalog_images_exist(): void
    {
        $path = base_path('content/assistant/sentiments.json');
        $this->assertFileExists($path);

        $sentiments = json_decode((string) file_get_contents($path), true);
        $this->assertIsArray($sentiments);
        $this->assertCount(10, $sentiments);

        foreach ($sentiments as $entry) {
            $publicPath = public_path(ltrim($entry['image'], '/'));
            $this->assertFileExists($publicPath, "Missing image for {$entry['id']}");
        }
    }
}
