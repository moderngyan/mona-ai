<?php

namespace App\Domains\AI\Jobs;

use App\Models\MemoryEmbedding;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class MemoryCleanupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Periodically forget low-importance, old memories.
     * Enforce tenant-level limits.
     */
    public function handle(): void
    {
        // 1. Delete expired or irrelevant low-importance memories
        MemoryEmbedding::where('importance_score', '<', 0.2)
            ->where('created_at', '<', now()->subMonths(3))
            ->delete();

        // 2. Enforce Max Capacity (Example: 2000 vectors per tenant)
        $tenantIds = MemoryEmbedding::distinct()->pluck('tenant_id');
        
        foreach ($tenantIds as $tenantId) {
            $count = MemoryEmbedding::where('tenant_id', $tenantId)->count();
            if ($count > 2000) {
                // Delete oldest lowest-importance ones
                MemoryEmbedding::where('tenant_id', $tenantId)
                    ->orderBy('importance_score', 'asc')
                    ->orderBy('created_at', 'asc')
                    ->take($count - 2000)
                    ->delete();
            }
        }
    }
}
