<?php

namespace App\Domains\AI\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebSearchService
{
    /**
     * Perform a web search and return formatted context for the AI.
     */
    public function search(string $query): array
    {
        Log::info("Mona AI searching for: " . $query);

        // Try a public search engine or a simulation if no API key
        $apiKey = config('services.serper.key'); // Example provider: Serper.dev

        if ($apiKey) {
            try {
                $response = Http::withHeaders([
                    'X-API-KEY' => $apiKey,
                    'Content-Type' => 'application/json'
                ])->post('https://google.serper.dev/search', [
                    'q' => $query,
                    'num' => 5
                ]);

                if ($response->successful()) {
                    $results = $response->json('organic') ?? [];
                    return $this->formatResults($results);
                }
            } catch (\Exception $e) {
                Log::error("Search API Error: " . $e->getMessage());
            }
        }

        // Fallback or Simulation for demo purposes if no key
        return $this->simulatedSearch($query);
    }

    protected function formatResults(array $results): array
    {
        $context = "SEARCH RESULTS:\n";
        $sources = [];

        foreach ($results as $res) {
            $title = $res['title'] ?? 'No Title';
            $snippet = $res['snippet'] ?? '';
            $link = $res['link'] ?? '';
            $site = parse_url($link, PHP_URL_HOST) ?? 'Web';
            
            $context .= "- [{$site}] {$title}: {$snippet}\n";
            $sources[] = ['title' => $title, 'url' => $link, 'site' => $site];
        }

        return [
            'context' => $context,
            'sources' => $sources
        ];
    }

    protected function simulatedSearch(string $query): array
    {
        // A placeholder logic for simulation when no API key is set
        return [
            'context' => "SEARCH RESULTS (SIMULATED):\n- [Wikipedia] {$query}: This is relevant info based on historical data.\n- [News] Latest on {$query}: Recent developments show growth in this sector.\n",
            'sources' => [
                ['title' => "Wikipedia: {$query}", 'url' => 'https://en.wikipedia.org', 'site' => 'wikipedia.org'],
                ['title' => "Industry Insights on {$query}", 'url' => 'https://example.com', 'site' => 'industry.com'],
            ]
        ];
    }
}
