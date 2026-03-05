<?php

namespace App\Domains\AI\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Domains\AI\Services\KnowledgeExtractionService;

class ProcessKnowledgeExtraction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected int $tenantId,
        protected array $messages
    ) {}

    /**
     * Use AI to extract structured knowledge.
     */
    public function handle(KnowledgeExtractionService $extractionService): void
    {
        $extractionService->extract($this->tenantId, $this->messages);
    }
}
