<?php

namespace App\Domains\AI\Providers;

use App\Domains\AI\Interfaces\AIProviderInterface;
use Illuminate\Support\Facades\Http;

class OllamaProvider implements AIProviderInterface
{
    protected $baseUrl;

    public function __construct(string $baseUrl = 'http://ollama:11434')
    {
        $this->baseUrl = $baseUrl;
    }

    public function getModels(): array
    {
        try {
            $response = Http::timeout(3)->get("{$this->baseUrl}/api/tags");
            return $response->json('models') ?? [];
        } catch (\Exception $e) {
            return [];
        }
    }

    public function generateResponse(array $messages, array $options = []): array
    {
        try {
            $response = Http::timeout(60)->post("{$this->baseUrl}/api/chat", [
                'model' => $options['model'] ?? 'tinyllama',
                'messages' => $messages,
                'stream' => false,
                'options' => [
                    'temperature' => $options['temperature'] ?? 0.7,
                    'num_predict' => $options['max_tokens'] ?? 1024,
                ]
            ]);

            if ($response->failed()) {
                throw new \Exception("Ollama Engine returned error code: " . $response->status());
            }

            return [
                'content' => $response->json('message.content') ?? 'Error: Empty response from Neural Core.',
                'tokens' => ($response->json('prompt_eval_count') ?? 0) + ($response->json('eval_count') ?? 0),
            ];
        } catch (\Exception $e) {
            return [
                'content' => 'System Alert: AI Provider communication failure. Details: ' . $e->getMessage(),
                'tokens' => 0
            ];
        }
    }

    public function generateStreamingResponse(array $messages, array $options = []): iterable
    {
        $payload = [
            'model' => $options['model'] ?? 'tinyllama',
            'messages' => $messages,
            'stream' => true,
            'options' => [
                'temperature' => $options['temperature'] ?? 0.7,
                'num_predict' => $options['max_tokens'] ?? 1024,
            ]
        ];

        // Use Guzzle or raw stream for real-time SSE
        $stream = fopen("{$this->baseUrl}/api/chat", 'r', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode($payload),
                'timeout' => 120
            ]
        ]));

        if (!$stream) {
            yield "System Error: Neural Link Offline.";
            return;
        }

        while (!feof($stream)) {
            $line = fgets($stream);
            if ($line) {
                $data = json_decode($line, true);
                if (isset($data['message']['content'])) {
                    // Yield character by character for typewriter effect
                    $token = $data['message']['content'];
                    $chars = mb_str_split($token);
                    foreach ($chars as $char) {
                        yield $char;
                    }
                }
                if (isset($data['done']) && $data['done']) {
                    break;
                }
            }
        }

        fclose($stream);
    }
}
