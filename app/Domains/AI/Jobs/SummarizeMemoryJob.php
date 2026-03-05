<?php

namespace App\Domains\AI\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\MemoryEmbedding;
use App\Domains\AI\Services\ProviderManager;

class SummarizeMemoryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected int $tenantId) {}

    public function handle(ProviderManager $manager): void
    {
        // Fetch all memories for the tenant
        $memories = MemoryEmbedding::where('tenant_id', $this->tenantId)
            ->where('importance_score', '<', 0.5)
            ->where('created_at', '<', now()->subDays(30)) // Summarize older ones
            ->get();

        if ($memories->count() > 10) {
            $textToSummarize = $memories->pluck('content')->implode("\n\n");
            
            $prompt = "Summarize the following memories into a concise set of facts and key observations.
            Return a JSON array of strings.
            
            Memories: " . $textToSummarize;

            try {
                $provider = $manager->driver('ollama'); 
                $response = $provider->generateResponse([
                    ['role' => 'system', 'content' => "You are a memory compression engine."],
                    ['role' => 'user', 'content' => $prompt]
                ], ['model' => 'llama3.2', 'format' => 'json']);

                $summaries = json_decode($response['content'], true);

                if (is_array($summaries)) {
                    // Store back as new compressed memories? No, let's just log or store in structured knowledge?
                    // For now, we'll store them as single higher-importance compressed memories.
                    foreach ($summaries as $summary) {
                        MemoryEmbedding::create([
                            'tenant_id' => $this->tenantId,
                            'user_id' => 0, // System user or shared? Let's use 0 for system-level summary
                            'content' => "COMPRESSED MEMORY: " . $summary,
                            'embedding' => [], // Need embedding for this? Yes, but will have to be generated
                            'importance_score' => 0.8, // High importance
                        ]);
                    }

                    // Delete old ones
                    MemoryEmbedding::whereIn('id', $memories->pluck('id'))->delete();
                }
            } catch (\Exception $e) {
                \Log::error("Memory summarization failed: " . $e->getMessage());
            }
        }
    }
}
