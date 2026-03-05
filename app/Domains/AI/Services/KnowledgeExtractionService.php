<?php

namespace App\Domains\AI\Services;

use App\Domains\AI\Services\ProviderManager;
use App\Models\LearnedKnowledge;
use Illuminate\Support\Facades\Log;

class KnowledgeExtractionService
{
    public function __construct(protected ProviderManager $manager) {}

    /**
     * Use AI to extract structured knowledge from a given message/conversation history.
     */
    public function extract(int $tenantId, array $messages): void
    {
        $prompt = "Analyze the following message(s) and extract core user preferences, project details, coding patterns, or recurring business context.
        Return strictly in JSON array of objects with keys 'key', 'value', and 'confidence' (0.0 to 1.0).
        If no new information is present, return an empty array.
        Examples: 
        - [{\"key\": \"primary_language\", \"value\": \"Python\", \"confidence\": 1.0}]
        - [{\"key\": \"business_domain\", \"value\": \"SaaS Intelligence\", \"confidence\": 0.9}]
        
        Conversations: " . json_encode($messages);

        try {
            // Use the tenant's default provider/model or a specific extraction model
            $provider = $this->manager->driver('ollama'); 
            $response = $provider->generateResponse([
                ['role' => 'system', 'content' => "You are an intelligent knowledge extraction engine. You extract structured knowledge into JSON format."],
                ['role' => 'user', 'content' => $prompt]
            ], [
                'model' => 'llama3.2', 
                'format' => 'json'
            ]);

            $extracted = json_decode($response['content'], true);

            if (is_array($extracted)) {
                $this->storeKnowledge($tenantId, $extracted);
            }
        } catch (\Exception $e) {
            Log::error("Knowledge extraction failed: " . $e->getMessage());
        }
    }

    /**
     * Store or update learned knowledge for a tenant.
     */
    protected function storeKnowledge(int $tenantId, array $items): void
    {
        foreach ($items as $item) {
            LearnedKnowledge::updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'key' => $item['key']
                ],
                [
                    'value' => $item['value'],
                    'confidence_score' => $item['confidence'] ?? 0.5,
                ]
            );
        }
    }
}
