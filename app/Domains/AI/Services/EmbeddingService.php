<?php

namespace App\Domains\AI\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class EmbeddingService
{
    protected string $baseUrl;
    protected string $model;

    public function __construct()
    {
        $this->baseUrl = config('services.ollama.base_url', 'http://localhost:11434');
        // Default embedding model for Ollama
        $this->model = config('services.ollama.embedding_model', 'nomic-embed-text');
    }

    /**
     * Generate embedding for a given text.
     */
    public function generate(string $text): array
    {
        try {
            $response = Http::post("{$this->baseUrl}/api/embeddings", [
                'model' => $this->model,
                'prompt' => $text,
            ]);

            if ($response->failed()) {
                throw new Exception("Ollama embedding generation failed: " . $response->body());
            }

            return $response->json('embedding');
        } catch (Exception $e) {
            \Log::error("Embedding generation error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Calculate cosine similarity between two vectors.
     */
    public function cosineSimilarity(array $vecA, array $vecB): float
    {
        $dotProduct = 0;
        $normA = 0;
        $normB = 0;

        for ($i = 0; $i < count($vecA); $i++) {
            $dotProduct += $vecA[$i] * $vecB[$i];
            $normA += $vecA[$i] * $vecA[$i];
            $normB += $vecB[$i] * $vecB[$i];
        }

        if ($normA == 0 || $normB == 0) return 0;

        return $dotProduct / (sqrt($normA) * sqrt($normB));
    }
}
