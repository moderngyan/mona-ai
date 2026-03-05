<?php

namespace App\Domains\AI\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Domains\AI\Services\EmbeddingService;
use App\Models\MemoryEmbedding;

class ProcessMemoryEmbedding implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected int $tenantId,
        protected int $userId,
        protected int $conversationId,
        protected string $message
    ) {}

    /**
     * Generate and store embedding for a new message.
     */
    public function handle(EmbeddingService $embeddingService): void
    {
        $embedding = $embeddingService->generate($this->message);

        if (!empty($embedding)) {
            MemoryEmbedding::create([
                'tenant_id' => $this->tenantId,
                'user_id' => $this->userId,
                'content' => $this->message,
                'embedding' => $embedding,
                'source_conversation_id' => $this->conversationId,
                'importance_score' => $this->calculateImportance($this->message),
            ]);
        }
    }

    /**
     * Simple importance scoring algorithm.
     */
    protected function calculateImportance(string $text): float
    {
        $score = 0.5; // Neutral
        
        // Boost if it's longer
        if (strlen($text) > 300) $score += 0.2;
        
        // Boost if it's explicitly instruction-like or contains "I am", "I prefer"
        $indicators = ['I am', 'I prefer', 'my project', 'remember this', 'note:'];
        foreach ($indicators as $indicator) {
            if (stripos($text, $indicator) !== false) {
                $score += 0.1;
            }
        }

        // Boost if it contains bullet points (structured data)
        if (preg_match('/[\-\*] .+\n/m', $text)) {
            $score += 0.1;
        }

        return min($score, 1.0);
    }
}
