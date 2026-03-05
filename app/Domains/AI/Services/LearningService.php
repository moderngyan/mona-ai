<?php

namespace App\Domains\AI\Services;

use App\Models\MemoryEmbedding;
use App\Models\LearnedKnowledge;
use App\Domains\AI\Jobs\ProcessMemoryEmbedding;
use App\Domains\AI\Jobs\ProcessKnowledgeExtraction;
use Illuminate\Support\Collection;

class LearningService
{
    public function __construct(
        protected MemoryRetrievalService $retrievalService,
        protected EmbeddingService $embeddingService,
        protected KnowledgeExtractionService $extractionService
    ) {}

    /**
     * Entry point: Learn from a new user message.
     */
    public function learn(int $tenantId, int $userId, int $conversationId, string $message): void
    {
        // 1. Queue semantic embedding generation
        ProcessMemoryEmbedding::dispatch($tenantId, $userId, $conversationId, $message);

        // 2. Queue asynchronous knowledge extraction
        ProcessKnowledgeExtraction::dispatch($tenantId, [
            ['role' => 'user', 'content' => $message]
        ]);
    }

    /**
     * Enhanced System Prompt Builder.
     */
    public function getEnhancedSystemPrompt(int $tenantId, int $userId, string $query): string
    {
        // 1. Retrieve Semantic Memories (Similarity Search)
        $memories = $this->retrievalService->retrieve($tenantId, $userId, $query, 5);
        
        // 2. Retrieve Structured Knowledge (Tenant-level)
        $knowledge = LearnedKnowledge::where('tenant_id', $tenantId)->get();

        $prompt = "ADAPTIVE KNOWLEDGE & MEMORY:\n";

        if ($knowledge->count() > 0) {
            $prompt .= "--- LEARNED KNOWLEDGE ---\n";
            foreach ($knowledge as $item) {
                $prompt .= "- {$item->key}: {$item->value}\n";
            }
        }

        if ($memories->count() > 0) {
            $prompt .= "--- CONTEXTUAL MEMORIES ---\n";
            foreach ($memories as $memory) {
                // Limit memory snippets
                $prompt .= "- [" . $memory->created_at->diffForHumans() . "] " . substr($memory->content, 0, 200) . "...\n";
            }
        }

        $prompt .= "\nUse the above information to provide highly personalized responses.\n";

        return $prompt;
    }
}
