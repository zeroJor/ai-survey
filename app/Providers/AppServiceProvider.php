<?php

namespace App\Providers;

use App\Contracts\LlmClient;
use App\Services\Llm\GeminiFlashLlmClient;
use App\Services\Llm\LlmGateway;
use App\Services\Llm\TemplateLlmClient;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TemplateLlmClient::class);
        $this->app->singleton(GeminiFlashLlmClient::class);
        $this->app->singleton(LlmClient::class, LlmGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
