<?php

namespace App\Domains\AI\Services;

use App\Models\MemoryEmbedding;
use App\Models\Tenant;
use Illuminate\Support\Collection;

class MemoryRetrievalService
{
    public function __construct(protected EmbeddingService $embeddingService) {}

    /**
     * Retrieve relevant memories for a query text within a tenant's context.
     */
    public function retrieve(int $tenantId, int $userId, string $query, int $limit = 5): Collection
    {
        $queryEmbedding = $this->embeddingService->generate($query);
        
        if (empty($queryEmbedding)) {
            return collect([]);
        }

        // Fetch candidates for the tenant (and optionally user)
        // In a real production environment with millions of rows, use a Vector DB like pgvector or Qdrant.
        // For local development and smaller datasets, we calculate similarity in PHP.
        $candidates = MemoryEmbedding::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->get();

        return $candidates->map(function ($memory) use ($queryEmbedding) {
            $memory->similarity = $this->embeddingService->cosineSimilarity(
                $queryEmbedding,
                $memory->embedding
            );
            return $memory;
        })
        ->sortByDesc('similarity')
        ->take($limit)
        ->values();
    }
}
