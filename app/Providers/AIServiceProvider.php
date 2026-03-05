<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\AI\Services\ProviderManager;
use App\Domains\AI\Providers\OllamaProvider;

class AIServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(ProviderManager::class, function ($app) {
            $manager = new ProviderManager();
            $manager->registerProvider('ollama', new OllamaProvider(config('services.ollama.base_url', 'http://localhost:11434')));
            return $manager;
        });

        $this->app->singleton(\App\Domains\AI\Services\EmbeddingService::class);
        $this->app->singleton(\App\Domains\AI\Services\MemoryRetrievalService::class);
        $this->app->singleton(\App\Domains\AI\Services\KnowledgeExtractionService::class);
        $this->app->singleton(\App\Domains\AI\Services\LearningService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
